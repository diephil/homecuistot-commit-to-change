# Implementation Plan: Promote Unrecognized Items to First-Class Ingredients

**Branch**: `030-unrecognized-items-support` | **Date**: 2026-02-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/030-unrecognized-items-support/spec.md`

## Summary

Unrecognized items (user-entered ingredients not in the 5931-item catalog) exist in the database via XOR pattern in `user_inventory` and `recipe_ingredients`, but the app treats them as second-class: grayed out in inventory, excluded from recipe creation, availability matching, and mark-as-cooked flows. This plan promotes them to full citizens by extending 15 source files across schema, types, server actions, API routes, agent tools, and UI components.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Next.js 16 App Router
**Primary Dependencies**: Drizzle ORM 0.45.1, Supabase Auth, Vercel AI SDK, Google ADK
**Storage**: Supabase PostgreSQL with RLS, Drizzle-managed migrations
**Testing**: Vitest (manual testing primary for MVP)
**Target Platform**: Web (desktop + mobile responsive)
**Project Type**: Monorepo — `apps/nextjs/` is the main app
**Performance Goals**: Standard web app; no new performance concerns (adds ~1 extra query per flow)
**Constraints**: Maintain XOR constraint integrity, RLS enforcement, no schema breaking changes
**Scale/Scope**: 15 files modified, 1 migration, 9 functional areas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. MVP-First | PASS | Enhancement to existing feature, happy paths only |
| II. Pragmatic Type Safety | PASS | Types at boundaries (API inputs), optional fields internally |
| III. Essential Validation | PASS | Validates XOR at DB level, quantity 0-3 at API level |
| IV. Test-Ready Infrastructure | PASS | Manual testing plan in quickstart.md |
| V. Type Derivation | PASS | New types extend existing Drizzle-inferred types |
| VI. Named Parameters | PASS | All modified functions maintain named params pattern |
| VII. Vibrant Neobrutalism | PASS | No new UI components; unrecognized items inherit existing styles |

**Pre-design gate**: PASS
**Post-design gate**: PASS — no new patterns, abstractions, or architectural changes

## Project Structure

### Documentation (this feature)

```text
specs/030-unrecognized-items-support/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: Research decisions
├── data-model.md        # Phase 1: Entity/type changes
├── quickstart.md        # Phase 1: Implementation guide
├── contracts/           # Phase 1: API contracts
│   ├── inventory-api.md
│   ├── recipe-api.md
│   └── cooking-api.md
└── tasks.md             # Phase 2: Task breakdown (by /speckit.tasks)
```

### Source Code (affected files)

```text
apps/nextjs/src/
├── db/schema/
│   └── unrecognized-items.ts      # Add category column
├── types/
│   ├── recipe-agent.ts            # Add unrecognizedItemId to Proposed/Matched types
│   ├── cooking.ts                 # Add unrecognizedItemId to availability/diff/payload types
│   └── inventory.ts               # Add unrecognizedItemId to InventoryDisplayItem
├── lib/agents/recipe-manager/tools/
│   ├── create-recipes.ts          # Query unrecognized_items + merge into matchedByName
│   └── update-recipes.ts          # Same pattern as create-recipes
├── app/
│   ├── api/
│   │   ├── inventory/route.ts     # POST: accept unrecognizedItemId
│   │   └── recipes/apply-proposal/route.ts  # Persist unrecognizedItemId
│   ├── actions/
│   │   ├── cooking-log.ts         # Availability + mark-cooked support
│   │   └── recipes.ts             # CRUD + validateIngredients support
│   └── (protected)/app/
│       ├── inventory/page.tsx     # Merge unrecognized into main flow
│       └── recipes/page.tsx       # Fetch unrecognizedItem relation
└── components/
    ├── recipes/
    │   ├── RecipeCard.tsx          # Display unrecognized ingredient names
    │   └── RecipeEditForm.tsx      # Include unrecognized in edit form
    └── app/
        └── MarkCookedModal.tsx     # Handle unrecognized IDs in diffs
```

**Structure Decision**: Existing Next.js monorepo structure. No new files created — all changes modify existing files.

## Implementation Phases

### Phase 1: Schema + Types (foundation)

**Files**: `unrecognized-items.ts`, `recipe-agent.ts`, `cooking.ts`, `inventory.ts`

1. Add `category` column to `unrecognized_items` schema
2. Run `pnpm db:generate` → `pnpm db:migrate`
3. Add `unrecognizedItemId?` to `ProposedRecipeIngredient`, `MatchedRecipeIngredient`
4. Add `unrecognizedItemId?` to `IngredientWithAvailability`, `IngredientDiff`, `MarkCookedPayload`
5. Add `unrecognizedItemId?` to `InventoryDisplayItem`

**Gate**: `pnpm build` passes (type-only changes, no runtime impact)

### Phase 2: Backend — Agent tools + Apply-proposal

**Files**: `create-recipes.ts`, `update-recipes.ts`, `apply-proposal/route.ts`

1. In both agent tools: after `ingredients` query, query `unrecognized_items` for same user. Merge into `matchedByName`. Set `unrecognizedItemId` on matched results.
2. In `handleCreate`/`handleUpdate`: change valid filter from `ing.ingredientId` to `ing.ingredientId || ing.unrecognizedItemId`. Pass appropriate ID column when inserting `recipe_ingredients`.

**Gate**: Build passes. Recipe creation via voice links unrecognized items.

### Phase 3: Backend — Availability + Mark-as-cooked + Recipes CRUD

**Files**: `cooking-log.ts`, `recipes.ts`, `inventory/route.ts`

1. `getRecipesWithAvailability()`: Add `unrecognizedItem: true` to with clause. Build `unrecognizedInventoryMap`. Extend availability computation.
2. `markRecipeAsCooked()`: Branch on `update.unrecognizedItemId` for inventory update WHERE clause.
3. `getRecipes()`: Add `unrecognizedItem: true` to with clause.
4. `createRecipe()`/`updateRecipe()`: Accept `unrecognizedItemId` in ingredient params. Insert appropriate column.
5. `validateIngredients()`: After catalog lookup, query `unrecognized_items` for remaining names.
6. Inventory POST: Accept `unrecognizedItemId`, use matching partial unique index for upsert.

**Gate**: Build passes. Availability shows correctly for recipes with unrecognized items.

### Phase 4: Frontend — Inventory, Recipes, Mark-as-cooked

**Files**: `inventory/page.tsx`, `recipes/page.tsx`, `RecipeCard.tsx`, `RecipeEditForm.tsx`, `MarkCookedModal.tsx`

1. Inventory page: Convert unrecognized items to `InventoryDisplayItem` with `category: 'non_classified'`. Mix into main flow. Remove separate "Unrecognized Items" section. Update `handleQuantityChange` to pass `unrecognizedItemId` when applicable.
2. Recipes page: Update local Recipe interface to include `unrecognizedItem` relation.
3. RecipeCard: Add `unrecognizedItemId` + `unrecognizedItem` to interface. Display `ri.ingredient?.name ?? ri.unrecognizedItem?.rawText ?? 'Unknown'`.
4. RecipeEditForm: Include unrecognized items in filter (currently filters to `ri.ingredient !== null` only). Track `unrecognizedItemId` in working state. Pass to `updateRecipe()`.
5. MarkCookedModal: Use `i.unrecognizedItemId ?? i.id` as diff key. Pass `unrecognizedItemId` in `handleSave()`.

**Gate**: Full build + lint. All 8 verification scenarios pass.

## Complexity Tracking

No constitution violations. All changes extend existing patterns.

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| XOR constraint violation on insert | Low | DB-level check constraint catches errors |
| Duplicate unrecognized items (same raw text) | Low | First-match wins per spec; documented in edge cases |
| Inventory POST upsert race condition | Low | Partial unique index handles concurrency |
| Missing `unrecognizedItem` relation in queries | Medium | Systematic check: every `with: { ingredient: true }` gets `unrecognizedItem: true` |
