import { z } from 'zod';

/**
 * T001: Onboarding type definitions
 * Spec: specs/004-onboarding-flow/data-model.md
 * Updated: specs/019-onboarding-revamp/data-model.md
 */

// =============================================================================
// Legacy Schema (kept for backward compatibility during migration)
// =============================================================================

// Onboarding Input Update Schema (NLP response from Gemini for voice or text)
export const OnboardingUpdateSchema = z.object({
  add: z.object({
    dishes: z.array(z.string()),
    ingredients: z.array(z.string()),
  }),
  remove: z.object({
    dishes: z.array(z.string()),
    ingredients: z.array(z.string()),
  }),
});

// Derived type from schema
export type OnboardingUpdate = z.infer<typeof OnboardingUpdateSchema>;

// =============================================================================
// New Types for 019-onboarding-revamp
// =============================================================================

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
});

export type IngredientExtractionResponse = z.infer<typeof IngredientExtractionSchema>;

// Onboarding state interface
export interface OnboardingState {
  currentStep: 1 | 2 | 3 | 4;
  dishes: string[];
  fridge: string[];
  pantry: string[];
  ingredients: string[];
  hasVoiceChanges: boolean;
  voiceFailureCount: number;
}

// Legacy PersistRequest schema (kept for backward compatibility)
export const LegacyPersistRequestSchema = z.object({
  dishes: z.array(z.string().min(1).max(100)).max(20),
  ingredients: z.array(z.string().min(1).max(100)).max(100),
  pantryItems: z.array(z.string().min(1).max(100)).max(50),
});

/**
 * T038: New PersistRequest schema for 019-onboarding-revamp
 * Accepts cookingSkill and ingredients only (no dishes - uses static recipes)
 */
export const PersistRequestSchema = z.object({
  cookingSkill: z.enum(['basic', 'advanced']),
  ingredients: z.array(z.string().min(1).max(100)).max(100),
});

export type PersistRequest = z.infer<typeof PersistRequestSchema>;

/**
 * T047: PersistResponse with counts
 */
export interface PersistResponse {
  success: boolean;
  recipesCreated: number;
  inventoryCreated: number;
  unrecognizedCount: number;
}

// Initial state
export const initialOnboardingState: OnboardingState = {
  currentStep: 1,
  dishes: [],
  fridge: [],
  pantry: [],
  ingredients: [],
  hasVoiceChanges: false,
  voiceFailureCount: 0,
};

// Suggested item structure
export interface SuggestedItem {
  id: string;
  name: string;
}

export interface SuggestedItems {
  dishes: SuggestedItem[];
  fridgeItems: SuggestedItem[];
  pantryItems: SuggestedItem[];
}
