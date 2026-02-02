/**
 * Update Recipe Tool for ADK Recipe Manager Agent
 *
 * Updates existing recipe from session state.
 * Validates new ingredient names against ingredients table only.
 *
 * NOTE: Orchestrator should check result.unrecognized.length > 0
 * and add "unrecognized_items" tag to Opik trace.
 *
 * Sets endInvocation=true to return result as agent's final answer.
 */

import { FunctionTool, type ToolContext } from "@google/adk";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { adminDb } from "@/db/client";
import { ingredients } from "@/db/schema";
import type {
  UpdateRecipeResult,
  MatchedRecipeIngredient,
  ProposedRecipeIngredient,
  RecipeSessionItem,
} from "@/types/recipe-agent";
import { Trace } from "opik";

// Input schema
const IngredientInput = z.object({
  name: z.string().describe("Ingredient name (lowercase, singular)"),
  isRequired: z.boolean().describe("true = required/anchor, false = optional"),
});

const UpdateRecipeInput = z.object({
  recipeId: z
    .string()
    .uuid()
    .describe("Recipe UUID from session state (LLM determines from context)"),
  updates: z.object({
    title: z.string().min(1).max(100).optional().describe("New recipe title"),
    description: z
      .string()
      .min(1)
      .max(200)
      .optional()
      .describe("New recipe description"),
    addIngredients: z
      .array(IngredientInput)
      .optional()
      .describe("Ingredients to add"),
    removeIngredients: z
      .array(z.string())
      .optional()
      .describe("Ingredient names to remove"),
    toggleRequired: z
      .array(z.string())
      .optional()
      .describe("Ingredient names to toggle isRequired"),
  }),
});

type UpdateInput = z.infer<typeof UpdateRecipeInput>;

export function createUpdateRecipeTool(params: { opikTrace: Trace }) {
  return new FunctionTool({
    name: "update_recipe",
    description: `Update an existing recipe from the tracked recipes. Call this when user wants to modify a recipe they already have. Use the recipe ID from the session state context.`,
    parameters: UpdateRecipeInput,
    execute: async (input: UpdateInput, toolContext?: ToolContext) => {
      const { recipeId, updates } = input;
      const span = params.opikTrace.span({
        name: "update_recipe",
        type: "tool",
        input,
      });

      // Get tracked recipes from session state
      const trackedRecipes =
        (toolContext?.state?.get("trackedRecipes") as RecipeSessionItem[]) ??
        [];

      // Find the recipe to update
      const currentRecipe = trackedRecipes.find((r) => r.id === recipeId);

      if (!currentRecipe) {
        // Recipe not found - return error result
        const errorResult: UpdateRecipeResult = {
          operation: "update",
          recipeId,
          previousState: {
            id: recipeId,
            title: "",
            description: "",
            ingredients: [],
          },
          proposedState: {
            title: "",
            description: "",
            ingredients: [],
          },
          matched: [],
          unrecognized: [`Recipe with ID ${recipeId} not found`],
        };
        if (toolContext) {
          toolContext.invocationContext.endInvocation = true;
        }
        return errorResult;
      }

      // Start with current state
      let proposedTitle = currentRecipe.title;
      let proposedDescription = currentRecipe.description;
      let proposedIngredients = [...currentRecipe.ingredients];

      // Apply title update
      if (updates.title) {
        proposedTitle = updates.title;
      }

      // Apply description update
      if (updates.description) {
        proposedDescription = updates.description;
      }

      // Apply remove ingredients
      if (updates.removeIngredients && updates.removeIngredients.length > 0) {
        const removeSet = new Set(
          updates.removeIngredients.map((n) => n.toLowerCase().trim()),
        );
        proposedIngredients = proposedIngredients.filter(
          (i) => !removeSet.has(i.name.toLowerCase()),
        );
      }

      // Apply toggle required
      if (updates.toggleRequired && updates.toggleRequired.length > 0) {
        const toggleSet = new Set(
          updates.toggleRequired.map((n) => n.toLowerCase().trim()),
        );
        proposedIngredients = proposedIngredients.map((i) => {
          if (toggleSet.has(i.name.toLowerCase())) {
            return { ...i, isRequired: !i.isRequired };
          }
          return i;
        });
      }

      // Process add ingredients - need to validate against DB
      const matched: MatchedRecipeIngredient[] = [];
      const unrecognized: string[] = [];

      if (updates.addIngredients && updates.addIngredients.length > 0) {
        const newIngredients = updates.addIngredients;

        // Create lookup map for isRequired
        const requiredMap = new Map(
          newIngredients.map((i) => [
            i.name.toLowerCase().trim(),
            i.isRequired,
          ]),
        );

        // Normalize names for matching
        const normalizedNames = newIngredients.map((i) =>
          i.name.toLowerCase().trim(),
        );
        const uniqueNames = [...new Set(normalizedNames)];

        // Query ingredients table (case-insensitive)
        const matchedIngredients = await adminDb
          .select({ id: ingredients.id, name: ingredients.name })
          .from(ingredients)
          .where(
            sql`LOWER(${ingredients.name}) IN (${sql.join(
              uniqueNames.map((n) => sql`${n}`),
              sql`, `,
            )})`,
          );

        // Track matched names
        const matchedNames = new Set(
          matchedIngredients.map((i) => i.name.toLowerCase()),
        );

        // Build matched results
        for (const ing of matchedIngredients) {
          matched.push({
            ingredientId: ing.id,
            name: ing.name,
            isRequired: requiredMap.get(ing.name.toLowerCase()) ?? true,
          });
        }

        // Find unrecognized
        for (const name of uniqueNames) {
          if (!matchedNames.has(name)) {
            unrecognized.push(name);
          }
        }

        // Add matched ingredients to proposed (avoid duplicates)
        const existingNames = new Set(
          proposedIngredients.map((i) => i.name.toLowerCase()),
        );
        for (const ing of newIngredients) {
          const nameLower = ing.name.toLowerCase().trim();
          if (!existingNames.has(nameLower) && matchedNames.has(nameLower)) {
            proposedIngredients.push({
              name: ing.name,
              isRequired: ing.isRequired,
            });
          }
        }
      }

      // Build final proposed ingredients with IDs where available
      const finalIngredients: ProposedRecipeIngredient[] =
        proposedIngredients.map((ing) => ({
          ingredientId: matched.find(
            (m) => m.name.toLowerCase() === ing.name.toLowerCase(),
          )?.ingredientId,
          name: ing.name,
          isRequired: ing.isRequired,
        }));

      const result: UpdateRecipeResult = {
        operation: "update",
        recipeId,
        previousState: currentRecipe,
        proposedState: {
          title: proposedTitle,
          description: proposedDescription,
          ingredients: finalIngredients,
        },
        matched,
        unrecognized,
      };

      // End invocation - return as agent's final answer
      if (toolContext) {
        toolContext.invocationContext.endInvocation = true;
      }

      span.update({
        output: result as unknown as Record<string, unknown>,
        metadata: unrecognized.length > 0 ? { unrecognized } : {},
        tags:
          unrecognized.length > 0 ? ["unrecognized_items"] : ["all_recognized"],
      });
      span.end();

      return result;
    },
  });
}
