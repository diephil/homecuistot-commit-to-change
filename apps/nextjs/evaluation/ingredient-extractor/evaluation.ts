import { evaluate, EvaluationTask } from "opik";
import { DATASET, DatasetItem } from "./dataset";
import { ingredientExtractorAgent } from "@/lib/agents/ingredient-extractor/agent";
import { getOpikClient } from "@/lib/tracing/opik-agent";
import { StructureMatch, IngredientSetMatch } from "./metrics";
import { PROMPT } from "@/lib/agents/ingredient-extractor/prompt";

const MODEL = "gemini-2.5-flash-lite";
const llmTask: EvaluationTask<DatasetItem> = async (datasetItem) => {
  const { input, metadata } = datasetItem;
  const response = await ingredientExtractorAgent({
    currentIngredients: metadata.currentIngredients,
    text: input,
    model: MODEL,
  });

  return {
    output: response,
  };
};

export const evaluation = async (params: { nbSamples?: number }) => {
  const opikClient = getOpikClient();
  const retrievedDataset = await opikClient.getOrCreateDataset<DatasetItem>(
    DATASET.name,
  );

  const inventoryExtractorPrompt = await opikClient.getPrompt({
    name: PROMPT.name,
  });

  const prompts = inventoryExtractorPrompt ? [inventoryExtractorPrompt] : [];

  const result = await evaluate({
    dataset: retrievedDataset,
    task: llmTask,
    prompts,
    experimentName: `Ingredient Extractor ${Date.now()} -${MODEL}`,
    scoringMetrics: [new StructureMatch(), new IngredientSetMatch()],
    scoringKeyMapping: {
      output: "output",
      expected: "expected_output",
    },
    nbSamples: params.nbSamples,
    experimentConfig: {
      model: MODEL,
    },
  });

  return result;
};
