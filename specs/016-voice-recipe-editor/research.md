# Research: Voice Recipe Editor

**Branch**: `016-voice-recipe-editor` | **Date**: 2026-01-28

## Research Questions Resolved

### 1. Existing Voice/Text Input Pattern

**Decision**: Reuse `QuickInputSection` component
**Rationale**: Component already handles voice/text toggle, integrates with `VoiceInput`, supports multiline/single-line modes
**Location**: `src/components/shared/quick-input-section.tsx`

**Key integration points**:
- `inputMode`: "voice" | "text"
- `onVoiceComplete(audioBlob: Blob)`: Callback for voice recording
- `onTextSubmit()`: Callback for text input
- `voiceGuidanceContext`: Supports "recipe" context

### 2. LLM Processing Pattern

**Decision**: Create new `recipe-updater` prompt + process files (parallel to `recipe-editor`)
**Rationale**: Update logic differs from creation - must accept current state, apply partial changes
**Location**: New files in `src/lib/prompts/recipe-updater/`

**Existing pattern to follow**:
```
src/lib/prompts/recipe-editor/
├── prompt.ts      # Prompt definition with name, tags, metadata
└── process.ts     # processVoiceRecipe(), processTextRecipe()
```

### 3. Opik Tracing Pattern

**Decision**: Use `trackGemini()` wrapper with mode-specific tags
**Rationale**: Distinguish creation vs update operations in Opik traces

**Tags by mode**:
- Creation: `["recipe", "creation", "voice-input", "gemini"]`
- Update: `["recipe", "update", "voice-input", "gemini"]`

**Metadata**: `{ inputType: "audio|text", domain: "recipes", model: "gemini-2.0-flash", mode: "creation|update" }`

**Pattern**:
```typescript
const trackedGenAI = trackGemini(genAI, {
  generationName: RECIPE_UPDATER_PROMPT.name,
  traceMetadata: {
    tags: RECIPE_UPDATER_PROMPT.tags,
    ...RECIPE_UPDATER_PROMPT.metadata,
  },
});
// After generation:
await trackedGenAI.flush();
```

### 4. Ingredient Validation Pattern

**Decision**: Reuse existing `/api/recipes/validate` endpoint + `validateIngredients` action
**Rationale**: Same validation logic needed - case-insensitive DB lookup
**Location**: `src/app/actions/recipes.ts` → `validateIngredients()`

**Flow**:
1. LLM outputs ingredient names (lowercase, singular)
2. Call `validateIngredients({ ingredientNames })`
3. Returns `{ matched: [{id, name}], unrecognized: string[] }`
4. Show toast for unrecognized items

### 5. Recipe State Schema for Update Input

**Decision**: Define `RecipeUpdateInput` schema for current recipe state
**Rationale**: LLM needs structured current state to understand what to preserve

**Schema**:
```typescript
const recipeStateSchema = z.object({
  title: z.string(),
  description: z.string(),
  ingredients: z.array(z.object({
    name: z.string(),
    isOptional: z.boolean(),
  })),
});
```

### 6. API Route Structure

**Decision**: Create new routes `/api/recipes/update-voice` and `/api/recipes/update-text`
**Rationale**: Separate from creation routes - different input (current state + user request)

**Request body**:
```typescript
{
  currentRecipe: RecipeState,
  audioBase64?: string,  // for voice
  text?: string,         // for text
}
```

### 7. UI Flow in RecipeForm

**Decision**: Add stages similar to `InventoryUpdateModal`
**Rationale**: Provides clear user flow: Input → Processing → Preview → Save/Dismiss

**Stages**:
1. `input` - Show QuickInputSection (voice/text)
2. `processing` - Loading skeleton
3. `preview` - Show proposed changes with save/dismiss
4. (existing) `form` - Standard form state after save

### 8. Confirmation Stage UX

**Decision**: Show diff-style preview of changes before applying
**Rationale**: Users need to review AI changes before committing

**Preview shows**:
- Title: only if changed
- Description: only if changed
- Ingredients: added/removed/modified badges
- Unrecognized ingredients warning (toast or inline)

## Alternatives Considered

### Voice/Text Component
- **Rejected**: Build custom component → Duplication, inconsistent UX
- **Selected**: Reuse QuickInputSection → Consistent, tested, less code

### LLM Response Format
- **Rejected**: Return only diff/changes → Complex reconstruction logic
- **Selected**: Return complete updated recipe → Simple replacement, easier validation

### Update vs Create Routes
- **Rejected**: Single route with optional currentRecipe → Confusing, harder to trace
- **Selected**: Separate routes → Clear separation, distinct Opik tags

## Technical Constraints

1. **Gemini JSON Schema**: No `z.enum()` support - use `z.string()` for optional flags
2. **Audio Format**: Must be `audio/webm` (base64 encoded)
3. **Response Schema**: Same as `recipeExtractionSchema` - complete recipe state
4. **Ingredient Matching**: Case-insensitive, must use existing `validateIngredients`
