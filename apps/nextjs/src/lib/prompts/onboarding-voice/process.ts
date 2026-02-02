import type { IngredientExtractionResponse } from "@/types/onboarding";
import { ingredientExtractorAgent } from "@/lib/agents/ingredient-extractor/agent";
import { createAgentTrace } from "@/lib/tracing/opik-agent";

/**
 * T010: Updated process for ingredient-only extraction
 * Spec: specs/019-onboarding-revamp/contracts/api.md
 */

interface ProcessVoiceInputParams {
  audioBase64: string;
  currentContext: {
    ingredients: string[];
  };
}

export async function processVoiceInput(
  params: ProcessVoiceInputParams,
): Promise<IngredientExtractionResponse> {
  const { audioBase64, currentContext } = params;

  const traceCtx = createAgentTrace({
    name: "onboarding-voice-input",
    input: { audioSize: audioBase64.length, currentIngredients: currentContext.ingredients },
    tags: ["onboarding", "voice-input", "ingredient-extraction"],
    metadata: {
      inputType: "voice",
      domain: "onboarding",
    },
  });

  try {
    const result = await ingredientExtractorAgent({
      audioBase64,
      currentIngredients: currentContext.ingredients,
      parentTrace: traceCtx.trace,
    });

    traceCtx.trace.update({ output: result });
    traceCtx.end();
    await traceCtx.flush();

    return result;
  } catch (error) {
    traceCtx.trace.update({ output: { error: String(error) } });
    traceCtx.end();
    await traceCtx.flush();
    throw error;
  }
}
