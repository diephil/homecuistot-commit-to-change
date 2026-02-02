/**
 * Recipe Manager Agent Proposal with Opik Tracing
 *
 * Processes voice/text input via ADK RecipeAgent with full observability.
 * Creates traces with spans for audio transcription, model calls, and tool calls.
 * Adds "unrecognized_item" tag if any ingredient names don't match database.
 */

import { InMemoryRunner, createEvent } from "@google/adk";
import type { Span } from "opik";
import YAML from "yaml";
import { createAgentTrace, extractAdkUsage } from "@/lib/tracing/opik-agent";
import { createRecipeManagerAgent } from "../agents/recipe-manager/agent";
import { voiceTranscriptorAgent } from "../agents/voice-transcriptor/agent";
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
  model?: string;
  provider?: string;
}

interface CreateRecipeProposalResult {
  proposal: RecipeManagerProposal;
  transcribedText?: string;
  assistantResponse?: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export async function createRecipeManagerAgentProposal(
  params: CreateRecipeProposalParams,
): Promise<CreateRecipeProposalResult> {
  const {
    userId,
    input,
    audioBase64,
    trackedRecipes,
    model = "gemini-2.0-flash",
    provider = "google",
  } = params;
  const inputType = audioBase64 ? "voice" : "text";

  // Base tags for trace (mutable for enrichment)
  const traceTags = [
    "orchestration",
    "recipe_update",
    inputType,
    model,
    `user:${userId}`,
  ];

  // 1. Create parent trace
  const traceCtx = createAgentTrace({
    name: "recipe-manager-agent",
    input: { inputType, trackedRecipesCount: trackedRecipes.length },
    tags: traceTags,
    metadata: {
      userId,
      model,
      provider,
      trackedRecipes,
    },
  });

  try {
    let textInput: string;

    // 2. Audio transcription via voice-transcriptor agent
    if (audioBase64) {
      const { text } = await voiceTranscriptorAgent({
        audioBase64,
        parentTrace: traceCtx.trace,
      });
      textInput = text;
    } else {
      textInput = input!.trim();
    }

    // 3. Create agent + session
    const APP_NAME = "recipe_manager";
    const agent = createRecipeManagerAgent({ opikTrace: traceCtx.trace });
    const runner = new InMemoryRunner({ agent, appName: APP_NAME });
    const session = await runner.sessionService.createSession({
      appName: APP_NAME,
      userId,
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
    let lastAssistantMessageEvent: string | null = null;
    const usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    // Track pending tool spans by call ID (supports parallel tool calls to same function)
    // Also track by function name as fallback when ADK doesn't provide IDs
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

      // Process parts for tool spans and result extraction
      if (event.content?.parts && event.content.role !== "model") {
        for (const part of event.content.parts) {
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
            // Extract recipe result from response
            const response = part.functionResponse.response;
            if (
              response &&
              typeof response === "object" &&
              "operation" in response
            ) {
              const result = response as unknown as RecipeToolResult;
              recipes.push(result);
            }
          }

          // Capture text response when no function call (rejection/response message)
          if ("text" in part && part.text && typeof part.text === "string") {
            lastAssistantMessageEvent = part.text;
          }
        }
      }

      if (event.content?.parts && event.content.role === "model") {
        const modelResponse = event.content.parts[0];
        if (modelResponse.text) {
          lastAssistantMessageEvent = modelResponse.text;
        }
      }
    }

    if (currentModelSpan) {
      currentModelSpan.end();
      currentModelSpan = null;
    }

    const proposal: RecipeManagerProposal = {
      recipes,
      noChangesDetected: recipes.length === 0,
    };

    traceCtx.end();
    await traceCtx.flush();

    return {
      proposal,
      transcribedText: audioBase64 ? textInput : undefined,
      assistantResponse: lastAssistantMessageEvent ?? undefined,
      usage,
    };
  } catch (error) {
    traceCtx.trace.update({ output: { error: String(error) } });
    traceCtx.end();
    await traceCtx.flush();
    throw error;
  }
}
