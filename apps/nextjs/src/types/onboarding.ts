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
 */
export const IngredientExtractionSchema = z.object({
  ingredients_to_add: z.array(z.string()),
  ingredients_to_remove: z.array(z.string()),
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

// T002: Zod validation schema for PersistRequest
export const PersistRequestSchema = z.object({
  dishes: z.array(z.string().min(1).max(100)).max(20),
  ingredients: z.array(z.string().min(1).max(100)).max(100),
  pantryItems: z.array(z.string().min(1).max(100)).max(50),
});

export type PersistRequest = z.infer<typeof PersistRequestSchema>;

// PersistResponse type
export interface PersistResponse {
  success: boolean;
  recipesCreated: number;
  inventoryCreated: number;
  pantryStaplesCreated: number;
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
