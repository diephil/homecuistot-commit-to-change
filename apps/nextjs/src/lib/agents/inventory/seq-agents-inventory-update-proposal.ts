/**
 * Inventory Manager Agent Proposal with Opik Tracing
 *
 * Processes voice/text input via ADK InventoryAgent with full observability.
 * Creates traces with spans for audio transcription, model calls, and tool calls.
 */

import { GoogleGenAI } from "@google/genai";
import { trackGemini } from "opik-gemini";
import { InMemoryRunner, isFinalResponse } from "@google/adk";
import type { Span } from "opik";
import { createAgentTrace, extractAdkUsage } from "@/lib/tracing/opik-agent";
import { createInventoryAgent } from "./agent";
import type { InventorySessionItem } from "./tools/validate-ingredients";
import type { InventoryUpdateProposal } from "@/types/inventory";

interface CreateProposalParams {
  userId: string;
  input?: string;
  audioBase64?: string;
  currentInventory: InventorySessionItem[];
}

interface CreateProposalResult {
  proposal: InventoryUpdateProposal;
  transcribedText?: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export async function createInventoryManagerAgentProposal(
  params: CreateProposalParams,
): Promise<CreateProposalResult> {
  const { userId, input, audioBase64, currentInventory } = params;
  const inputType = audioBase64 ? "voice" : "text";

  // Base tags for trace (mutable for enrichment)
  const traceTags = [
    "inventory",
    "agent",
    inputType,
    "gemini-2.0-flash",
    `user:${userId}`,
  ];

  // 1. Create parent trace with full inventory in metadata
  const traceCtx = createAgentTrace({
    name: "inventory-manager-agent",
    input: { inputType, inventorySize: currentInventory.length },
    tags: traceTags,
    metadata: {
      userId,
      model: "gemini-2.0-flash",
      provider: "google",
      currentInventory,
    },
  });

  try {
    let textInput: string;

    // 2. Audio transcription using opik-gemini with parent linking
    if (audioBase64) {
      const genAI = new GoogleGenAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
      });

      // trackGemini with parent trace - auto-links span + tracks usage
      const trackedGenAI = trackGemini(genAI, {
        parent: traceCtx.trace,
        client: traceCtx.client,
        generationName: "audio-transcription",
        traceMetadata: {
          tags: ["transcription", "voice-input"],
        },
      });

      const response = await trackedGenAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "Transcribe this audio exactly as spoken. Return only the transcription, no additional text. The user should be speaking about food. If they speak another language than English, translate what they say into english. Remove filling words, hesitations, while preserving the initial intent of the user. \nIMPORTANT NOTE: If nothing is heard in the audio, return an empty string. PRESERVE THE ORIGINAL INTENT OF THE USER, if nothing is heard, DO NOT INVENT CONTENT AND RETURN AN EMPTY STRING.",
              },
              { inlineData: { mimeType: "audio/webm", data: audioBase64 } },
            ],
          },
        ],
      });

      await trackedGenAI.flush();
      textInput = response.text?.trim() ?? "";

      if (!textInput) {
        throw new Error("Could not transcribe audio");
      }
    } else {
      textInput = input!.trim();
    }

    // 3. Create agent + session
    const agent = createInventoryAgent({ userId, opikTrace: traceCtx.trace });
    const runner = new InMemoryRunner({ agent, appName: "inventory_manager" });
    const session = await runner.sessionService.createSession({
      userId,
      appName: "inventory_manager",
      state: { currentInventory },
    });

    // 4. Run agent with model and tool spans
    let proposal: InventoryUpdateProposal | null = null;
    const usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

    let currentModelSpan: Span | null = null;
    let modelCallCount = 0;

    for await (const event of runner.runAsync({
      userId,
      sessionId: session.id,
      newMessage: { role: "user", parts: [{ text: textInput }] },
    })) {
      // Model call span - when LLM responds (has usageMetadata)
      // Capture timestamp before processing to ensure model span starts before tool spans
      let modelSpanStartTime: Date | undefined;
      if (event.usageMetadata) {
        const currentSessionState = await runner.sessionService.getSession({
          appName: "inventory_manager",
          userId,
          sessionId: session.id,
        });
        modelCallCount++;
        modelSpanStartTime = new Date(event.timestamp);
        const eventUsage = extractAdkUsage(event.usageMetadata);
        usage.promptTokens += eventUsage.prompt_tokens;
        usage.completionTokens += eventUsage.completion_tokens;
        usage.totalTokens += eventUsage.total_tokens;
        currentModelSpan = traceCtx.createLlmSpan({
          name: `adk-model-call-${modelCallCount}`,
          input: { thread: currentSessionState?.events.slice(0, -1) },
          model: "gemini-2.0-flash",
          startTime: modelSpanStartTime,
          output: event as unknown as Record<string, unknown>,
          usage: eventUsage,
        });
      }

      // Process parts for tool spans and proposal extraction
      if (event.content?.parts) {
        for (const part of event.content.parts) {
          // Tool call span - starts on functionCall (child of model span)
          // Use call ID to uniquely identify each tool invocation
          if (
            "functionCall" in part &&
            part.functionCall &&
            part.functionCall.name
          ) {
            // End model span before starting tool spans
            if (currentModelSpan) {
              currentModelSpan.end();
              currentModelSpan = null;
            }
          }

          if (
            "functionResponse" in part &&
            part.functionResponse &&
            part.functionResponse.name
          ) {
            // Extract proposal from response
            const response = part.functionResponse.response;
            if (
              response &&
              typeof response === "object" &&
              "recognized" in response
            ) {
              proposal = response as unknown as InventoryUpdateProposal;
            }
          }

          // Fallback: parse JSON from text
          if ("text" in part && part.text && isFinalResponse(event)) {
            try {
              const parsed = JSON.parse(part.text);
              if (parsed.recognized !== undefined) {
                proposal = parsed as InventoryUpdateProposal;
              }
            } catch {
              // Not JSON
              console.error("Failed to parse JSON from text");
            }
          }
        }
      }

      // End model span if no functionCall was triggered in this event
      if (currentModelSpan) {
        currentModelSpan.end();
        currentModelSpan = null;
      }
    }

    // 5. Set output and end trace
    const finalProposal = proposal ?? { recognized: [], unrecognized: [] };
    traceCtx.trace.update({
      output: {
        recognized: finalProposal.recognized,
        unrecognized: finalProposal.unrecognized,
      },
    });
    traceCtx.end();
    await traceCtx.flush();

    return {
      proposal: finalProposal,
      transcribedText: audioBase64 ? textInput : undefined,
      usage,
    };
  } catch (error) {
    traceCtx.trace.update({ output: { error: String(error) } });
    traceCtx.end();
    await traceCtx.flush();
    throw error;
  }
}
