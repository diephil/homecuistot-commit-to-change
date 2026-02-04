/**
 * ADK Recipe Manager Agent Configuration
 *
 * LlmAgent that processes natural language input to create/update recipes.
 * Supports parallel tool calls for multiple recipe operations.
 */

import { LlmAgent } from "@google/adk";
import { createCreateRecipesTool } from "./tools/create-recipes";
import { createUpdateRecipesTool } from "./tools/update-recipes";
import { createDeleteRecipesTool } from "./tools/delete-recipes";
import { createDeleteAllRecipesTool } from "./tools/delete-all-recipes";
import { type Trace } from "opik";
import { PROMPT } from "./prompt";

export function createRecipeManagerAgent(params: {
  userId: string;
  opikTrace: Trace;
  model: "gemini-2.0-flash" | "gemini-2.5-flash-lite";
}) {
  return new LlmAgent({
    name: PROMPT.name,
    description: PROMPT.description,
    model: params.model,
    instruction: PROMPT.prompt,
    tools: [
      createCreateRecipesTool(params),
      createUpdateRecipesTool(params),
      createDeleteRecipesTool(params),
      createDeleteAllRecipesTool(params),
    ],
  });
}
