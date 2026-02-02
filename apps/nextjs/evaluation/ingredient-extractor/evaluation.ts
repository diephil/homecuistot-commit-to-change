import { evaluate, EvaluationTask, ExactMatch } from "opik";
import { DATASET, DatasetItem } from "./dataset";
import { ingredientExtractorAgent } from "@/lib/agents/ingredient-extractor/agent";
import { getOpikClient } from "@/lib/tracing/opik-agent";
import { StructureMatch, IngredientSetMatch } from "./metrics";

const llmTask: EvaluationTask<DatasetItem> = async (datasetItem) => {
  const { input, metadata } = datasetItem;
  const response = await ingredientExtractorAgent({
    currentIngredients: metadata.currentIngredients,
    text: input,
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

  const result = await evaluate({
    dataset: retrievedDataset,
    task: llmTask,
    experimentName: `Ingredient Extractor ${Date.now()}`,
    scoringMetrics: [
      new StructureMatch(),
      new IngredientSetMatch(),
      new ExactMatch(),
    ],
    scoringKeyMapping: {
      output: "output",
      expected: "expected_output",
    },
    nbSamples: params.nbSamples,
  });

  return result;
};
