# Data Model: Voice Recipe Editor

**Branch**: `016-voice-recipe-editor` | **Date**: 2026-01-28

## Entities

### RecipeState (Input to LLM)

Current recipe being edited - passed to LLM for context.

```typescript
interface RecipeState {
  title: string;           // max 100 chars
  description: string;     // max 200 chars
  ingredients: Array<{
    name: string;          // lowercase, singular
    isOptional: boolean;
  }>;
}
```

**Validation**:
- `title`: 1-100 characters
- `description`: 1-200 characters
- `ingredients`: 1-20 items, each with name (1+ chars) and isOptional flag

### RecipeUpdateRequest (API Input)

Request body for update endpoints.

```typescript
interface RecipeUpdateVoiceRequest {
  currentRecipe: RecipeState;
  audioBase64: string;  // base64-encoded audio/webm
}

interface RecipeUpdateTextRequest {
  currentRecipe: RecipeState;
  text: string;  // user's update instruction
}
```

### RecipeUpdateResponse (API Output)

LLM output - complete updated recipe state.

```typescript
interface RecipeUpdateResponse {
  title: string;
  description: string;
  ingredients: Array<{
    name: string;
    isOptional: boolean;
  }>;
}
```

**Note**: Same shape as `RecipeExtraction` - returns complete state, not diff.

### ValidationResult (Existing)

Already defined in `src/types/recipes.ts`:

```typescript
interface ValidationResult {
  matched: Array<{
    id: string;    // UUID from ingredients table
    name: string;  // canonical name
  }>;
  unrecognized: string[];  // ingredient names not in DB
}
```

## Relationships

```
RecipeForm (UI)
    |
    ├── holds RecipeState (current form state)
    |
    └── sends RecipeUpdateRequest
            |
            └── POST /api/recipes/update-voice or /api/recipes/update-text
                    |
                    ├── calls processVoiceRecipeUpdate() or processTextRecipeUpdate()
                    |       |
                    |       └── LLM (Gemini 2.0 Flash)
                    |               |
                    |               └── returns RecipeUpdateResponse
                    |
                    └── returns RecipeUpdateResponse to client
                            |
                            └── client calls validateIngredients()
                                    |
                                    └── returns ValidationResult
```

## State Transitions

### RecipeForm Stages (Edit Mode)

```
┌─────────┐     voice/text     ┌────────────┐      LLM done      ┌──────────┐
│  form   │ ──────────────────>│ processing │ ─────────────────> │  preview │
└─────────┘                    └────────────┘                    └──────────┘
     ^                                                                 │
     │                                                                 │
     │                              user saves or dismisses            │
     └─────────────────────────────────────────────────────────────────┘
```

**States**:
- `form`: Default editing state, QuickInputSection visible
- `processing`: Loading indicator while LLM processes
- `preview`: Show proposed changes, save/dismiss buttons

### User Actions

| State | Action | Next State |
|-------|--------|------------|
| form | Record voice / submit text | processing |
| processing | LLM response received | preview |
| processing | LLM error | form (toast error) |
| preview | Save | form (with updated values) |
| preview | Dismiss | form (no changes) |

## Database Impact

**No schema changes required.** Feature uses existing tables:
- `recipes`: stores recipe title, description
- `recipe_ingredients`: stores ingredient mappings
- `ingredients`: reference table for validation

Update flow writes via existing `updateRecipe` action.
