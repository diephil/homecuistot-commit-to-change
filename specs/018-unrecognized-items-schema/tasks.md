# Tasks: Unrecognized Items Schema Migration

**Input**: Design documents from `/specs/018-unrecognized-items-schema/`
**Prerequisites**: plan.md, spec.md, data-model.md

**Context**: Local DB has a migration (hash: `a90e3f21b7a263761ad35f1fdb508879c4b3a543e8e9a9bbf8db9cb004058327`) that must be reverted before applying new schema changes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project root**: `apps/nextjs/`
- **Schema files**: `apps/nextjs/src/db/schema/`
- **Migrations**: `apps/nextjs/src/db/migrations/`

---

## Phase 1: Local DB Revert (BLOCKING)

**Purpose**: Revert the rogue migration from local database to sync with codebase state

**⚠️ CRITICAL**: This phase must complete before any schema changes

- [x] T001 Query drizzle migration table to identify migration with hash `a90e3f21b7a263761ad35f1fdb508879c4b3a543e8e9a9bbf8db9cb004058327` and understand what changes it made
- [x] T002 Analyze current database state vs expected state from codebase migrations to identify exact differences
- [x] T003 Generate SQL commands to revert the rogue migration changes (reverse ALTER TABLE, DROP COLUMN, DROP CONSTRAINT operations)
- [x] T004 Execute revert SQL on local database to restore schema to codebase baseline
- [x] T005 Delete the rogue migration entry from `drizzle.__drizzle_migrations` table
- [x] T006 Verify local database schema matches codebase migrations using `pnpm db:status`

**Checkpoint**: Local DB now matches codebase migrations - ready for new schema changes

---

## Phase 2: Drizzle Schema Updates (US3)

**Purpose**: Update TypeScript Drizzle schema files to define new structure

**Goal**: TypeScript schemas define the new column structure, constraints, and relations

**Independent Test**: `pnpm build` succeeds, `pnpm db:generate` produces expected migration

### Implementation for User Story 3

- [x] T007 [P] [US3] Update `apps/nextjs/src/db/schema/user-recipes.ts`: add nullable `unrecognized_item_id` column to `recipeIngredients` table with FK to `unrecognizedItems.id`
- [x] T008 [P] [US3] Update `apps/nextjs/src/db/schema/user-recipes.ts`: change `ingredient_id` from `.notNull()` to nullable
- [x] T009 [P] [US3] Update `apps/nextjs/src/db/schema/user-recipes.ts`: add XOR check constraint `(ingredient_id IS NOT NULL) != (unrecognized_item_id IS NOT NULL)`
- [x] T010 [P] [US3] Update `apps/nextjs/src/db/schema/user-recipes.ts`: replace `idx_recipe_ingredients_unique` with two partial unique indexes
- [x] T011 [P] [US3] Update `apps/nextjs/src/db/schema/user-recipes.ts`: update `recipeIngredientsRelations` to include `unrecognizedItem` relation
- [x] T012 [P] [US3] Update `apps/nextjs/src/db/schema/user-inventory.ts`: add nullable `unrecognized_item_id` column with FK to `unrecognizedItems.id`
- [x] T013 [P] [US3] Update `apps/nextjs/src/db/schema/user-inventory.ts`: change `ingredient_id` from `.notNull()` to nullable
- [x] T014 [P] [US3] Update `apps/nextjs/src/db/schema/user-inventory.ts`: add XOR check constraint `(ingredient_id IS NOT NULL) != (unrecognized_item_id IS NOT NULL)`
- [x] T015 [P] [US3] Update `apps/nextjs/src/db/schema/user-inventory.ts`: replace `idx_user_inventory_unique` with two partial unique indexes
- [x] T016 [P] [US3] Update `apps/nextjs/src/db/schema/user-inventory.ts`: update `userInventoryRelations` to include `unrecognizedItem` relation
- [x] T017 [US3] Update `apps/nextjs/src/db/schema/unrecognized-items.ts`: add `unrecognizedItemsRelations` with `many(userInventory)` and `many(recipeIngredients)`

**Checkpoint**: TypeScript schemas define new structure - ready for migration generation

---

## Phase 3: Migration Generation (US1 + US2)

**Purpose**: Generate and apply Drizzle migration for database changes

**Goal**: Database schema matches TypeScript definitions

**Independent Test**: Migration applies without errors, XOR constraint rejects invalid inserts

### Implementation for User Stories 1 & 2

- [x] T018 [US1] [US2] Run `pnpm db:generate` from `apps/nextjs/` to generate new migration
- [x] T019 [US1] [US2] Review generated migration SQL in `apps/nextjs/src/db/migrations/` for correctness
- [x] T020 [US1] [US2] Run `pnpm db:migrate` to apply migration to local database
- [x] T021 [US1] Validate `recipe_ingredients` table: insert with only `unrecognized_item_id` succeeds
- [x] T022 [US1] Validate `recipe_ingredients` table: insert with only `ingredient_id` succeeds
- [x] T023 [US1] Validate `recipe_ingredients` table: insert with both NULL fails (XOR constraint)
- [x] T024 [US1] Validate `recipe_ingredients` table: insert with both set fails (XOR constraint)
- [x] T025 [US2] Validate `user_inventory` table: insert with only `unrecognized_item_id` succeeds
- [x] T026 [US2] Validate `user_inventory` table: insert with only `ingredient_id` succeeds
- [x] T027 [US2] Validate `user_inventory` table: insert with both NULL fails (XOR constraint)
- [x] T028 [US2] Validate `user_inventory` table: insert with both set fails (XOR constraint)

**Checkpoint**: Database schema updated and validated - XOR constraints working

---

## Phase 4: TypeScript Compatibility Fixes

**Purpose**: Fix any TypeScript errors in code using the modified schemas

**Goal**: `pnpm build` succeeds with no errors

- [x] T029 Run `pnpm build` and identify TypeScript errors related to schema changes
- [x] T030 [P] Fix type errors in `apps/nextjs/src/app/actions/inventory.ts` if any (handle nullable `ingredientId`)
- [x] T031 [P] Fix type errors in `apps/nextjs/src/app/actions/recipes.ts` if any (handle nullable `ingredientId`)
- [x] T032 [P] Fix type errors in `apps/nextjs/src/app/actions/cooking-log.ts` if any
- [x] T033 [P] Fix type errors in `apps/nextjs/src/app/actions/user-data.ts` if any
- [x] T034 [P] Fix type errors in `apps/nextjs/src/app/api/inventory/` route files if any
- [x] T035 [P] Fix type errors in `apps/nextjs/src/components/recipes/` components if any
- [x] T036 Run `pnpm build` to verify all TypeScript errors resolved

**Checkpoint**: Project builds successfully - all TypeScript code compatible with new schema

---

## Phase 5: Validation & Completion

**Purpose**: Final validation and cleanup

- [x] T037 Verify existing data preserved: check row counts in `user_inventory` and `recipe_ingredients` tables
- [x] T038 Run `pnpm db:status` to confirm migration logged correctly
- [x] T039 Test application: verify existing inventory and recipe features still work
- [x] T040 Commit all changes with message: `feat(db): add unrecognized_item_id to recipe_ingredients and user_inventory`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (DB Revert)**: BLOCKING - must complete before any other phase
- **Phase 2 (Schema Updates)**: Depends on Phase 1 completion
- **Phase 3 (Migration)**: Depends on Phase 2 completion
- **Phase 4 (TS Fixes)**: Depends on Phase 3 completion
- **Phase 5 (Validation)**: Depends on Phase 4 completion

### Parallel Opportunities

**Phase 2**: Tasks T007-T017 can all run in parallel (different files or different sections)

**Phase 3**: Validation tasks T021-T028 can run in parallel after migration applies

**Phase 4**: Tasks T030-T035 can run in parallel (different files)

---

## Parallel Example: Phase 2 Schema Updates

```bash
# Launch all schema updates in parallel:
Task: "Update user-recipes.ts: add unrecognized_item_id"
Task: "Update user-inventory.ts: add unrecognized_item_id"
Task: "Update unrecognized-items.ts: add relations"
```

---

## Implementation Strategy

### Recommended Execution

1. **Phase 1**: Carefully revert local DB - verify with `pnpm db:status`
2. **Phase 2**: Update all Drizzle schemas in parallel
3. **Phase 3**: Generate migration, apply, validate XOR constraints
4. **Phase 4**: Fix any TypeScript errors - likely minimal if existing code doesn't assume non-null
5. **Phase 5**: Final validation and commit

### Risk Mitigation

- **Before Phase 1**: Backup local database if needed
- **After T006**: Verify `pnpm db:status` shows clean state
- **After T019**: Review migration SQL before applying
- **After T036**: Verify build passes before committing

---

## Notes

- [P] tasks = can run in parallel (different files)
- [US1] = Recipe Ingredients schema (P1)
- [US2] = User Inventory schema (P1)
- [US3] = TypeScript schema updates (P1)
- Phase 1 is unique to this implementation due to local DB state mismatch
- Commit after Phase 5 completion
