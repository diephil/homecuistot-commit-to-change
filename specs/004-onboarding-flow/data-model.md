# Data Model: Voice-Enabled Kitchen Onboarding

**Feature**: 004-onboarding-flow
**Date**: 2026-01-22
**Context**: Client-side state management for 3-step onboarding flow with voice input

---

## Entity Definitions

### 1. OnboardingState (UI State)

**Purpose**: Tracks user progress through 3-step onboarding flow

**TypeScript Definition**:
```typescript
interface OnboardingState {
  currentStep: 1 | 2 | 3;
  dishes: string[];           // Cooking skills selected
  fridge: string[];           // Fridge ingredients (step 2 only)
  pantry: string[];           // Pantry ingredients (step 2 only)
  ingredients: string[];      // Merged fridge + pantry (step 3 only)
  hasVoiceChanges: boolean;   // Tracks if voice/text input used in step 3
  voiceFailureCount: number;  // Consecutive voice failures (0-3)
  showTextFallback: boolean;  // Show text input after failures
}
```

**Field Constraints**:
- `currentStep`: Must be 1, 2, or 3 (no step 0 or 4)
- `dishes`: Array of strings, no duplicates (case-insensitive comparison)
- `fridge`/`pantry`: Arrays populated only in step 2
- `ingredients`: Computed by merging fridge + pantry on transition to step 3
- `hasVoiceChanges`: Enables "Complete Setup" button only after ≥1 change
- `voiceFailureCount`: Resets to 0 on successful voice input
- `showTextFallback`: Auto-enabled after 2 consecutive failures

**Default State** (Step 1):
```typescript
const initialState: OnboardingState = {
  currentStep: 1,
  dishes: [],
  fridge: [],
  pantry: [],
  ingredients: [],
  hasVoiceChanges: false,
  voiceFailureCount: 0,
  showTextFallback: false,
};
```

---

### 2. VoiceUpdate (NLP Response)

**Purpose**: Structured JSON response from Gemini API for voice/text input parsing

**TypeScript Definition**:
```typescript
interface VoiceUpdate {
  add: {
    dishes: string[];
    ingredients: string[];
  };
  remove: {
    dishes: string[];
    ingredients: string[];
  };
}
```

**Zod Schema** (Type Derivation):
```typescript
import { z } from 'zod';

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

// Derived type
export type VoiceUpdate = z.infer<typeof VoiceUpdateSchema>;
```

**Field Semantics**:
- `add.dishes`: Cooking skills to add (e.g., "scrambled eggs", "pasta carbonara")
- `add.ingredients`: Food items to add (e.g., "eggs", "tomatoes", "milk")
- `remove.dishes`: Cooking skills to remove (user said "I don't cook X")
- `remove.ingredients`: Food items to remove (user said "no X" or "remove X")

**Validation Rules**:
- All arrays must be present (even if empty)
- Strings must be trimmed and non-empty
- Duplicates within single response ignored
- Case-insensitive comparison for existing items

---

### 3. SuggestedItems (Static Data)

**Purpose**: Pre-defined lists of common dishes and ingredients for step 2 badge selection

**TypeScript Definition**:
```typescript
interface SuggestedItem {
  id: string;  // Unique identifier (e.g., "dish-1", "fridge-2")
  name: string; // Display name (e.g., "Scrambled Eggs", "Tomatoes")
}

interface SuggestedItems {
  dishes: SuggestedItem[];       // 10-15 easy-to-cook dishes
  fridgeItems: SuggestedItem[];  // 15-20 common fridge ingredients
  pantryItems: SuggestedItem[];  // 15-20 common pantry staples
}
```

**Example Data**:
```typescript
export const SUGGESTED_ITEMS: SuggestedItems = {
  dishes: [
    { id: 'dish-1', name: 'Scrambled Eggs' },
    { id: 'dish-2', name: 'Pasta Carbonara' },
    { id: 'dish-3', name: 'Grilled Cheese Sandwich' },
    { id: 'dish-4', name: 'Chicken Stir Fry' },
    { id: 'dish-5', name: 'Fried Rice' },
    // ... 10-15 total
  ],
  fridgeItems: [
    { id: 'fridge-1', name: 'Eggs' },
    { id: 'fridge-2', name: 'Milk' },
    { id: 'fridge-3', name: 'Tomatoes' },
    { id: 'fridge-4', name: 'Cheese' },
    { id: 'fridge-5', name: 'Lettuce' },
    // ... 15-20 total
  ],
  pantryItems: [
    { id: 'pantry-1', name: 'Pasta' },
    { id: 'pantry-2', name: 'Rice' },
    { id: 'pantry-3', name: 'Flour' },
    { id: 'pantry-4', name: 'Sugar' },
    { id: 'pantry-5', name: 'Salt' },
    // ... 15-20 total
  ],
};
```

**Storage**: Stored as constant in `src/constants/onboarding.ts` (no database)

---

## State Transitions

### Step 1 → Step 2

**Trigger**: User clicks "Get Started" button
**Validation**: None (welcome screen has no inputs)
**State Changes**:
```typescript
state.currentStep = 2;
```

### Step 2 → Step 3

**Trigger**: User clicks "Continue" button
**Validation**: None (empty selections allowed)
**State Changes**:
```typescript
state.currentStep = 3;
state.ingredients = [...state.fridge, ...state.pantry]; // Merge arrays
```

**Important**: `fridge` and `pantry` arrays remain unchanged (for potential "go back" feature)

### Step 3 → Complete

**Trigger**: User clicks "Complete Setup" button (enabled only after voice/text change)
**Validation**:
- `hasVoiceChanges === true` (button disabled otherwise)
**State Changes**:
```typescript
// Navigate to main app
// Note: Profile persistence implemented in separate feature
router.push('/suggestions');
```

---

## Voice/Text Input Operations

### Adding Items

**User Input**: "Add eggs, tomatoes, and I can also cook scrambled eggs"
**NLP Response**:
```json
{
  "add": {
    "dishes": ["Scrambled Eggs"],
    "ingredients": ["Eggs", "Tomatoes"]
  },
  "remove": {
    "dishes": [],
    "ingredients": []
  }
}
```

**State Update Logic**:
```typescript
function applyVoiceUpdate(state: OnboardingState, update: VoiceUpdate): OnboardingState {
  // Add dishes (case-insensitive duplicate check)
  const newDishes = update.add.dishes.filter(
    dish => !state.dishes.some(existing => existing.toLowerCase() === dish.toLowerCase())
  );
  state.dishes = [...state.dishes, ...newDishes];

  // Add ingredients (case-insensitive duplicate check)
  const newIngredients = update.add.ingredients.filter(
    ingredient => !state.ingredients.some(existing => existing.toLowerCase() === ingredient.toLowerCase())
  );
  state.ingredients = [...state.ingredients, ...newIngredients];

  // Remove dishes (case-insensitive match)
  state.dishes = state.dishes.filter(
    dish => !update.remove.dishes.some(remove => remove.toLowerCase() === dish.toLowerCase())
  );

  // Remove ingredients (case-insensitive match)
  state.ingredients = state.ingredients.filter(
    ingredient => !update.remove.ingredients.some(remove => remove.toLowerCase() === ingredient.toLowerCase())
  );

  // Mark as changed (enable Complete Setup button)
  state.hasVoiceChanges = true;

  // Reset failure count on success
  state.voiceFailureCount = 0;

  return state;
}
```

---

## Validation Rules

### Duplicate Detection

**Rule**: Case-insensitive comparison before adding items
**Example**:
- Existing: `["Eggs", "Tomatoes"]`
- Adding: `["eggs", "TOMATOES", "Milk"]`
- Result: Only "Milk" added (others already exist)

**Toast Notification**: "Eggs already in your kitchen" (shown to user)

### Empty State Handling

**Rule**: Allow empty selections at any step
**Step 3 Empty State**:
```typescript
if (state.dishes.length === 0 && state.ingredients.length === 0) {
  showPlaceholder("Your kitchen is empty. Hold the mic and tell me what you have.");
}
```

### Voice Failure Tracking

**Rule**: Increment `voiceFailureCount` on each consecutive failure, reset on success

**Failure Actions**:
1. **First Failure**: Show toast "Couldn't understand. Please try again."
2. **Second Failure**: Show toast "Still having trouble. Would you like to type instead?" + highlight text input
3. **Third+ Failure**: Auto-enable text input mode permanently

---

## Persistence Strategy

**Storage**: React `useState` hook (ephemeral, lost on page refresh)
**Rationale**: Client-side only for this feature. Profile persistence implemented in separate feature.

---

## Type Safety Guarantees

### Derived Types (Constitution Principle V)

All complex types derived from schemas, not manually duplicated:

```typescript
// ✅ GOOD: Derive from Zod schema
export const VoiceUpdateSchema = z.object({ /* ... */ });
export type VoiceUpdate = z.infer<typeof VoiceUpdateSchema>;

// ❌ BAD: Manual duplication
export type VoiceUpdate = { /* manually defined */ };
export const VoiceUpdateSchema = z.object({ /* duplicated structure */ });
```

### Named Parameters (Constitution Principle VI)

All functions with 2+ similar-type params or 3+ total params use named params:

```typescript
// ✅ GOOD: Named params for multiple arguments
function applyVoiceUpdate(params: {
  state: OnboardingState;
  update: VoiceUpdate;
}): OnboardingState { /* ... */ }

// ❌ BAD: Positional params (ambiguous)
function applyVoiceUpdate(state: OnboardingState, update: VoiceUpdate): OnboardingState { /* ... */ }
```

---

## Summary

**Total Entities**: 3 (OnboardingState, VoiceUpdate, SuggestedItems)
**Storage**: Client-side ephemeral only (no persistence in this feature)
**Validation**: Essential only (API boundary, duplicate detection)
**Type Safety**: Zod schema-first with derived TypeScript types
**Complexity**: Low (no normalization, no relationships, simple state machine)

---

**Last Updated**: 2026-01-22
**Next**: Generate API contracts in `contracts/` directory
