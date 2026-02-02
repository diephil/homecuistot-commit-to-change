/**
 * Delete All Recipes Tool for ADK Recipe Manager Agent
 *
 * Removes all recipes from the user's tracked recipes.
 * Sets endInvocation=true to return result as agent's final answer.
 */

import { FunctionTool, type ToolContext } from "@google/adk";
import { z } from "zod";
import type {
  DeleteAllRecipesResult,
  RecipeSessionItem,
} from "@/types/recipe-agent";
import { Trace } from "opik";

const DeleteAllRecipesInput = z.object({
  reason: z.string().optional().describe("Optional reason for deletion"),
});

type DeleteAllInput = z.infer<typeof DeleteAllRecipesInput>;

export function createDeleteAllRecipesTool(params: {
  userId: string;
  opikTrace: Trace;
}) {
  const { userId, opikTrace } = params;

  return new FunctionTool({
    name: "delete_all_recipes",
    description: `Delete all recipes from the tracked recipes. Call this when user wants to clear all recipes or start fresh.`,
    parameters: DeleteAllRecipesInput,
    execute: async (input: DeleteAllInput, toolContext?: ToolContext) => {
      const { reason } = input;
      const span = opikTrace.span({
        name: "delete_all_recipes",
        type: "tool",
        input,
        tags: [`user:${userId}`],
      });

      // Get tracked recipes from session state
      const trackedRecipes =
        (toolContext?.state?.get("trackedRecipes") as RecipeSessionItem[]) ??
        [];

      // Build result with all deleted recipes
      const result: DeleteAllRecipesResult = {
        operation: "delete_all",
        deletedCount: trackedRecipes.length,
        deletedRecipes: trackedRecipes.map((r) => ({
          recipeId: r.id,
          title: r.title,
        })),
        ...(reason && { reason }),
      };

      // End invocation - return as agent's final answer
      if (toolContext) {
        toolContext.invocationContext.endInvocation = true;
      }

      span.update({
        output: result as unknown as Record<string, unknown>,
        tags: [`user:${userId}`],
      });
      span.end();

      return result;
    },
  });
}
