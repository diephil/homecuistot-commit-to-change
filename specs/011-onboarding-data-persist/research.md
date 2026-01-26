# Research: Onboarding Data Persistence

**Feature**: 011-onboarding-data-persist | **Date**: 2026-01-26

## RT-001: Gemini Model Selection

**Question**: Which model for recipe description generation?

**Decision**: `gemini-2.0-flash`

**Evidence**:
- Existing codebase uses it for onboarding NLP (`process-voice`, `process-text`)
- User requirement: "favor speed over accuracy"
- Supports structured JSON output with schema enforcement

**Trade-offs**:
| Model | Speed | Quality | Cost |
|-------|-------|---------|------|
| gemini-2.0-flash | Fast | Good | Low |
| gemini-1.5-pro | Slow | Better | Higher |
| gemini-2.0-flash-thinking | Medium | Better | Medium |

## RT-002: Ingredient Matching

**Question**: How to match user ingredients to DB IDs?

**Decision**: `WHERE LOWER(name) IN (...)`

**Evidence**:
- User requirement: explicit "WHERE name IN clause"
- 5931 ingredients in DB - batch query efficient
- Case-insensitive via LOWER() function

**Drizzle Pattern**:
```typescript
import { sql, inArray } from 'drizzle-orm'

const matched = await db.select()
  .from(ingredients)
  .where(sql`LOWER(${ingredients.name}) IN (${sql.join(
    normalizedNames.map(n => sql`${n}`),
    sql`, `
  )})`)
```

## RT-003: Unrecognized Logging

**Question**: How to handle unmatched items?

**Decision**: Log to console + insert to `unrecognized_items` with context='ingredient' or 'dish'

**User Requirement**:
- Context must specify item type: 'ingredient' or 'dish'
- Enables targeted admin review by category

**Implementation**:
```typescript
// User-entered ingredients not found in DB
if (unmatchedUserIngredients.length > 0) {
  console.log(`unrecognized ingredients, will be added to annotation queue: ${unmatchedUserIngredients.join(', ')}`)
  await tx.insert(unrecognizedItems).values(
    unmatchedUserIngredients.map(rawText => ({
      userId,
      rawText,
      context: 'ingredient'
    }))
  )
}

// LLM-suggested ingredients not found in DB
if (unmatchedLlmIngredients.length > 0) {
  console.log(`unrecognized ingredients, will be added to annotation queue: ${unmatchedLlmIngredients.join(', ')}`)
  await tx.insert(unrecognizedItems).values(
    unmatchedLlmIngredients.map(rawText => ({
      userId,
      rawText,
      context: 'ingredient'
    }))
  )
}
```

## RT-004: /app Page Display

**Question**: How to show onboarded recipes?

**Decision**:
- "Available Recipes": Real data from `user_recipes` where source='onboarding'
- "Almost Available": Keep mock data (existing MOCK_RECIPES)

**User Requirement Quote**:
> "display them all under available recipes and keep mock data for the 'almost available recipes' section"

## RT-005: Idempotency

**Question**: Handle refresh during Step 4?

**Decision**: `ON CONFLICT DO NOTHING`

**Existing Unique Indexes**:
- `idx_user_inventory_unique` on (userId, ingredientId)
- `idx_user_pantry_staples_unique` on (userId, ingredientId)
- `idx_user_recipes_unique` on (userId, recipeId)

**Drizzle Pattern**:
```typescript
await tx.insert(userInventory)
  .values(records)
  .onConflictDoNothing()
```

## RT-006: LLM Batch Strategy

**Question**: Single prompt or per-dish calls?

**Decision**: Single prompt with all dishes (batch)

**Rationale**:
- Reduces API round-trips
- Gemini handles array outputs well
- Typical flow: 1-5 dishes = 1 API call

**Schema**:
```typescript
const RecipeBatchSchema = z.array(z.object({
  dishName: z.string(),
  description: z.string().max(100),
  ingredients: z.array(z.string()).min(1).max(6)
}))
```

## RT-007: LLM Ingredient Matching

**Question**: How to link LLM-returned ingredients to recipe_ingredients?

**Decision**: Match LLM ingredients against DB before creating recipe_ingredients

**Flow**:
1. LLM returns ingredient names per recipe
2. Collect all unique ingredient names from LLM response
3. Query DB: `WHERE LOWER(name) IN (...)`
4. For matched: create `recipe_ingredients` with ingredient ID
5. For unmatched: log to `unrecognized_items` with context='ingredient'

**Rationale**:
- recipe_ingredients requires FK to ingredients.id
- Only DB-verified ingredients get linked
- Unmatched ingredients tracked for future DB expansion
