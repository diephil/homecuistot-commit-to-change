/**
 * Delete Recipes (Batch) Tool for ADK Recipe Manager Agent
 *
 * Removes recipes from the user's tracked recipes.
 * Sets endInvocation=true to return result as agent's final answer.
 */

import { FunctionTool, type ToolContext } from "@google/adk";
import { z } from "zod";
import type {
  DeleteRecipesResult,
  DeleteRecipesResultItem,
  RecipeSessionItem,
} from "@/types/recipe-agent";
import { Trace } from "opik";

const DeleteRecipesInput = z.object({
  recipeIds: z
    .array(z.string().uuid())
    .min(1)
    .max(10)
    .describe("Array of recipe UUIDs to delete (1-10 IDs)"),
  reason: z.string().optional().describe("Optional reason for deletion"),
});

type DeleteInput = z.infer<typeof DeleteRecipesInput>;

export function createDeleteRecipesTool(params: {
  userId: string;
  opikTrace: Trace;
}) {
  const { userId, opikTrace } = params;

  return new FunctionTool({
    name: "delete_recipes",
    description: `Delete one or more specific recipes from the tracked recipes.
Call this when user wants to remove specific recipes by name or description.
Use recipe IDs from the session state context.
Accepts 1-10 recipe IDs per call.`,
    parameters: DeleteRecipesInput,
    execute: async (input: DeleteInput, toolContext?: ToolContext) => {
      const { recipeIds, reason } = input;
      const span = opikTrace.span({
        name: "delete_recipes",
        type: "tool",
        input,
        tags: [`user:${userId}`],
      });

      // Get tracked recipes from session state once
      const trackedRecipes =
        (toolContext?.state?.get("trackedRecipes") as RecipeSessionItem[]) ??
        [];

      // Build lookup map for quick access
      const recipesById = new Map(trackedRecipes.map((r) => [r.id, r]));

      // Process each recipeId
      const results: DeleteRecipesResultItem[] = [];
      let totalDeleted = 0;
      let totalNotFound = 0;

      for (const recipeId of recipeIds) {
        const recipe = recipesById.get(recipeId);

        if (recipe) {
          results.push({
            recipeId,
            title: recipe.title,
            found: true,
          });
          totalDeleted++;
        } else {
          results.push({
            recipeId,
            title: "",
            found: false,
          });
          totalNotFound++;
        }
      }

      const result: DeleteRecipesResult = {
        operation: "delete_batch",
        results,
        ...(reason && { reason }),
        totalDeleted,
        totalNotFound,
      };

      if (toolContext) {
        toolContext.invocationContext.endInvocation = true;
      }

      span.update({
        output: result as unknown as Record<string, unknown>,
        metadata: { totalDeleted, totalNotFound },
        tags: [`user:${userId}`],
      });
      span.end();

      return result;
    },
  });
}
