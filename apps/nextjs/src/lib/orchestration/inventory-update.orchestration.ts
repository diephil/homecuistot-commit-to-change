/**
 * Inventory Manager Agent Proposal with Opik Tracing
 *
 * Processes voice/text input via ADK InventoryAgent with full observability.
 * Creates traces with spans for audio transcription, model calls, and tool calls.
 */

import { InMemoryRunner, isFinalResponse } from "@google/adk";
import type { Span } from "opik";
import { createAgentTrace, extractAdkUsage } from "@/lib/tracing/opik-agent";
import { createInventoryAgent } from "../agents/inventory-manager/agent";
import { voiceTranscriptorAgent } from "../agents/voice-transcriptor/agent";
import type { InventorySessionItem } from "../agents/inventory-manager/tools/update-matching-ingredients";
import type { InventoryUpdateProposal } from "@/types/inventory";

interface CreateProposalParams {
  userId: string;
  input?: string;
  audioBase64?: string;
  currentInventory: InventorySessionItem[];
  model: "gemini-2.0-flash" | "gemini-2.5-flash-lite";
  provider?: string;
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
  const {
    userId,
    input,
    audioBase64,
    currentInventory,
    model = "gemini-2.0-flash",
    provider = "google",
  } = params;
  const inputType = audioBase64 ? "voice" : "text";

  // Base tags for trace (mutable for enrichment)
  const traceTags = [
    "orchestration",
    "inventory_update",
    inputType,
    model,
    `user:${userId}`,
  ];

  // 1. Create parent trace with full inventory in metadata
  const traceCtx = createAgentTrace({
    name: "inventory-manager-agent",
    input: { inputType, inventorySize: currentInventory.length },
    tags: traceTags,
    metadata: {
      userId,
      model,
      provider,
      currentInventory,
    },
  });

  try {
    let textInput: string;

    // 2. Audio transcription via voice-transcriptor agent
    if (audioBase64) {
      const { text } = await voiceTranscriptorAgent({
        audioBase64,
        parentTrace: traceCtx.trace,
        userId,
      });
      textInput = text;
    } else {
      textInput = input!.trim();
    }

    // 3. Create agent + session
    const APP_NAME = "inventory_manager";
    const agent = createInventoryAgent({ userId, opikTrace: traceCtx.trace });
    const runner = new InMemoryRunner({ agent, appName: APP_NAME });
    const session = await runner.sessionService.createSession({
      userId,
      appName: APP_NAME,
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
          appName: APP_NAME,
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
          model,
          startTime: modelSpanStartTime,
          output: event as unknown as Record<string, unknown>,
          usage: eventUsage,
          tags: [APP_NAME, `user:${userId}`],
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
    const hasUnrecognized = finalProposal.unrecognized.length > 0;
    traceCtx.trace.update({
      output: {
        recognized: finalProposal.recognized,
        unrecognized: finalProposal.unrecognized,
      },
      metadata: hasUnrecognized
        ? { unrecognized: finalProposal.unrecognized }
        : {},
      tags: hasUnrecognized
        ? [...traceTags, "unrecognized_items"]
        : [...traceTags, "all_recognized"],
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
