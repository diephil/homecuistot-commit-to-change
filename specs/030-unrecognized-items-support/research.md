# Research: Promote Unrecognized Items to First-Class Ingredients

**Date**: 2026-02-07
**Branch**: `030-unrecognized-items-support`

## R1: Existing XOR Pattern in Schema

**Decision**: Reuse existing XOR constraint pattern — no schema restructuring needed.

**Rationale**: Both `user_inventory` and `recipe_ingredients` already have:
- `ingredientId` / `unrecognizedItemId` columns with XOR check constraint
- Partial unique indexes for each reference type
- Drizzle relations for both sides (`ingredient`, `unrecognizedItem`)

**Alternatives considered**:
- Polymorphic single-column approach — rejected, XOR already in place and working
- Separate junction tables — rejected, would require migration for no benefit

## R2: Category Column on unrecognized_items

**Decision**: Add `category` column with `text('category')` typed as `IngredientCategory`, default `'non_classified'`.

**Rationale**: Allows unrecognized items to participate in category-grouped inventory display without special-casing. The `non_classified` value already exists as a valid category in the enum system.

**Alternatives considered**:
- Virtual/computed category in UI only — rejected, cleaner to have it in schema for consistency
- Nullable category — rejected, always `non_classified` per spec

## R3: Inventory POST Upsert Pattern

**Decision**: Extend inventory POST to accept `unrecognizedItemId` OR `ingredientId` (XOR). Use the existing partial unique index for conflict resolution.

**Rationale**: `user_inventory` already has `idx_user_inventory_unrecognized_unique` partial index. The upsert pattern mirrors the existing `ingredientId`-based upsert with `targetWhere`.

**Implementation detail**:
```typescript
// Existing: targetWhere for ingredientId IS NOT NULL
// New branch: targetWhere for unrecognizedItemId IS NOT NULL
```

## R4: Agent Tool Query Strategy

**Decision**: After querying `ingredients` table, query `unrecognized_items` for same user. Merge into `matchedByName` map. Unrecognized matches take lower priority (catalog wins if both match).

**Rationale**: Both `create-recipes.ts` and `update-recipes.ts` use `adminDb` for read-only lookups. `userId` is already available in the tool closure. Second query adds minimal latency (~5ms for per-user table).

**Alternatives considered**:
- Single UNION query — rejected, different tables with different schemas
- AI agent awareness — rejected per spec (post-hoc only)

## R5: Availability Computation Extension

**Decision**: Build second `unrecognizedInventoryMap` keyed by `unrecognizedItemId`. Extend `knownIngredients` filter to include recipe ingredients with `unrecognizedItemId`. Use `rawText` as display name.

**Rationale**: Minimal change to existing availability logic. Two parallel maps avoid key collisions between ingredient UUIDs and unrecognized item UUIDs.

## R6: Mark-as-Cooked Branching

**Decision**: Branch on `update.unrecognizedItemId` presence in `markRecipeAsCooked()`. Match by `eq(userInventory.unrecognizedItemId, ...)` when present.

**Rationale**: Simplest approach — one `if/else` in the update loop. No need for complex polymorphic dispatch.

## R7: Recipe Display Name Resolution

**Decision**: `ri.ingredient?.name ?? ri.unrecognizedItem?.rawText ?? 'Unknown'` pattern for all recipe display contexts.

**Rationale**: Single fallback chain covers all cases. `'Unknown'` is defensive for corrupted data only.

## R8: Existing `non_classified` Category

**Decision**: Confirmed `non_classified` exists in `enums.ts` as a valid `IngredientCategory` value.

**Verification needed**: Check `src/db/schema/enums.ts` for the category enum definition during implementation.
