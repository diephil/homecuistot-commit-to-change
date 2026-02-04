/**
 * ADK Inventory Manager Agent Configuration
 *
 * LlmAgent that processes natural language input to extract
 * inventory updates and validates against the database.
 */

import { LlmAgent } from "@google/adk";
import { createUpdateMatchingIngredientsTool } from "./tools/update-matching-ingredients";
import { createUpdateAllTrackedIngredientsTool } from "./tools/update-all-tracked-ingredients";
import { type Trace } from "opik";
import { PROMPT } from "./prompt";

export interface CreateInventoryAgentParams {
  userId: string;
  model: string;
  opikTrace: Trace;
}

export function createInventoryAgent(params: CreateInventoryAgentParams) {
  const { userId, model, opikTrace } = params;

  return new LlmAgent({
    name: PROMPT.name,
    description: PROMPT.description,
    model,
    instruction: PROMPT.prompt,
    tools: [
      createUpdateMatchingIngredientsTool({ userId, opikTrace }),
      // createDeleteAllIngredientsTool({ userId, opikTrace }),
      // createRefillAllIngredientsTool({ userId, opikTrace }),
      createUpdateAllTrackedIngredientsTool({ userId, opikTrace }),
    ],
  });
}
