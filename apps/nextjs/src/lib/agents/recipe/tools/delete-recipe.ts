/**
 * Delete Recipe Tool for ADK Recipe Manager Agent
 *
 * Removes a recipe from the user's tracked recipes.
 * Sets endInvocation=true to return result as agent's final answer.
 */

import { FunctionTool, type ToolContext } from "@google/adk";
import { z } from "zod";
import type { DeleteRecipeResult, RecipeSessionItem } from "@/types/recipe-agent";

const DeleteRecipeInput = z.object({
  recipeId: z
    .string()
    .uuid()
    .describe("Recipe UUID from session state (LLM determines from context)"),
  reason: z
    .string()
    .optional()
    .describe("Optional reason for deletion"),
});

type DeleteInput = z.infer<typeof DeleteRecipeInput>;

export function createDeleteRecipeTool() {
  return new FunctionTool({
    name: "delete_recipe",
    description: `Delete an existing recipe from the tracked recipes.
Call this when user wants to remove a recipe entirely.
Use the recipe ID from the session state context.`,
    parameters: DeleteRecipeInput,
    execute: async (input: DeleteInput, toolContext?: ToolContext) => {
      const { recipeId, reason } = input;

      // Get tracked recipes from session state
      const trackedRecipes =
        (toolContext?.state?.get("trackedRecipes") as RecipeSessionItem[]) ??
        [];

      // Find the recipe to delete
      const recipe = trackedRecipes.find((r) => r.id === recipeId);

      if (!recipe) {
        // Recipe not found - return error result
        const errorResult: DeleteRecipeResult = {
          operation: "delete",
          recipeId,
          title: "",
        };
        if (toolContext) {
          toolContext.invocationContext.endInvocation = true;
        }
        return errorResult;
      }

      const result: DeleteRecipeResult = {
        operation: "delete",
        recipeId,
        title: recipe.title,
        ...(reason && { reason }),
      };

      // End invocation - return as agent's final answer
      if (toolContext) {
        toolContext.invocationContext.endInvocation = true;
      }

      return result;
    },
  });
}
