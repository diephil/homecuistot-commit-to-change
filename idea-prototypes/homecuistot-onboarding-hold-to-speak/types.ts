
export interface OnboardingState {
  dishes: string[];
  fridge: string[];
  pantry: string[];
}

export type Step = 'welcome' | 'selection' | 'voice';

export interface SuggestionItem {
  id: string;
  name: string;
  category: 'dish' | 'fridge' | 'pantry';
}

export interface VoiceUpdate {
  add: {
    dishes: string[];
    fridge: string[];
    pantry: string[];
  };
  remove: {
    dishes: string[];
    fridge: string[];
    pantry: string[];
  };
}
