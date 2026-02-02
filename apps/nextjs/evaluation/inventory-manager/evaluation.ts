import { evaluate, EvaluationTask, ExactMatch } from "opik";
import { DATASET, type DatasetItem } from "./dataset";
import { createInventoryManagerAgentProposal } from "@/lib/orchestration/inventory-update.orchestration";
import { getOpikClient } from "@/lib/tracing/opik-agent";
import { ProposalStructureMatch, InventoryUpdateMatch } from "./metrics";

// Demo user ID for evaluation
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

const llmTask: EvaluationTask<DatasetItem> = async (datasetItem) => {
  const { input, metadata } = datasetItem;

  // Call orchestration layer (includes Opik tracing)
  const result = await createInventoryManagerAgentProposal({
    userId: DEMO_USER_ID,
    input,
    currentInventory: metadata.currentInventory,
    model: "gemini-2.5-flash-lite",
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

  const result = await evaluate({
    dataset: retrievedDataset,
    task: llmTask,
    experimentName: `Inventory Manager ${Date.now()} - openai whisper + gemini-2.5-flash-lite`,
    scoringMetrics: [
      new ProposalStructureMatch(),
      new InventoryUpdateMatch(),
    ],
    scoringKeyMapping: {
      output: "output",
      expected: "expected_output",
    },
    nbSamples: params.nbSamples,
    experimentConfig: {
      model: "gemini-2.5-flash-lite",
    },
  });

  return result;
};
