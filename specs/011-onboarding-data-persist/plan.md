# Implementation Plan: Onboarding Data Persistence

**Branch**: `011-onboarding-data-persist` | **Date**: 2026-01-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-onboarding-data-persist/spec.md`

## Summary

Persist onboarding data (dishes, ingredients, pantry staples) to database with:
- Step 4 completion screen with 4-second minimum display
- LLM recipe generation via Gemini (speed-optimized model)
- Case-insensitive ingredient matching using `WHERE name IN (...)` clause
- Unrecognized ingredients logged for annotation queue
- Immediate recipe display on /app after completion

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode)
**Primary Dependencies**: React 19, Next.js 16, Drizzle ORM 0.45.1, @google/genai (Gemini), Zod
**Storage**: Supabase PostgreSQL via Drizzle ORM
**Testing**: Manual testing (MVP phase per constitution)
**Target Platform**: Web (Next.js App Router)
**Project Type**: Monorepo - `apps/nextjs/`
**Performance Goals**: 95th percentile persistence < 10 seconds (SC-001)
**Constraints**: Minimum 4-second completion screen, idempotent saves
**Scale/Scope**: Single user onboarding flow, 1-20 dishes typical

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. MVP-First | PASS | Ship working features, manual validation acceptable |
| II. Pragmatic Type Safety | PASS | Type safety at boundaries (API), Zod for validation |
| III. Essential Validation | PASS | Validate user inputs to DB, graceful error handling |
| IV. Test-Ready Infrastructure | PASS | Manual testing for MVP |
| V. Type Derivation | PASS | Use Zod schemas → infer types |
| VI. Named Parameters | PASS | Apply to new functions with 2+ same-type args |
| VII. Neobrutalism Design | PASS | Step 4 uses existing design patterns |
| Non-Negotiable Safeguards | PASS | Parameterized queries, auth validation, no secrets exposed |

## Project Structure

### Documentation (this feature)

```text
specs/011-onboarding-data-persist/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
apps/nextjs/
├── src/
│   ├── app/
│   │   ├── (protected)/app/
│   │   │   ├── onboarding/page.tsx    # Add Step 4, call persist API
│   │   │   └── page.tsx               # Fetch real recipes post-onboarding
│   │   └── api/
│   │       └── onboarding/
│   │           └── persist/route.ts   # NEW: Persistence endpoint
│   ├── lib/
│   │   └── prompts/
│   │       └── recipe-generation/     # NEW: LLM recipe enrichment
│   │           ├── process.ts
│   │           └── prompt.ts
│   ├── db/
│   │   └── schema/                    # Existing schemas sufficient
│   └── types/
│       └── onboarding.ts              # Extend with Step 4 types
└── tests/                             # Manual testing (MVP)
```

**Structure Decision**: Web application within monorepo. New API endpoint follows existing `apps/nextjs/src/app/api/onboarding/` pattern. LLM integration follows `apps/nextjs/src/lib/prompts/` pattern.

## Complexity Tracking

No violations requiring justification.

---

# Phase 0: Outline & Research

## Research Tasks

### RT-001: Gemini Model Selection for Speed

**Question**: Which Gemini model optimizes for speed over accuracy for recipe description generation?

**Decision**: Use `gemini-2.0-flash` (same as existing onboarding endpoints)

**Rationale**:
- Already proven in codebase (`process-voice`, `process-text` endpoints)
- Optimized for speed with structured JSON output
- User input specifies "favor speed over accuracy"
- Users can adjust recipe descriptions later

**Alternatives Considered**:
- `gemini-1.5-flash`: Older, less capable
- `gemini-1.5-pro`: Higher quality but slower
- `gemini-2.0-flash-thinking`: Overkill for simple description generation

### RT-002: Ingredient Matching Strategy

**Question**: How to efficiently match user-entered ingredient names to database IDs?

**Decision**: Single batch query with `WHERE LOWER(name) IN (...)` clause

**Rationale**:
- Per user input: "use WHERE name IN clause with all detected ingredient names, lower cased"
- Efficient single round-trip to database
- Case-insensitive matching via LOWER() function
- Returns matched ingredients; unmatched logged separately

**Implementation Pattern**:
```typescript
const normalizedNames = ingredientNames.map(n => n.toLowerCase())
const matched = await db.select()
  .from(ingredients)
  .where(sql`LOWER(${ingredients.name}) IN ${normalizedNames}`)
```

### RT-003: Unrecognized Item Logging

**Question**: How to handle items not found in database?

**Decision**: Log to `unrecognized_items` table with context='ingredient' or context='dish'

**Rationale**:
- Per user input: "context must either say ingredient or dish"
- Distinguishes unmatched user ingredients vs unmatched LLM-suggested recipe ingredients
- Enables targeted admin review by item type

**Implementation**:
```typescript
// For user-entered ingredients
if (unmatchedUserIngredients.length > 0) {
  console.log(`unrecognized ingredients, will be added to annotation queue: ${unmatchedUserIngredients.join(', ')}`)
  // Insert with context='ingredient'
}

// For LLM-returned recipe ingredients
if (unmatchedRecipeIngredients.length > 0) {
  console.log(`unrecognized ingredients, will be added to annotation queue: ${unmatchedRecipeIngredients.join(', ')}`)
  // Insert with context='ingredient'
}
```

### RT-004: /app Page Integration

**Question**: How should /app display onboarded recipes?

**Decision**:
- Fetch real recipes from `user_recipes` with source='onboarding'
- Display under "Available Recipes" section
- Keep mock data for "Almost Available Recipes" section

**Rationale**:
- Per user input: "display all under available recipes, keep mock data for almost available"
- Immediate feedback after onboarding completion
- Progressive enhancement - real data replaces mock over time

### RT-005: Idempotent Save Pattern

**Question**: How to handle user refresh during Step 4?

**Decision**: Use `ON CONFLICT DO NOTHING` for all inserts

**Rationale**:
- Existing unique indexes on `user_inventory`, `user_pantry_staples`, `user_recipes`
- Prevents duplicate records on retry
- Simple, database-enforced idempotency

---

# Phase 1: Design & Contracts

## Data Model

### Existing Entities (No Changes)

| Entity | Table | Key Fields |
|--------|-------|------------|
| ingredients | `ingredients` | id, name, category |
| userInventory | `user_inventory` | userId, ingredientId, quantityLevel=3 |
| userPantryStaples | `user_pantry_staples` | userId, ingredientId |
| recipes | `recipes` | id, name, description, userId, isSeeded=false |
| userRecipes | `user_recipes` | userId, recipeId, source='onboarding' |
| recipeIngredients | `recipe_ingredients` | recipeId, ingredientId, ingredientType='anchor' |
| unrecognizedItems | `unrecognized_items` | userId, rawText, context='onboarding' |

### State Changes (Onboarding)

**Input State** (from Step 3):
```typescript
{
  dishes: string[]      // User's dish names
  ingredients: string[] // Fridge + pantry merged
  pantry: string[]      // Original pantry selection (Step 2)
}
```

**Output Records**:
1. `recipes` - One per dish with LLM description
2. `user_recipes` - Junction with source='onboarding'
3. `recipe_ingredients` - Links to DB-matched LLM ingredients, type='anchor'
4. `user_inventory` - Matched fridge+pantry ingredients, quantityLevel=3
5. `user_pantry_staples` - Matched pantry ingredients only
6. `unrecognized_items` - Unmatched items with context='ingredient' or 'dish'

**LLM Ingredient Matching**:
- LLM returns ingredient names per recipe
- Match LLM ingredients against `ingredients` table using WHERE IN
- Only matched ingredients create `recipe_ingredients` records
- Unmatched LLM ingredients logged with context='ingredient'

## API Contracts

### POST /api/onboarding/persist

**Request**:
```typescript
{
  dishes: string[]           // Dish names to convert to recipes
  ingredients: string[]      // All ingredients (fridge + pantry)
  pantryItems: string[]      // Pantry-only ingredients
}
```

**Response** (200 OK):
```typescript
{
  success: true
  recipesCreated: number
  inventoryCreated: number
  pantryStaplesCreated: number
  unrecognizedCount: number
}
```

**Error Responses**:
- 400: Invalid request body
- 401: Unauthenticated
- 500: Persistence failed (logged, graceful degradation)

### LLM Contract (Internal)

**Input**: Dish name (string)
**Output** (JSON schema enforced):
```typescript
{
  description: string    // Max 15 words, 1 sentence
  ingredients: string[]  // 1-6 ingredient names
}
```

## Quickstart

### Implementation Order

1. **API Endpoint** (`/api/onboarding/persist`)
   - Auth validation
   - Ingredient matching (WHERE IN clause)
   - Unrecognized logging
   - Recipe/inventory inserts

2. **LLM Integration** (`lib/prompts/recipe-generation/`)
   - Prompt template
   - Gemini 2.0 flash call
   - Zod schema validation

3. **Step 4 UI** (onboarding page)
   - Completion screen with message
   - 4-second minimum timer
   - API call + redirect

4. **/app Page Update**
   - Fetch user recipes
   - Display in Available Recipes
   - Keep mock for Almost Available

### Key Integration Points

```typescript
// 1. Auth pattern (existing)
const supabase = await createClient()
const { data: { session } } = await supabase.auth.getSession()
const userId = session?.user?.id

// 2. RLS-aware DB (existing pattern)
const token = decodeSupabaseToken(session.access_token)
const db = createUserDb(token)

// 3. Ingredient matching (new - per user requirements)
const normalizedNames = ingredients.map(n => n.toLowerCase())
const matched = await db.select()
  .from(ingredientsTable)
  .where(sql`LOWER(${ingredientsTable.name}) IN (${sql.join(normalizedNames.map(n => sql`${n}`), sql`, `)})`)

// 4. Log unrecognized user ingredients (context='ingredient')
const matchedSet = new Set(matched.map(i => i.name.toLowerCase()))
const unmatchedUser = ingredients.filter(n => !matchedSet.has(n.toLowerCase()))
if (unmatchedUser.length > 0) {
  console.log(`unrecognized ingredients, will be added to annotation queue: ${unmatchedUser.join(', ')}`)
  // Insert with context='ingredient'
}

// 5. After LLM call, match LLM ingredients against DB
const llmIngredientNames = recipeDetails.flatMap(r => r.ingredients)
const llmMatched = await db.select()
  .from(ingredientsTable)
  .where(sql`LOWER(${ingredientsTable.name}) IN (${sql.join(llmIngredientNames.map(n => sql`${n.toLowerCase()}`), sql`, `)})`)

// 6. Log unrecognized LLM ingredients (context='ingredient')
const llmMatchedSet = new Set(llmMatched.map(i => i.name.toLowerCase()))
const unmatchedLlm = llmIngredientNames.filter(n => !llmMatchedSet.has(n.toLowerCase()))
if (unmatchedLlm.length > 0) {
  console.log(`unrecognized ingredients, will be added to annotation queue: ${unmatchedLlm.join(', ')}`)
  // Insert with context='ingredient'
}

// 7. Gemini call (existing pattern)
const response = await trackedGenAI.models.generateContent({
  model: "gemini-2.0-flash",
  contents: [...],
  config: { responseMimeType: "application/json", responseSchema }
})
```

---

## Unresolved Questions

1. **Batch LLM calls**: Process all dishes in single prompt or one per dish?
2. **Recipe dedup**: What if user adds same dish name twice across sessions?
3. **Minimum ingredients**: Step 3 allows completion with 0 dishes - still call LLM?
