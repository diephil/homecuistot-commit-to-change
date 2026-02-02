/**
 * ADK Recipe Manager Agent Configuration
 *
 * LlmAgent that processes natural language input to create/update recipes.
 * Supports parallel tool calls for multiple recipe operations.
 */

import { LlmAgent } from "@google/adk";
import { createCreateRecipeTool } from "./tools/create-recipe";
import { createUpdateRecipeTool } from "./tools/update-recipe";
import { createDeleteRecipeTool } from "./tools/delete-recipe";
import { type Trace } from "opik";
import { PROMPT } from "./prompt";

export function createRecipeManagerAgent(params: { opikTrace: Trace }) {
  return new LlmAgent({
    name: PROMPT.name,
    description: PROMPT.description,
    model: "gemini-2.0-flash",
    instruction: PROMPT.prompt,
    tools: [
      createCreateRecipeTool(params),
      createUpdateRecipeTool(params),
      createDeleteRecipeTool(params),
    ],
  });
}
