# Quickstart: Voice Recipe Editor

**Branch**: `016-voice-recipe-editor`

## Overview

Add voice/text editing capability to the recipe update form, matching the pattern in add-recipe modal.

## Key Files to Create/Modify

### New Files

```
src/lib/prompts/recipe-updater/
├── prompt.ts         # LLM prompt with Opik tags
└── process.ts        # processVoiceRecipeUpdate(), processTextRecipeUpdate()

src/app/api/recipes/
├── update-voice/route.ts
└── update-text/route.ts

src/types/recipes.ts  # Add RecipeUpdateRequest types
```

### Modified Files

```
src/components/recipes/recipe-form.tsx       # Add voice/text input for edit mode
src/lib/prompts/recipe-editor/prompt.ts      # Add "creation" tag + mode metadata
```

## Implementation Steps

### 1. Create Recipe Updater Prompt

File: `src/lib/prompts/recipe-updater/prompt.ts`

```typescript
export const RECIPE_UPDATER_PROMPT = {
  name: "recipe-updater",
  tags: ["recipe", "update", "voice-input", "gemini"],
  metadata: { inputType: "audio|text", domain: "recipes", model: "gemini-2.0-flash", mode: "update" },
  prompt: `You are a recipe update assistant. Apply user-requested changes to an existing recipe.

Current Recipe:
{{{currentRecipe}}}

User Request: {{{userInput}}}

Rules:
- ONLY modify what the user explicitly asks to change
- PRESERVE all fields the user doesn't mention
- Ingredient names: lowercase, singular form
- If adding ingredients, mark garnishes/alternatives as optional
- If user asks to mark something as optional, set isOptional: true
- If user asks to remove an ingredient, exclude it from the list
- Return the COMPLETE updated recipe state

Return JSON matching the schema.`,
};
```

### 2. Create Process Functions

File: `src/lib/prompts/recipe-updater/process.ts`

- Import `trackGemini` from `opik-gemini`
- Use same pattern as `recipe-editor/process.ts`
- Accept `currentRecipe` + `audioBase64` or `text`
- Return complete `RecipeExtraction`

### 3. Create API Routes

Routes follow existing pattern:
- POST `/api/recipes/update-voice` - accepts `{ currentRecipe, audioBase64 }`
- POST `/api/recipes/update-text` - accepts `{ currentRecipe, text }`

### 4. Update RecipeForm Component

In edit mode:
1. Show `QuickInputSection` (voice/text toggle)
2. On input: POST to update route with current form state
3. Show preview of changes
4. Save/dismiss buttons

## Testing Checklist

- [ ] Voice input updates single field (title only)
- [ ] Voice input updates ingredients (add/remove)
- [ ] Text input works identically
- [ ] Unchanged fields are preserved
- [ ] Unrecognized ingredients show warning toast
- [ ] Preview shows before save
- [ ] Dismiss returns to original state
- [ ] Opik traces appear with correct tags

## Opik Verification

After running updates, check Opik UI for:
- Trace name: `recipe-updater`
- Tags: `recipe`, `update`, `voice-input`, `gemini`
- Metadata: `inputType`, `domain`, `model`, `mode: "update"`

**Mode differentiation**:
- Creation traces: `mode: "creation"` tag + metadata
- Update traces: `mode: "update"` tag + metadata

Also update existing `recipe-editor/prompt.ts` to add `"creation"` tag and `mode: "creation"` metadata.
