# Tasks: Promote Unrecognized Items to First-Class Ingredients

**Branch**: `030-unrecognized-items-support` | **Generated**: 2026-02-07
**Source**: plan.md, spec.md, data-model.md, research.md, contracts/*.md

## Task Summary

| Phase | Tasks | Priority | Description |
|-------|-------|----------|-------------|
| 1 — Schema | 2 | P0 | Migration + category column |
| 2 — Types | 3 | P0 | Type additions across 3 files |
| 3 — Backend (P1) | 4 | P1 | Agent tools + apply-proposal + inventory POST |
| 4 — Backend (P2) | 4 | P2 | Availability + mark-cooked + recipes CRUD |
| 5 — Frontend (P1) | 2 | P1 | Inventory page integration |
| 6 — Frontend (P2) | 3 | P2 | Recipe card + mark-cooked modal |
| 7 — Frontend (P3) | 1 | P3 | Recipe edit form |
| 8 — Verification | 2 | P0 | Build + lint gate |
| **Total** | **21** | | |

## Dependency Graph

```
T01 → T02 → T03,T04,T05 → T06,T07,T08,T09 → T10,T11 → T12,T13,T14 → T15,T16,T17 → T18 → T19 → T20,T21
          ↗ (parallel)     ↗ (parallel)        (parallel) ↗  (parallel)   (parallel) ↗
```

---

## Phase 1 — Schema (P0, foundation)

- [ ] **T01** [P0] Add `category` column to `unrecognized_items` schema
  - **File**: `src/db/schema/unrecognized-items.ts`
  - **Do**: Add `category: text('category').notNull().default('non_classified')` to the table definition
  - **Ref**: data-model.md § Entity Changes, research.md § R2, R8
  - **Verify**: `pnpm build` passes (schema-only change)

- [ ] **T02** [P0] Generate and apply migration
  - **Blocked by**: T01
  - **Do**: Run `pnpm db:generate && pnpm db:migrate`
  - **Verify**: `pnpm db:status` shows new column applied; existing rows get `'non_classified'` default

---

## Phase 2 — Types (P0, enables all subsequent phases)

> All 3 tasks are independent — can run in parallel after T02.

- [ ] **T03** [P0] [US1,US2] Add `unrecognizedItemId` to recipe-agent types
  - **Blocked by**: T02
  - **File**: `src/types/recipe-agent.ts`
  - **Do**:
    - `ProposedRecipeIngredient`: add `unrecognizedItemId?: string`
    - `MatchedRecipeIngredient`: add `unrecognizedItemId?: string`
  - **Ref**: data-model.md § Type Changes

- [ ] **T04** [P0] [US3,US4] Add `unrecognizedItemId` to cooking types
  - **Blocked by**: T02
  - **File**: `src/types/cooking.ts`
  - **Do**:
    - `IngredientWithAvailability`: add `unrecognizedItemId?: string`
    - `IngredientDiff`: add `unrecognizedItemId?: string`
    - `MarkCookedPayload.ingredientUpdates[]`: add `unrecognizedItemId?: string`
  - **Ref**: data-model.md § Type Changes, contracts/cooking-api.md

- [ ] **T05** [P0] [US1] Add `unrecognizedItemId` to inventory types
  - **Blocked by**: T02
  - **File**: `src/types/inventory.ts`
  - **Do**: `InventoryDisplayItem`: add `unrecognizedItemId?: string`
  - **Ref**: data-model.md § Type Changes

---

## Phase 3 — Backend P1 (agent tools + apply-proposal + inventory)

- [ ] **T06** [P1] [US2] Extend `create-recipes` agent tool to match unrecognized items
  - **Blocked by**: T03
  - **File**: `src/lib/agents/recipe-manager/tools/create-recipes.ts`
  - **Do**:
    1. After existing `ingredients` query (~line 87-98), add query: `adminDb` select from `unrecognizedItems` where `userId = userId` and `lower(rawText) IN (lowercased ingredient names)`
    2. Merge results into `matchedByName` map — catalog matches take priority (don't overwrite existing entries)
    3. Set `unrecognizedItemId` on matched results instead of `ingredientId`
  - **Ref**: research.md § R4, data-model.md § Query Pattern Changes

- [ ] **T07** [P1] [US2] Extend `update-recipes` agent tool to match unrecognized items
  - **Blocked by**: T03
  - **File**: `src/lib/agents/recipe-manager/tools/update-recipes.ts`
  - **Do**: Same pattern as T06 — query unrecognized items, merge into matchedByName, set unrecognizedItemId
  - **Ref**: research.md § R4 (identical pattern)

- [ ] **T08** [P1] [US2] Extend `apply-proposal` route to persist unrecognized item links
  - **Blocked by**: T03
  - **File**: `src/app/api/recipes/apply-proposal/route.ts`
  - **Do**:
    1. `handleCreate`: change `validIngredients` filter from `ing.ingredientId` to `ing.ingredientId || ing.unrecognizedItemId`
    2. When inserting `recipe_ingredients`: if `unrecognizedItemId` present → set `unrecognizedItemId` column (not `ingredientId`)
    3. `handleUpdate`: same pattern as handleCreate
  - **Ref**: contracts/recipe-api.md § POST /api/recipes/apply-proposal

- [ ] **T09** [P1] [US1] Extend inventory POST to accept `unrecognizedItemId`
  - **Blocked by**: T05
  - **File**: `src/app/api/inventory/route.ts`
  - **Do**:
    1. Modify validation: accept `unrecognizedItemId` OR `ingredientId` (XOR — exactly one required)
    2. Add upsert branch for `unrecognizedItemId`: `onConflictDoUpdate` targeting `[userId, unrecognizedItemId]` with `targetWhere: unrecognizedItemId IS NOT NULL`
    3. Insert branch: set `unrecognizedItemId` column instead of `ingredientId`
  - **Ref**: contracts/inventory-api.md, research.md § R3

---

## Phase 4 — Backend P2 (availability + mark-cooked + recipes CRUD)

- [ ] **T10** [P2] [US3] Extend `getRecipesWithAvailability()` for unrecognized items
  - **Blocked by**: T04
  - **File**: `src/app/actions/cooking-log.ts`
  - **Do**:
    1. Add `unrecognizedItem: true` to `recipeIngredients.with` clause
    2. Add `unrecognizedItemId` to inventory select fields
    3. Build `unrecognizedInventoryMap` keyed by `unrecognizedItemId`
    4. Extend `knownIngredients` filter: include recipe ingredients with `unrecognizedItemId`
    5. Use `unrecognizedInventoryMap` for availability lookup when `ri.unrecognizedItemId` present
    6. Use `ri.unrecognizedItem?.rawText` as display name
  - **Ref**: contracts/cooking-api.md § getRecipesWithAvailability, research.md § R5

- [ ] **T11** [P2] [US4] Extend `markRecipeAsCooked()` for unrecognized items
  - **Blocked by**: T04
  - **File**: `src/app/actions/cooking-log.ts`
  - **Do**:
    1. In update loop: if `update.unrecognizedItemId` present → match by `eq(userInventory.unrecognizedItemId, update.unrecognizedItemId)`
    2. Else → existing behavior (`eq(userInventory.ingredientId, update.ingredientId)`)
  - **Ref**: contracts/cooking-api.md § markRecipeAsCooked, research.md § R6

- [ ] **T12** [P2] [US2,US5] Extend recipes server actions for unrecognized items
  - **Blocked by**: T03, T04
  - **File**: `src/app/actions/recipes.ts`
  - **Do**:
    1. `getRecipes()`: add `unrecognizedItem: true` to `recipeIngredients.with` clause
    2. `createRecipe()`: accept `unrecognizedItemId?` in ingredient params; insert appropriate column
    3. `updateRecipe()`: same as createRecipe pattern
    4. `validateIngredients()`: after catalog lookup, query `unrecognized_items` for remaining unmatched names (scoped to current user). Return `matchedUnrecognized: Array<{ id: string; rawText: string }>` alongside existing `matched` and `unrecognized`
  - **Ref**: contracts/recipe-api.md § Server Actions

- [ ] **T13** [P2] [US1] Extend inventory POST with pantry staple support for unrecognized items
  - **Blocked by**: T09
  - **File**: `src/app/api/inventory/route.ts`
  - **Note**: Verify PATCH toggle-staple and DELETE already work by inventory row `id` (no change expected per contracts/inventory-api.md). If not, fix here.
  - **Ref**: contracts/inventory-api.md § PATCH, DELETE

---

## Phase 5 — Frontend P1 (inventory)

- [ ] **T14** [P1] [US1] Merge unrecognized items into main inventory list
  - **Blocked by**: T05, T09
  - **File**: `src/app/(protected)/app/inventory/page.tsx`
  - **Do**:
    1. Convert unrecognized items to `InventoryDisplayItem` with `category: 'non_classified'`, `ingredientId: ''`, `unrecognizedItemId: item.unrecognizedItemId`, `name: item.rawText`
    2. Merge into main `inventoryItems` array (no separate section)
    3. Remove or collapse the existing "Unrecognized Items" separate section
    4. Items appear under "Non-Classified" category group in sorted list
  - **Ref**: spec.md § US1, FR-001, FR-005

- [ ] **T15** [P1] [US1] Update inventory quantity/staple handlers for unrecognized items
  - **Blocked by**: T14
  - **File**: `src/app/(protected)/app/inventory/page.tsx`
  - **Do**:
    1. `handleQuantityChange`: when item has `unrecognizedItemId`, send `unrecognizedItemId` instead of `ingredientId` in POST body
    2. Verify delete and toggle-staple handlers work with inventory row `id` (should work already)
  - **Ref**: spec.md § US1 AS2-AS4, contracts/inventory-api.md

---

## Phase 6 — Frontend P2 (recipe display + mark-cooked)

- [ ] **T16** [P2] [US2,US3] Update RecipeCard to display unrecognized ingredient names
  - **Blocked by**: T12
  - **File**: `src/components/recipes/RecipeCard.tsx`
  - **Do**:
    1. Remove or relax filter that requires `ri.ingredient !== null`
    2. Include ingredients with `ri.unrecognizedItemId` / `ri.unrecognizedItem`
    3. Display name: `ri.ingredient?.name ?? ri.unrecognizedItem?.rawText ?? 'Unknown'`
    4. Add `unrecognizedItemId` + `unrecognizedItem` to component interface
  - **Ref**: research.md § R7, spec.md § FR-008

- [ ] **T17** [P2] [US3] Update recipes page to fetch unrecognizedItem relations
  - **Blocked by**: T12
  - **File**: `src/app/(protected)/app/recipes/page.tsx`
  - **Do**: Update local Recipe interface / type to include `unrecognizedItem` relation on recipe ingredients
  - **Ref**: spec.md § US3

- [ ] **T18** [P2] [US4] Update MarkCookedModal for unrecognized ingredients
  - **Blocked by**: T10, T11
  - **File**: `src/components/app/MarkCookedModal.tsx`
  - **Do**:
    1. `initializeDiffs`: use `i.unrecognizedItemId` as alternate key; set `unrecognizedItemId` on diff entries
    2. Display name: `i.name` (already computed from availability) or fallback chain
    3. `handleSave`: pass `unrecognizedItemId` in `ingredientUpdates` when present
  - **Ref**: contracts/cooking-api.md, spec.md § US4

---

## Phase 7 — Frontend P3 (recipe editing)

- [ ] **T19** [P3] [US5] Update RecipeEditForm for unrecognized ingredients
  - **Blocked by**: T12, T16
  - **File**: `src/components/recipes/RecipeEditForm.tsx`
  - **Do**:
    1. Remove filter that excludes `ri.ingredient === null` — include unrecognized ingredients
    2. Track `unrecognizedItemId` in working ingredient state
    3. Display name: `ri.ingredient?.name ?? ri.unrecognizedItem?.rawText ?? 'Unknown'`
    4. `handleSubmit`: pass `unrecognizedItemId` when present in `updateRecipe()` call
  - **Ref**: spec.md § US5, FR-012

---

## Phase 8 — Verification (gate)

- [ ] **T20** [P0] Build verification
  - **Blocked by**: T01–T19
  - **Do**: `pnpm build` — zero type errors
  - **Verify**: Clean build output

- [ ] **T21** [P0] Lint verification
  - **Blocked by**: T20
  - **Do**: `pnpm lint` — only pre-existing errors (useStoryState.ts:47, MarkCookedModal.tsx:182)
  - **Verify**: No new lint errors introduced

---

## Parallel Execution Opportunities

| Group | Tasks | Rationale |
|-------|-------|-----------|
| Types | T03, T04, T05 | Independent files, no cross-deps |
| Agent tools | T06, T07 | Identical pattern, different files |
| Backend P1 | T08, T09 | Different files, different concerns |
| Backend P2 | T10, T11 | Same file but different functions |
| Backend P2+ | T12, T13 | Different files |
| Frontend P1 | T14 then T15 | Sequential (T15 depends on T14) |
| Frontend P2 | T16, T17, T18 | Different files, independent |
| Verification | T20 then T21 | Sequential (lint after build) |

## MVP Scope

**Minimum viable**: T01–T09, T14–T15 (Phase 1–3 + Phase 5) = **11 tasks**
- Delivers: US1 (inventory parity) + US2 (recipe creation) — both P1
- Defers: US3 (availability), US4 (mark-cooked), US5 (recipe editing)

**Full scope**: All 21 tasks for complete feature delivery.
