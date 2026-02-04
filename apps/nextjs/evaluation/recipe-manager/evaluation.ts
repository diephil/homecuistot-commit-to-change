import { evaluate, EvaluationTask } from "opik";
import { DATASET, type RecipeDatasetItem } from "./dataset";
import { createRecipeManagerAgentProposal } from "@/lib/orchestration/recipe-update.orchestration";
import { getOpikClient } from "@/lib/tracing/opik-agent";
import { RecipeStructureMatch, RecipeOperationMatch } from "./metrics";
import { PROMPT as recipeManagerPrompt } from "@/lib/agents/recipe-manager/prompt";
import { PROMPT as voiceTranscriptorPrompt } from "@/lib/agents/voice-transcriptor/prompt";

// Demo user ID for evaluation
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";
const MODEL = "gemini-2.5-flash-lite";
const VOICE_TRANSCRIPTOR_MODEL = "whisper-1";

const llmTask: EvaluationTask<RecipeDatasetItem> = async (datasetItem) => {
  const { input, metadata } = datasetItem;

  // Call orchestration layer (includes Opik tracing)
  const result = await createRecipeManagerAgentProposal({
    userId: DEMO_USER_ID,
    input,
    trackedRecipes: metadata.trackedRecipes,
    model: MODEL,
  });

  return {
    output: result.proposal,
  };
};

export const evaluation = async (params: { nbSamples?: number }) => {
  const opikClient = getOpikClient();
  const retrievedDataset =
    await opikClient.getOrCreateDataset<RecipeDatasetItem>(DATASET.name);

  // Retrieve prompts used in the evaluation
  const prompt1 = await opikClient.getPrompt({
    name: recipeManagerPrompt.name,
  });
  const prompt2 = await opikClient.getPrompt({
    name: voiceTranscriptorPrompt.name,
  });

  const prompts = [prompt1, prompt2].filter(
    (p): p is NonNullable<typeof p> => !!p,
  );

  const result = await evaluate({
    dataset: retrievedDataset,
    task: llmTask,
    prompts,
    experimentName: `Recipe Manager ${Date.now()} - ${VOICE_TRANSCRIPTOR_MODEL} + ${MODEL}`,
    scoringMetrics: [new RecipeStructureMatch(), new RecipeOperationMatch()],
    scoringKeyMapping: {
      output: "output",
      expected: "expected_output",
    },
    nbSamples: params.nbSamples,
    experimentConfig: {
      model: MODEL,
      voiceTranscriptorModel: VOICE_TRANSCRIPTOR_MODEL,
    },
  });

  return result;
};
