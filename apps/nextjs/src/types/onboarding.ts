import { z } from 'zod';

/**
 * T001: Onboarding type definitions
 * Spec: specs/004-onboarding-flow/data-model.md
 */

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
