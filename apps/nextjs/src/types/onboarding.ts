import { z } from 'zod';

/**
 * T001: Onboarding type definitions
 * Spec: specs/004-onboarding-flow/data-model.md
 */

// Voice Update Schema (NLP response from Gemini)
export const VoiceUpdateSchema = z.object({
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
export type VoiceUpdate = z.infer<typeof VoiceUpdateSchema>;

// Onboarding state interface
export interface OnboardingState {
  currentStep: 1 | 2 | 3;
  dishes: string[];
  fridge: string[];
  pantry: string[];
  ingredients: string[];
  hasVoiceChanges: boolean;
  voiceFailureCount: number;
  showTextFallback: boolean;
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
  showTextFallback: false,
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
