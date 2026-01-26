# Tasks: Drizzle-Only Migrations

**Input**: Design documents from `/specs/008-drizzle-migrations/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: Manual testing only (per MVP constitution)

**Organization**: Tasks grouped by implementation step, mapped to user stories for traceability.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task enables (US1, US2, etc.)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo**: `apps/nextjs/` prefix for all source files
- Migrations: `apps/nextjs/src/db/migrations/`
- Schema: `apps/nextjs/src/db/schema/`

---

## Phase 1: Setup (Configuration)

**Purpose**: Update Drizzle config and add npm scripts

- [ ] T001 Update drizzle.config.ts: change `out` to `./src/db/migrations`, add `verbose: true`, add `migrations` config in apps/nextjs/drizzle.config.ts
- [ ] T002 [P] Add db:generate script to package.json in apps/nextjs/package.json
- [ ] T003 [P] Add db:migrate script to package.json in apps/nextjs/package.json
- [ ] T004 [P] Add db:migrate:prod script to package.json in apps/nextjs/package.json
- [ ] T005 [P] Add db:baseline:prod script to package.json in apps/nextjs/package.json
- [ ] T006 [P] Add db:push script to package.json in apps/nextjs/package.json
- [ ] T007 [P] Add db:studio script to package.json in apps/nextjs/package.json

---

## Phase 2: Foundational (Migration Infrastructure)

**Purpose**: Create migration scripts and copy existing migrations

**⚠️ CRITICAL**: Must complete before any migration commands work

- [ ] T008 Create migrate.ts programmatic migration runner with logging in apps/nextjs/src/db/migrate.ts
- [ ] T009 [P] Create baseline.ts script to mark existing migrations as applied in apps/nextjs/src/db/baseline.ts
- [ ] T010 Create migrations directory structure: mkdir -p apps/nextjs/src/db/migrations/meta
- [ ] T011 [P] Copy 0000_striped_scarlet_witch.sql from supabase/migrations/ to src/db/migrations/ in apps/nextjs/
- [ ] T012 [P] Copy 0001_enable_rls_policies.sql from supabase/migrations/ to src/db/migrations/ in apps/nextjs/
- [ ] T013 [P] Copy meta/0000_snapshot.json from supabase/migrations/meta/ to src/db/migrations/meta/ in apps/nextjs/
- [ ] T014 Update _journal.json to include both migrations (idx 0 and 1) in apps/nextjs/src/db/migrations/meta/_journal.json

**Checkpoint**: Migration infrastructure ready

---

## Phase 3: User Story 1 - Generate Migrations (Priority: P1) 🎯 MVP

**Goal**: Developer can generate migration files from schema changes

**Independent Test**: Run `pnpm db:generate` after schema change → verify migration file created

- [ ] T015 [US1] Verify db:generate command works by running `pnpm db:generate` (should show "no changes" since schema matches migrations)

**Checkpoint**: Migration generation working

---

## Phase 4: User Story 2 - Apply Migrations (Priority: P1) 🎯 MVP

**Goal**: Developer can apply pending migrations to database

**Independent Test**: Run `pnpm db:migrate` → verify migrations applied, check `__drizzle_migrations` table

### Local Environment (Fresh Reset)

- [ ] T016 [US2] Reset local Supabase database (supabase db reset or manual drop/create)
- [ ] T017 [US2] Run `pnpm db:migrate` to apply all migrations to local database
- [ ] T018 [US2] Verify local database schema matches expectations (check tables exist)

### Production Environment (Preserve Data)

- [ ] T019 [US2] Run `pnpm db:baseline:prod` to mark existing migrations as applied in production
- [ ] T020 [US2] Run `pnpm db:migrate:prod` to verify "already up to date" message

**Checkpoint**: Migration application working on both environments

---

## Phase 5: User Story 3 - Manual Migration Generator (Priority: P2)

**Goal**: Developer can create custom SQL migrations for data operations

**Independent Test**: Run `pnpm db:generate:manual seed_recipes` → verify migration template created with proper journal/snapshot

- [ ] T021 [US3] Create generate-manual-migration.ts script in apps/nextjs/src/db/generate-manual-migration.ts
- [ ] T022 [US3] Add db:generate:manual script to package.json: `tsx src/db/generate-manual-migration.ts`
- [ ] T023 [US3] Test manual migration: run `pnpm db:generate:manual test_migration` and verify files created
- [ ] T024 [US3] Add custom INSERT/UPDATE SQL to manual migration file and verify it applies with `pnpm db:migrate`
- [ ] T025 [US3] Delete test migration files after verification

**Checkpoint**: Manual migration generation working

---

## Phase 6: User Story 4 & 5 - Status & Multi-Environment (Priority: P2)

**Goal**: Migrations work consistently across environments with status tracking

**Independent Test**: Check `__drizzle_migrations` table shows correct applied migrations

- [ ] T026 [US4] Verify migration status by querying `__drizzle_migrations` table in local database
- [ ] T027 [US5] Verify migration status by querying `__drizzle_migrations` table in production database
- [ ] T028 [US5] Confirm schema is identical between local and production (compare table structures)

**Checkpoint**: Multi-environment support verified

---

## Phase 7: Validation - Enum to Text Migration

**Goal**: Validate full migration workflow by making real schema change

**Independent Test**: Generate migration, apply to both envs, verify columns changed

### Schema Changes

- [ ] T029 [P] Update enums.ts: Remove pgEnum definitions, export string literal types instead in apps/nextjs/src/db/schema/enums.ts
- [ ] T030 [P] Update ingredients.ts: Change ingredientCategory from enum to text() with index in apps/nextjs/src/db/schema/ingredients.ts
- [ ] T031 [P] Update user-recipes.ts: Change recipeSource from enum to text() with index in apps/nextjs/src/db/schema/user-recipes.ts
- [ ] T032 [P] Update recipes.ts: Change ingredientType reference if needed in apps/nextjs/src/db/schema/recipes.ts

### Generate and Apply

- [ ] T033 Run `pnpm db:generate` to create migration 0002_*.sql in apps/nextjs/src/db/migrations/
- [ ] T034 Review generated migration SQL: verify DROP TYPE, ALTER COLUMN, CREATE INDEX statements
- [ ] T035 Run `pnpm db:migrate` to apply enum-to-text migration to local database
- [ ] T036 Run `pnpm db:migrate:prod` to apply enum-to-text migration to production database
- [ ] T037 Verify columns are now text type by querying information_schema in both databases

**Checkpoint**: Full migration workflow validated end-to-end

---

## Phase 8: Cleanup & Documentation

**Purpose**: Remove old artifacts and finalize

- [ ] T038 Delete supabase/migrations/ folder after confirming new system works in apps/nextjs/
- [ ] T039 [P] Update CLAUDE.md to document new db:* commands (including db:generate:manual)
- [ ] T040 Commit all changes with message: `feat(db): migrate to drizzle-only migrations`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 - BLOCKS all user stories
- **Phase 3 (US1)**: Depends on Phase 2
- **Phase 4 (US2)**: Depends on Phase 2, can parallel with Phase 3
- **Phase 5 (US3 - Manual Migrations)**: Depends on Phase 2, can parallel with Phase 3/4
- **Phase 6 (US4/5 - Status)**: Depends on Phase 4
- **Phase 7 (Validation)**: Depends on Phase 6
- **Phase 8 (Cleanup)**: Depends on Phase 7

### User Story Dependencies

- **US1 (Generate)**: Independent after Phase 2
- **US2 (Apply)**: Independent after Phase 2, validates US1 output
- **US3 (Manual Migrations)**: Independent after Phase 2, parallel with US1/US2
- **US4 (Status)**: Depends on US2 (needs applied migrations to check)
- **US5 (Multi-env)**: Depends on US2 applied to both environments

### Parallel Opportunities

**Phase 1**: T002-T007 all parallel (different scripts in same file, but independent additions)

**Phase 2**: T009, T011, T012, T013 all parallel (different files)

**Phase 5**: Can be implemented in parallel with Phase 3/4 (independent feature)

**Phase 7**: T029, T030, T031, T032 all parallel (different schema files)

---

## Parallel Example: Phase 7 Schema Changes

```bash
# Launch all schema updates together:
Task: "Update enums.ts in apps/nextjs/src/db/schema/enums.ts"
Task: "Update ingredients.ts in apps/nextjs/src/db/schema/ingredients.ts"
Task: "Update user-recipes.ts in apps/nextjs/src/db/schema/user-recipes.ts"
Task: "Update recipes.ts in apps/nextjs/src/db/schema/recipes.ts"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Setup (config + scripts)
2. Complete Phase 2: Foundational (migrate.ts, baseline.ts, copy migrations)
3. Complete Phase 3: US1 - Generate works
4. Complete Phase 4: US2 - Apply works
5. **STOP and VALIDATE**: Both local and prod can run migrations

### Full Delivery

1. MVP above
2. Phase 5: Manual migration generator (US3)
3. Phase 6: Verify status and multi-env (US4/5)
4. Phase 7: Validation migration (enum→text)
5. Phase 8: Cleanup and commit

---

## Notes

- [P] tasks = different files, no dependencies
- Local env can be reset fresh; production must preserve data
- Baseline script only needed for production (marks existing migrations as applied)
- Manual migration generator allows custom SQL for data operations (seeds, updates)
- Validation step (enum→text) proves the full workflow before cleanup
- Manual testing per MVP constitution - no automated tests required
