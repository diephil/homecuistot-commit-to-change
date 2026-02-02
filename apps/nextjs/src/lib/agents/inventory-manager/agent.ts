/**
 * ADK Inventory Manager Agent Configuration
 *
 * LlmAgent that processes natural language input to extract
 * inventory updates and validates against the database.
 */

import { LlmAgent } from "@google/adk";
import { createValidateIngredientsTool } from "./tools/validate-ingredients";
import { type Trace } from "opik";
import { PROMPT } from "./prompt";

export interface CreateInventoryAgentParams {
  userId?: string;
  model?: string;
  opikTrace: Trace;
}

export function createInventoryAgent(params: CreateInventoryAgentParams) {
  const { userId, model = "gemini-2.0-flash" } = params ?? {};

  return new LlmAgent({
    name: PROMPT.name,
    description: PROMPT.description,
    model,
    instruction: PROMPT.prompt,
    tools: [
      createValidateIngredientsTool({ userId, opikTrace: params.opikTrace }),
    ],
  });
}
