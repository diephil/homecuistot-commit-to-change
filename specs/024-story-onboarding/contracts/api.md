# API Contracts: Story-Based Onboarding

## POST /api/onboarding/story/process-input

Unified input processing for Scene 4. Accepts voice (audio) OR text input. Extracts ingredient names via LLM, validates against DB. No database writes.

### Request

```typescript
{
  audioBase64?: string          // Base64-encoded WebM/Opus audio (voice mode)
  text?: string                 // User-typed ingredient list (text fallback mode)
  currentIngredients: string[]  // Names already in demo inventory (for context)
}
```

**Validation**: At least one of `audioBase64` or `text` must be provided. If both are provided, `audioBase64` takes priority.

### Response (200)

```typescript
{
  add: string[]                 // Recognized ingredient names to add
  rm: string[]                  // Recognized ingredient names to remove
  transcribedText?: string      // Raw transcription (present when audioBase64 provided)
  unrecognized?: string[]       // Names not found in ingredients table
}
```

### Errors

| Status | Body | When |
|--------|------|------|
| 401 | `{ error: "Unauthorized" }` | No valid session |
| 400 | `{ error: "Either audioBase64 or text is required" }` | Neither audio nor text provided |
| 408 | `{ error: "Request timeout. Please try again." }` | Gemini timeout |
| 500 | `{ error: "Processing failed. Please try again." }` | LLM/Zod failure |

### Implementation Notes

- Calls `ingredientExtractorAgent()` from `@/lib/agents/ingredient-extractor/agent` directly — it already supports both `text` and `audioBase64` params
- Creates Opik trace via `createAgentTrace()` (same pattern as `processVoiceInput()`)
- Validates extracted names with `validateIngredientNames()` from `@/lib/services/ingredient-matcher`
- `maxDuration = 15`
- Auth via Supabase `getUser()`
- `currentIngredients` passed as context to the LLM prompt for better extraction

---

## POST /api/onboarding/story/complete

Complete story onboarding. Detects brand-new vs returning user. Pre-fills demo data for brand-new users.

### Request

```typescript
{
  ingredients: string[]         // Non-staple ingredient names (max 100)
  pantryStaples: string[]       // Pantry staple names (max 100)
  recipes: Array<{
    name: string                // Recipe title (max 200 chars)
    description?: string
    ingredients: Array<{
      name: string              // Ingredient name (max 100 chars)
      type: 'anchor' | 'optional'
    }>
  }>                            // Max 20 recipes
}
```

### Response (200) — Brand-New User

```typescript
{
  success: true
  isNewUser: true
  inventoryCreated: number
  recipesCreated: number
  unrecognizedIngredients: number
  unrecognizedRecipeIngredients: number
}
```

### Response (200) — Returning User

```typescript
{
  success: true
  isNewUser: false
  inventoryCreated: 0
  recipesCreated: 0
  unrecognizedIngredients: 0
  unrecognizedRecipeIngredients: 0
}
```

### Errors

| Status | Body | When |
|--------|------|------|
| 401 | `{ error: "Unauthorized" }` | No valid session |
| 400 | `{ error: "Invalid request body", details: "..." }` | Zod validation failure |
| 500 | `{ error: "Failed to complete story onboarding" }` | Transaction failure |

### Implementation Notes

- `maxDuration = 30`
- Auth via Supabase `getUser()` + `getSession()`
- Brand-new detection: `SELECT count(*) FROM user_inventory WHERE user_id = $1` + `SELECT count(*) FROM user_recipes WHERE user_id = $1` — both must be 0
- Pre-fill uses single Drizzle transaction (same pattern as `/api/onboarding/complete`)
- Uses `matchIngredients()` to resolve ingredient names → IDs
- Uses `ensureRecipeIngredientsAtQuantity()` from `@/db/services/ensure-recipe-ingredients-at-quantity` for recipe ingredient inventory entries
- Revalidates `/app/onboarding` and `/app` paths on success
- Request schema reuses `CompleteRequestSchema` from `@/types/onboarding` (minus `id` on recipe ingredients)
