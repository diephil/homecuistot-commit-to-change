/**
 * Create Recipe Tool for ADK Recipe Manager Agent
 *
 * Validates ingredient names against ingredients table only.
 * Unmatched names reported in result.unrecognized (not persisted).
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
  CreateRecipeResult,
  MatchedRecipeIngredient,
  ProposedRecipeIngredient,
} from "@/types/recipe-agent";
import { Trace } from "opik";

// Input schema
const CreateRecipeInput = z.object({
  title: z.string().min(1).max(100).describe("Recipe title, max 100 chars"),
  description: z
    .string()
    .min(1)
    .max(200)
    .describe("Brief recipe description, max 200 chars"),
  ingredients: z
    .array(
      z.object({
        name: z.string().describe("Ingredient name (lowercase, singular)"),
        isRequired: z
          .boolean()
          .describe("true = required/anchor, false = optional"),
      }),
    )
    .min(1)
    .max(6)
    .describe("Recipe ingredients (1-6 items)"),
});

type CreateInput = z.infer<typeof CreateRecipeInput>;

export function createCreateRecipeTool(params: { opikTrace: Trace }) {
  return new FunctionTool({
    name: "create_recipe",
    description: `Create a new recipe with validated ingredients.
Call this when user wants to add a brand new recipe.
If user doesn't specify ingredients, generate sensible defaults for the recipe type.`,
    parameters: CreateRecipeInput,
    execute: async (input: CreateInput, toolContext?: ToolContext) => {
      const { title, description, ingredients: inputIngredients } = input;
      const span = params.opikTrace.span({
        name: "create_recipe",
        type: "tool",
        input,
      });

      if (!inputIngredients || inputIngredients.length === 0) {
        const result: CreateRecipeResult = {
          operation: "create",
          title,
          description,
          ingredients: [],
          matched: [],
          unrecognized: [],
        };
        if (toolContext) {
          toolContext.invocationContext.endInvocation = true;
        }
        return result;
      }

      // Create lookup map for isRequired by normalized name
      const requiredMap = new Map(
        inputIngredients.map((i) => [
          i.name.toLowerCase().trim(),
          i.isRequired,
        ]),
      );

      // Normalize names for matching
      const normalizedNames = inputIngredients.map((i) =>
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

      // Build matched results with isRequired from input
      const matched: MatchedRecipeIngredient[] = matchedIngredients.map(
        (ing) => ({
          ingredientId: ing.id,
          name: ing.name,
          isRequired: requiredMap.get(ing.name.toLowerCase()) ?? true,
        }),
      );

      // Build proposed ingredients (all inputs with matched IDs where available)
      const proposedIngredients: ProposedRecipeIngredient[] =
        inputIngredients.map((ing) => {
          const nameLower = ing.name.toLowerCase().trim();
          const matchedIng = matchedIngredients.find(
            (m) => m.name.toLowerCase() === nameLower,
          );
          return {
            ingredientId: matchedIng?.id,
            name: ing.name,
            isRequired: ing.isRequired,
          };
        });

      // Unrecognized = names not found in ingredients table
      const unrecognized = uniqueNames.filter((n) => !matchedNames.has(n));

      const result: CreateRecipeResult = {
        operation: "create",
        title,
        description,
        ingredients: proposedIngredients,
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
