# Implementation Plan: Unrecognized Items Schema Migration

**Branch**: `018-unrecognized-items-schema` | **Date**: 2026-01-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/018-unrecognized-items-schema/spec.md`

## Summary

Add `unrecognized_item_id` column to `recipe_ingredients` and `user_inventory` tables, making `ingredient_id` nullable with XOR constraint (exactly one must be set). Update Drizzle schemas, relations, and generate migration.

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode)
**Primary Dependencies**: Drizzle ORM 0.45.1, postgres 3.4.8, Next.js 16
**Storage**: Supabase PostgreSQL via Drizzle
**Testing**: Manual validation (MVP phase)
**Target Platform**: Web (Next.js App Router)
**Project Type**: Web application (monorepo: apps/nextjs)
**Performance Goals**: N/A (schema migration only)
**Constraints**: Preserve existing data, backward compatible
**Scale/Scope**: 2 tables modified, ~10 files may need TypeScript updates

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. MVP-First Development | ✅ PASS | Schema migration enables future features |
| II. Pragmatic Type Safety | ✅ PASS | Nullable types properly defined |
| III. Essential Validation Only | ✅ PASS | XOR constraint at DB level |
| IV. Test-Ready Infrastructure | ✅ PASS | Manual validation acceptable for MVP |
| V. Type Derivation | ✅ PASS | Types derived from Drizzle schema |
| VI. Named Parameters | N/A | No new functions with 3+ params |
| VII. Neo-Brutalist Design | N/A | No UI changes |
| Non-Negotiable Safeguards | ✅ PASS | No data loss, no auth bypass |

## Project Structure

### Documentation (this feature)

```text
specs/018-unrecognized-items-schema/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
apps/nextjs/src/
├── db/
│   ├── schema/
│   │   ├── user-inventory.ts     # MODIFY: add unrecognized_item_id, nullable ingredient_id
│   │   ├── user-recipes.ts       # MODIFY: add unrecognized_item_id, nullable ingredient_id
│   │   └── unrecognized-items.ts # MODIFY: add relations
│   └── migrations/               # NEW: generated migration
├── app/
│   ├── actions/
│   │   ├── inventory.ts          # CHECK: may need type updates
│   │   ├── recipes.ts            # CHECK: may need type updates
│   │   ├── cooking-log.ts        # CHECK: may need type updates
│   │   └── user-data.ts          # CHECK: may need type updates
│   └── api/
│       └── inventory/            # CHECK: may need type updates
└── components/
    └── recipes/                  # CHECK: may need type updates
```

**Structure Decision**: Existing monorepo structure maintained. Changes isolated to db/schema and dependent TypeScript files.

## Affected Files Analysis

Files using `userInventory` or `recipeIngredients`:

| File | Impact | Action |
|------|--------|--------|
| `src/db/schema/user-inventory.ts` | HIGH | Modify schema |
| `src/db/schema/user-recipes.ts` | HIGH | Modify schema (recipeIngredients) |
| `src/db/schema/unrecognized-items.ts` | MEDIUM | Add relations |
| `src/app/actions/inventory.ts` | LOW | Check type compatibility |
| `src/app/actions/recipes.ts` | LOW | Check type compatibility |
| `src/app/actions/cooking-log.ts` | LOW | Check type compatibility |
| `src/app/actions/user-data.ts` | LOW | Check type compatibility |
| `src/app/api/inventory/*.ts` | LOW | Check type compatibility |
| `src/components/recipes/*.tsx` | LOW | Check type compatibility |

## Complexity Tracking

No constitution violations. Simple schema migration within existing patterns.
