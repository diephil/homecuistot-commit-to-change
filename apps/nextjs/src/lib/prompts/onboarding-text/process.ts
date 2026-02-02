import type { IngredientExtractionResponse } from "@/types/onboarding";
import { ingredientExtractorAgent } from "@/lib/agents/ingredient-extractor/agent";
import { createAgentTrace, getOpikClient } from "@/lib/tracing/opik-agent";

/**
 * T012: Updated process for ingredient-only extraction
 * Spec: specs/019-onboarding-revamp/contracts/api.md
 */

interface ProcessTextInputParams {
  text: string;
  currentContext: {
    ingredients: string[];
  };
}

export async function processTextInput(
  params: ProcessTextInputParams,
): Promise<IngredientExtractionResponse> {
  const { text, currentContext } = params;

  const traceCtx = createAgentTrace({
    name: "onboarding-text-input",
    input: { text, currentIngredients: currentContext.ingredients },
    tags: ["onboarding", "text-input", "ingredient-extraction"],
    metadata: {
      inputType: "text",
      domain: "onboarding",
    },
  });

  try {
    const result = await ingredientExtractorAgent({
      text,
      currentIngredients: currentContext.ingredients,
      parentTrace: traceCtx.trace,
      opikClient: getOpikClient(),
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
