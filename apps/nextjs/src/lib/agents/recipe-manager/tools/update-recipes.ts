/**
 * Update Recipes (Batch) Tool for ADK Recipe Manager Agent
 *
 * Updates existing recipes from session state.
 * Validates new ingredient names against ingredients table only.
 *
 * Sets endInvocation=true to return result as agent's final answer.
 */

import { FunctionTool, type ToolContext } from "@google/adk";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { adminDb } from "@/db/client";
import { ingredients } from "@/db/schema";
import type {
  UpdateRecipesResult,
  UpdateRecipesResultItem,
  MatchedRecipeIngredient,
  ProposedRecipeIngredient,
  RecipeSessionItem,
} from "@/types/recipe-agent";
import { Trace } from "opik";

const IngredientInputSchema = z.object({
  name: z.string().describe("Ingredient name (lowercase, singular)"),
  isRequired: z.boolean().describe("true = required/anchor, false = optional"),
});

const UpdateInputSchema = z.object({
  recipeId: z.string().uuid().describe("Recipe UUID from session state"),
  updates: z.object({
    title: z.string().min(1).max(100).optional().describe("New recipe title"),
    description: z
      .string()
      .min(1)
      .max(200)
      .optional()
      .describe(
        "New recipe description, up to 3 sentences describing the recipe",
      ),
    addIngredients: z
      .array(IngredientInputSchema)
      .max(10)
      .optional()
      .describe("Ingredients to add (max 10)"),
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

const UpdateRecipesInput = z.object({
  updates: z
    .array(UpdateInputSchema)
    .min(1)
    .max(5)
    .describe("Array of recipe updates (1-5 updates)"),
});

type UpdateInput = z.infer<typeof UpdateRecipesInput>;
type SingleUpdateInput = z.infer<typeof UpdateInputSchema>;

export function createUpdateRecipesTool(params: {
  userId: string;
  opikTrace: Trace;
}) {
  const { userId, opikTrace } = params;

  return new FunctionTool({
    name: "update_recipes",
    description: `Update one or more existing recipes from the tracked recipes.
Call this when user wants to modify recipes they already have.
Use recipe IDs from the session state context.
Accepts 1-5 updates per call.`,
    parameters: UpdateRecipesInput,
    execute: async (input: UpdateInput, toolContext?: ToolContext) => {
      const { updates } = input;
      const span = opikTrace.span({
        name: "update_recipes",
        type: "tool",
        input,
        tags: [`user:${userId}`],
      });

      // Get tracked recipes from session state once
      const trackedRecipes =
        (toolContext?.state?.get("trackedRecipes") as RecipeSessionItem[]) ??
        [];

      // Collect ALL ingredient names: existing + new additions
      const allIngredientNames = new Set<string>();

      // Add existing ingredients from recipes being updated
      for (const update of updates) {
        const recipe = trackedRecipes.find((r) => r.id === update.recipeId);
        if (recipe) {
          for (const ing of recipe.ingredients) {
            allIngredientNames.add(ing.name.toLowerCase().trim());
          }
        }
        // Add new ingredients being added
        if (update.updates.addIngredients) {
          for (const ing of update.updates.addIngredients) {
            allIngredientNames.add(ing.name.toLowerCase().trim());
          }
        }
      }

      const uniqueNames = [...allIngredientNames];

      // Single DB query for ALL ingredients (existing + new)
      let matchedIngredients: { id: string; name: string }[] = [];
      if (uniqueNames.length > 0) {
        matchedIngredients = await adminDb
          .select({ id: ingredients.id, name: ingredients.name })
          .from(ingredients)
          .where(
            sql`LOWER(${ingredients.name}) IN (${sql.join(
              uniqueNames.map((n) => sql`${n}`),
              sql`, `,
            )})`,
          );
      }

      // Build global matched lookup
      const matchedByName = new Map(
        matchedIngredients.map((i) => [i.name.toLowerCase(), i]),
      );

      // Process each update
      const results: UpdateRecipesResultItem[] = [];
      let totalUpdated = 0;
      let totalNotFound = 0;
      let totalUnrecognized = 0;

      for (let index = 0; index < updates.length; index++) {
        const update = updates[index];
        const updateResult = processUpdate({
          update,
          index,
          trackedRecipes,
          matchedByName,
        });
        results.push(updateResult);

        if (updateResult.previousState.id === "") {
          totalNotFound++;
        } else {
          totalUpdated++;
        }
        totalUnrecognized += updateResult.unrecognized.length;
      }

      const result: UpdateRecipesResult = {
        operation: "update_batch",
        results,
        totalUpdated,
        totalNotFound,
        totalUnrecognized,
      };

      if (toolContext) {
        toolContext.invocationContext.endInvocation = true;
      }

      span.update({
        output: result as unknown as Record<string, unknown>,
        metadata:
          totalUnrecognized > 0
            ? {
                totalUnrecognized,
                unrecognized: results.flatMap((r) => r.unrecognized),
              }
            : {},
        tags:
          totalUnrecognized > 0
            ? [`user:${userId}`, "unrecognized_items"]
            : [`user:${userId}`, "all_recognized"],
      });
      span.end();

      return result;
    },
  });
}

function processUpdate(params: {
  update: SingleUpdateInput;
  index: number;
  trackedRecipes: RecipeSessionItem[];
  matchedByName: Map<string, { id: string; name: string }>;
}): UpdateRecipesResultItem {
  const { update, index, trackedRecipes, matchedByName } = params;
  const { recipeId, updates } = update;

  // Find the recipe to update
  const currentRecipe = trackedRecipes.find((r) => r.id === recipeId);

  if (!currentRecipe) {
    return {
      operation: "update",
      index,
      recipeId,
      previousState: {
        id: "",
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

  // Process add ingredients
  const matched: MatchedRecipeIngredient[] = [];
  const unrecognized: string[] = [];

  if (updates.addIngredients && updates.addIngredients.length > 0) {
    const newIngredients = updates.addIngredients;

    // Create lookup map for isRequired
    const requiredMap = new Map(
      newIngredients.map((i) => [i.name.toLowerCase().trim(), i.isRequired]),
    );

    // Normalize names for matching
    const normalizedNames = newIngredients.map((i) =>
      i.name.toLowerCase().trim(),
    );
    const uniqueNames = [...new Set(normalizedNames)];

    // Track matched names
    const matchedNames = new Set<string>();

    // Build matched results
    for (const name of uniqueNames) {
      const matchedIng = matchedByName.get(name);
      if (matchedIng) {
        matchedNames.add(name);
        matched.push({
          ingredientId: matchedIng.id,
          name: matchedIng.name,
          isRequired: requiredMap.get(name) ?? true,
        });
      }
    }

    // Find unrecognized
    for (const name of uniqueNames) {
      if (!matchedByName.has(name)) {
        unrecognized.push(name);
      }
    }

    // Add matched ingredients to proposed (avoid duplicates)
    const existingNames = new Set(
      proposedIngredients.map((i) => i.name.toLowerCase()),
    );
    for (const ing of newIngredients) {
      const nameLower = ing.name.toLowerCase().trim();
      if (!existingNames.has(nameLower) && matchedByName.has(nameLower)) {
        proposedIngredients.push({
          name: ing.name,
          isRequired: ing.isRequired,
        });
      }
    }
  }

  // Build final proposed ingredients with IDs where available
  const finalIngredients: ProposedRecipeIngredient[] = proposedIngredients.map(
    (ing) => ({
      ingredientId: matchedByName.get(ing.name.toLowerCase())?.id,
      name: ing.name,
      isRequired: ing.isRequired,
    }),
  );

  return {
    operation: "update",
    index,
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
}
