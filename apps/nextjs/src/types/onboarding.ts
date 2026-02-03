import { z } from 'zod';

/**
 * T001: Onboarding type definitions
 * Spec: specs/019-onboarding-revamp/data-model.md
 */

/**
 * T001: Cooking skill level (transient, not stored in DB)
 * Used to determine which recipe set to create during onboarding
 */
export type CookingSkill = 'basic' | 'advanced';

/**
 * T001: Static ingredient for common ingredients list
 */
export interface StaticIngredient {
  name: string; // singular form, must exist in ingredients table
}

/**
 * T001: Ingredient in a static dish with anchor/optional type
 */
export interface StaticDishIngredient {
  name: string; // singular form
  type: 'anchor' | 'optional';
}

/**
 * T001: Static dish definition for BASIC_RECIPES and ADVANCED_RECIPES
 */
export interface StaticDish {
  title: string;
  description: string;
  ingredients: StaticDishIngredient[];
}

/**
 * T001: Result from matchIngredients() service
 */
export interface IngredientMatchResult {
  ingredients: Array<{ id: string; name: string }>;
  unrecognizedItems: Array<{ id: string; rawText: string }>;
  unrecognizedItemsToCreate: string[];
}

/**
 * T008: New LLM response schema for ingredient-only extraction
 * Used by process-voice and process-text routes
 * Uses short field names (add/rm) for LLM token efficiency
 */
export const IngredientExtractionSchema = z.object({
  add: z.array(z.string()).describe("Ingredients user wants to add to their list"),
  rm: z.array(z.string()).describe("Ingredients user wants to remove from their list"),
  transcribedText: z.string().optional().describe("Transcribed text from voice input"),
});

export type IngredientExtractionResponse = z.infer<typeof IngredientExtractionSchema>;

/**
 * T038: PersistRequest schema for onboarding
 * Accepts ingredients and pantryStaples only
 */
export const PersistRequestSchema = z.object({
  ingredients: z.array(z.string().min(1).max(100)).max(100),
  pantryStaples: z.array(z.string().min(1).max(100)).max(100).optional().default([]),
});

export type PersistRequest = z.infer<typeof PersistRequestSchema>;

/**
 * T047: PersistResponse with counts
 */
export interface PersistResponse {
  success: boolean;
  inventoryCreated: number;
  unrecognizedCount: number;
}

/**
 * CompleteRequest schema for onboarding completion
 * Accepts ingredients, pantryStaples, and recipes
 */
export const CompleteRequestSchema = z.object({
  ingredients: z.array(z.string().min(1).max(100)).max(100),
  pantryStaples: z.array(z.string().min(1).max(100)).max(100).default([]),
  recipes: z.array(z.object({
    id: z.string(),
    name: z.string().min(1).max(200),
    description: z.string().optional(),
    ingredients: z.array(z.object({
      id: z.string(),
      name: z.string().min(1).max(100),
      type: z.enum(['anchor', 'optional']),
    })),
  })).max(20),
});

export type CompleteRequest = z.infer<typeof CompleteRequestSchema>;

/**
 * CompleteResponse with comprehensive stats
 */
export interface CompleteResponse {
  success: boolean;
  inventoryCreated: number;
  recipesCreated: number;
  unrecognizedIngredients: number;
  unrecognizedRecipeIngredients: number;
}
