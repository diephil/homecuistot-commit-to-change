# API Contracts: Onboarding Steps 2 & 3 Revamp

**Branch**: `019-onboarding-revamp` | **Date**: 2026-01-31

## Modified Endpoints

### POST /api/onboarding/process-voice

**Changes**: New response schema for ingredient-only extraction.

#### Request
```typescript
interface ProcessVoiceRequest {
  audioBase64: string;
  currentContext: {
    ingredients: string[];  // current ingredient list (no dishes)
  };
}
```

#### Response
```typescript
interface IngredientExtractionResponse {
  add: string[];   // ingredients to add (short name for token efficiency)
  rm: string[];    // ingredients to remove (short name for token efficiency)
}
```

#### Errors
- `408`: Timeout (>15s)
- `500`: Parse error / generic error
- `503`: Network error

---

### POST /api/onboarding/process-text

**Changes**: Same schema as voice, text input instead of audio.

#### Request
```typescript
interface ProcessTextRequest {
  text: string;
  currentContext: {
    ingredients: string[];
  };
}
```

#### Response
```typescript
interface IngredientExtractionResponse {
  add: string[];   // ingredients to add
  rm: string[];    // ingredients to remove
}
```

---

### POST /api/onboarding/persist

**Changes**: Accept cooking skill, use static recipes, updated ingredient handling.

#### Request
```typescript
interface PersistRequest {
  cookingSkill: 'basic' | 'advanced';
  ingredients: string[];  // all ingredient names from step 2 + step 3
}
```

#### Response
```typescript
interface PersistResponse {
  success: boolean;
  recipesCreated: number;      // 8 for basic, 16 for advanced
  inventoryCreated: number;    // recognized + unrecognized
  unrecognizedCount: number;   // items added to unrecognized_items
}
```

#### Flow
1. Match ingredient names against `ingredients` table (case-insensitive)
2. Match remaining against user's `unrecognized_items` table
3. Create new `unrecognized_items` for unmatched names
4. Select recipe set based on cookingSkill
5. Transaction:
   - Insert `user_recipes` from static dishes
   - Insert `recipe_ingredients` with anchor/optional types
   - Insert `user_inventory` entries (quantity_level=3)

---

## New Internal Service

### matchIngredients()

**Location**: `lib/services/ingredient-matcher.ts`

#### Signature
```typescript
async function matchIngredients(params: {
  names: string[];
  userId: string;
}): Promise<IngredientMatchResult>
```

#### Response
```typescript
interface IngredientMatchResult {
  ingredients: Array<{
    id: string;
    name: string;
  }>;
  unrecognizedItems: Array<{
    id: string;
    rawText: string;
  }>;
  unrecognizedItemsToCreate: string[];
}
```

#### Logic
1. Query `ingredients` table with `LOWER(name) IN (...)`
2. Track matched names
3. Query user's `unrecognized_items` with `LOWER(raw_text) IN (...)` for remaining
4. Track matched unrecognized
5. Return unmatched names as `unrecognizedItemsToCreate`
6. Per FR-029: If same name in both, prioritize `ingredients` table
