/**
 * Create Recipes (Batch) Tool for ADK Recipe Manager Agent
 *
 * Validates ingredient names against ingredients table only.
 * Unmatched names reported in result.unrecognized (not persisted).
 *
 * Sets endInvocation=true to return result as agent's final answer.
 */

import { FunctionTool, type ToolContext } from "@google/adk";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { adminDb } from "@/db/client";
import { ingredients } from "@/db/schema";
import type {
  CreateRecipesResult,
  CreateRecipesResultItem,
  MatchedRecipeIngredient,
  ProposedRecipeIngredient,
} from "@/types/recipe-agent";
import { Trace } from "opik";

const IngredientInputSchema = z.object({
  name: z.string().describe("Ingredient name (lowercase, singular)"),
  isRequired: z.boolean().describe("true = required/anchor, false = optional"),
});

const RecipeInputSchema = z.object({
  title: z.string().min(1).max(100).describe("Recipe title, max 100 chars"),
  description: z
    .string()
    .min(1)
    .max(200)
    .describe("Brief recipe description, max 200 chars"),
  ingredients: z
    .array(IngredientInputSchema)
    .min(1)
    .max(10)
    .describe("Recipe ingredients (1-10 items)"),
});

const CreateRecipesInput = z.object({
  recipes: z
    .array(RecipeInputSchema)
    .min(1)
    .max(5)
    .describe("Array of recipes to create (1-5 recipes)"),
});

type CreateInput = z.infer<typeof CreateRecipesInput>;
type RecipeInput = z.infer<typeof RecipeInputSchema>;

export function createCreateRecipesTool(params: { opikTrace: Trace }) {
  return new FunctionTool({
    name: "create_recipes",
    description: `Create one or more new recipes with validated ingredients.
Call this when user wants to add new recipes or when user is describing a recipe not present in their list.
If user doesn't specify ingredients, generate sensible defaults for each recipe type.
Accepts 1-5 recipes per call, each with 1-10 ingredients.`,
    parameters: CreateRecipesInput,
    execute: async (input: CreateInput, toolContext?: ToolContext) => {
      const { recipes } = input;
      const span = params.opikTrace.span({
        name: "create_recipes",
        type: "tool",
        input,
      });

      // Collect ALL unique ingredient names across all recipes
      const allIngredientNames = new Set<string>();

      for (const recipe of recipes) {
        for (const ing of recipe.ingredients) {
          const normalized = ing.name.toLowerCase().trim();
          allIngredientNames.add(normalized);
        }
      }

      const uniqueNames = [...allIngredientNames];

      // Single DB query for all ingredients
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

      // Process each recipe
      const results: CreateRecipesResultItem[] = [];
      let totalUnrecognized = 0;

      for (let index = 0; index < recipes.length; index++) {
        const recipe = recipes[index];
        const recipeResult = processRecipe({
          recipe,
          index,
          matchedByName,
        });
        results.push(recipeResult);
        totalUnrecognized += recipeResult.unrecognized.length;
      }

      const result: CreateRecipesResult = {
        operation: "create_batch",
        results,
        totalCreated: results.length,
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
          totalUnrecognized > 0 ? ["unrecognized_items"] : ["all_recognized"],
      });
      span.end();

      return result;
    },
  });
}

function processRecipe(params: {
  recipe: RecipeInput;
  index: number;
  matchedByName: Map<string, { id: string; name: string }>;
}): CreateRecipesResultItem {
  const { recipe, index, matchedByName } = params;
  const { title, description, ingredients: inputIngredients } = recipe;

  if (!inputIngredients || inputIngredients.length === 0) {
    return {
      operation: "create",
      index,
      title,
      description,
      ingredients: [],
      matched: [],
      unrecognized: [],
    };
  }

  // Create lookup map for isRequired by normalized name
  const requiredMap = new Map(
    inputIngredients.map((i) => [i.name.toLowerCase().trim(), i.isRequired]),
  );

  // Normalize names for matching
  const normalizedNames = inputIngredients.map((i) =>
    i.name.toLowerCase().trim(),
  );
  const uniqueNames = [...new Set(normalizedNames)];

  // Track matched names for this recipe
  const matchedNames = new Set<string>();
  const matched: MatchedRecipeIngredient[] = [];

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

  // Build proposed ingredients (all inputs with matched IDs where available)
  const proposedIngredients: ProposedRecipeIngredient[] = inputIngredients.map(
    (ing) => {
      const nameLower = ing.name.toLowerCase().trim();
      const matchedIng = matchedByName.get(nameLower);
      return {
        ingredientId: matchedIng?.id,
        name: ing.name,
        isRequired: ing.isRequired,
      };
    },
  );

  // Unrecognized = names not found in ingredients table
  const unrecognized = uniqueNames.filter((n) => !matchedNames.has(n));

  return {
    operation: "create",
    index,
    title,
    description,
    ingredients: proposedIngredients,
    matched,
    unrecognized,
  };
}
