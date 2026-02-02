import { evaluate, EvaluationTask } from "opik";
import { DATASET, type DatasetItem } from "./dataset";
import { createInventoryManagerAgentProposal } from "@/lib/orchestration/inventory-update.orchestration";
import { getOpikClient } from "@/lib/tracing/opik-agent";
import { ProposalStructureMatch, InventoryUpdateMatch } from "./metrics";
import { PROMPT as inventoryManagerPrompt } from "@/lib/agents/inventory-manager/prompt";
import { PROMPT as voiceTranscriptorPrompt } from "@/lib/agents/voice-transcriptor/prompt";

// Demo user ID for evaluation
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";
const MODEL = "gemini-2.5-flash-lite";
const VOICE_TRANSCRIPTOR_MODEL = "whisper-1";

const llmTask: EvaluationTask<DatasetItem> = async (datasetItem) => {
  const { input, metadata } = datasetItem;

  // Call orchestration layer (includes Opik tracing)
  const result = await createInventoryManagerAgentProposal({
    userId: DEMO_USER_ID,
    input,
    currentInventory: metadata.currentInventory,
    model: MODEL,
  });

  return {
    output: result.proposal,
  };
};

export const evaluation = async (params: { nbSamples?: number }) => {
  const opikClient = getOpikClient();
  const retrievedDataset = await opikClient.getOrCreateDataset<DatasetItem>(
    DATASET.name,
  );

  // Retrieve prompts used in the evaluation
  const prompt1 = await opikClient.getPrompt({
    name: inventoryManagerPrompt.name,
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
    experimentName: `Inventory Manager ${Date.now()} - ${VOICE_TRANSCRIPTOR_MODEL} + ${MODEL}`,
    scoringMetrics: [new ProposalStructureMatch(), new InventoryUpdateMatch()],
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
