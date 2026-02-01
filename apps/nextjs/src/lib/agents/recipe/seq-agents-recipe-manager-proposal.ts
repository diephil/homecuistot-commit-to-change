/**
 * Recipe Manager Agent Proposal with Opik Tracing
 *
 * Processes voice/text input via ADK RecipeAgent with full observability.
 * Creates traces with spans for audio transcription, model calls, and tool calls.
 * Adds "unrecognized_item" tag if any ingredient names don't match database.
 */

import { GoogleGenAI } from "@google/genai";
import { trackGemini } from "opik-gemini";
import { InMemoryRunner, createEvent } from "@google/adk";
import type { Span } from "opik";
import YAML from "yaml";
import { createAgentTrace, extractAdkUsage } from "@/lib/tracing/opik-agent";
import { createRecipeManagerAgent } from "./agent";
import type {
  RecipeSessionItem,
  RecipeManagerProposal,
  RecipeToolResult,
} from "@/types/recipe-agent";

interface CreateRecipeProposalParams {
  userId: string;
  input?: string;
  audioBase64?: string;
  trackedRecipes: RecipeSessionItem[];
}

interface CreateRecipeProposalResult {
  proposal: RecipeManagerProposal;
  transcribedText?: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export async function createRecipeManagerAgentProposal(
  params: CreateRecipeProposalParams
): Promise<CreateRecipeProposalResult> {
  const { userId, input, audioBase64, trackedRecipes } = params;
  const inputType = audioBase64 ? "voice" : "text";

  // Base tags for trace (mutable for enrichment)
  const traceTags = [
    "recipe",
    "agent",
    inputType,
    "gemini-2.0-flash",
    `user:${userId}`,
  ];

  // 1. Create parent trace
  const traceCtx = createAgentTrace({
    name: "recipe-manager-agent",
    input: { inputType, trackedRecipesCount: trackedRecipes.length },
    tags: traceTags,
    metadata: {
      userId,
      model: "gemini-2.0-flash",
      provider: "google",
      trackedRecipes,
    },
  });

  // Track if we find unrecognized items
  let hasUnrecognizedItems = false;

  try {
    let textInput: string;

    // 2. Audio transcription with opik-gemini tracking
    if (audioBase64) {
      const genAI = new GoogleGenAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
      });

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
                text: "Transcribe this audio exactly as spoken. Return only the transcription, no additional text. The user should be speaking about food or recipes. If they speak another language than English, translate what they say into english. Remove filling words, hesitations, while preserving the initial intent of the user. \nIMPORTANT NOTE: If nothing is heard in the audio, return an empty string. PRESERVE THE ORIGINAL INTENT OF THE USER, if nothing is heard, DO NOT INVENT CONTENT AND RETURN AN EMPTY STRING.",
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
    const agent = createRecipeManagerAgent();
    const runner = new InMemoryRunner({ agent, appName: "recipe_manager" });
    const session = await runner.sessionService.createSession({
      userId,
      appName: "recipe_manager",
      state: { trackedRecipes },
    });

    // Inject tracked recipes context as YAML into conversation
    const recipesYaml = YAML.stringify({ trackedRecipes });
    await runner.sessionService.appendEvent({
      session,
      event: createEvent({
        author: "user",
        content: {
          role: "user",
          parts: [
            {
              text: `Here are the user's current tracked recipes:\n\n${recipesYaml}`,
            },
          ],
        },
      }),
    });

    // 4. Run agent with model and tool spans
    const recipes: RecipeToolResult[] = [];
    const usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    // Track pending tool spans by call ID (supports parallel tool calls to same function)
    // Also track by function name as fallback when ADK doesn't provide IDs
    const pendingToolSpansById = new Map<string, Span>();
    const pendingToolSpansByName = new Map<string, Span[]>();
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
        modelCallCount++;
        modelSpanStartTime = new Date();
        currentModelSpan = traceCtx.createLlmSpan({
          name: `adk-model-call-${modelCallCount}`,
          input: { message: textInput },
          model: "gemini-2.0-flash",
          startTime: modelSpanStartTime,
        });
        const eventUsage = extractAdkUsage(event.usageMetadata);
        usage.promptTokens += eventUsage.prompt_tokens;
        usage.completionTokens += eventUsage.completion_tokens;
        usage.totalTokens += eventUsage.total_tokens;

        currentModelSpan.update({
          output: {
            parts: event.content?.parts?.map((p) =>
              "text" in p
                ? { text: p.text }
                : "functionCall" in p
                  ? { functionCall: { name: p.functionCall?.name, args: p.functionCall?.args } }
                  : {}
            ),
          },
          usage: eventUsage,
        });
      }

      // Process parts for tool spans and result extraction
      if (event.content?.parts) {
        for (const part of event.content.parts) {
          // Tool call span - starts on functionCall
          // Use call ID to uniquely identify each tool invocation
          if ("functionCall" in part && part.functionCall && part.functionCall.name) {
            // End model span before starting tool spans
            if (currentModelSpan) {
              currentModelSpan.end();
              currentModelSpan = null;
            }
            const funcCall = part.functionCall as { id?: string; name: string; args?: unknown };
            const funcName = funcCall.name;
            // Tool span starts after model span (add 1ms offset to ensure ordering)
            const toolStartTime = modelSpanStartTime
              ? new Date(modelSpanStartTime.getTime() + 1)
              : new Date();
            const toolSpan = traceCtx.createToolSpan({
              name: `adk-tool-call-${funcName}`,
              input: {
                callId: funcCall.id,
                functionName: funcName,
                args: funcCall.args,
              },
              startTime: toolStartTime,
            });
            // Store by ID if available, otherwise by name (FIFO queue for same-name calls)
            if (funcCall.id) {
              pendingToolSpansById.set(funcCall.id, toolSpan);
            }
            // Always store by name as fallback
            const nameQueue = pendingToolSpansByName.get(funcName) ?? [];
            nameQueue.push(toolSpan);
            pendingToolSpansByName.set(funcName, nameQueue);
          }

          // Tool call span - ends on functionResponse
          // Match by call ID first, fall back to function name (FIFO)
          if ("functionResponse" in part && part.functionResponse && part.functionResponse.name) {
            const funcResp = part.functionResponse as { id?: string; name: string; response?: Record<string, unknown> };
            const funcName = funcResp.name;

            // Try to match by ID first
            let toolSpan = funcResp.id ? pendingToolSpansById.get(funcResp.id) : null;
            if (toolSpan && funcResp.id) {
              pendingToolSpansById.delete(funcResp.id);
            } else {
              // Fall back to name-based FIFO matching
              const nameQueue = pendingToolSpansByName.get(funcName);
              if (nameQueue && nameQueue.length > 0) {
                toolSpan = nameQueue.shift()!;
                if (nameQueue.length === 0) {
                  pendingToolSpansByName.delete(funcName);
                }
              }
            }

            if (toolSpan) {
              toolSpan.update({
                output: funcResp.response as Record<string, unknown>,
              });
              toolSpan.end();
            }

            // Extract recipe result from response
            const response = part.functionResponse.response;
            if (
              response &&
              typeof response === "object" &&
              "operation" in response
            ) {
              const result = response as unknown as RecipeToolResult;
              recipes.push(result);

              // Check for unrecognized items (delete operations don't have unrecognized)
              if (
                "unrecognized" in result &&
                result.unrecognized &&
                result.unrecognized.length > 0
              ) {
                hasUnrecognizedItems = true;
              }
            }
          }
        }
      }

      // End model span if no functionCall was triggered
      if (currentModelSpan && pendingToolSpansById.size === 0 && pendingToolSpansByName.size === 0) {
        currentModelSpan.end();
        currentModelSpan = null;
      }
    }

    // Clean up remaining spans
    if (currentModelSpan) {
      currentModelSpan.end();
    }
    // End any pending tool spans that didn't receive responses
    for (const span of pendingToolSpansById.values()) {
      span.end();
    }
    for (const spans of pendingToolSpansByName.values()) {
      for (const span of spans) {
        span.end();
      }
    }
    pendingToolSpansById.clear();
    pendingToolSpansByName.clear();

    // 5. Build final proposal
    const proposal: RecipeManagerProposal = {
      recipes,
      noChangesDetected: recipes.length === 0,
    };

    // Collect all unrecognized items (delete operations don't have unrecognized)
    const allUnrecognizedItems = recipes.flatMap((r) =>
      "unrecognized" in r ? r.unrecognized : []
    );
    const uniqueUnrecognizedItems = [...new Set(allUnrecognizedItems)];

    // 6. Add unrecognized_item tag if needed
    if (hasUnrecognizedItems) {
      traceTags.push("unrecognized_item");
      traceCtx.trace.update({
        tags: traceTags,
        metadata: { unrecognizedItems: uniqueUnrecognizedItems },
      });
    }

    // 7. Set output and end trace
    traceCtx.trace.update({
      output: {
        recipes: proposal.recipes,
        noChangesDetected: proposal.noChangesDetected,
      },
    });
    traceCtx.end();
    await traceCtx.flush();

    return {
      proposal,
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
