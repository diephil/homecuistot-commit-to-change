---

description: "Task list for ingredient database migration and script reorganization"
---

# Tasks: Ingredient Database Migration and Script Reorganization

**Input**: Design documents from `/specs/009-ingredient-migration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested in specification - implementation only

**Organization**: Tasks grouped by user story to enable independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify environment and prepare workspace

- [ ] T001 Verify Drizzle ORM configuration in apps/nextjs/drizzle.config.ts
- [ ] T002 Verify PostgreSQL database connection with pnpm db:status
- [ ] T003 Create apps/nextjs/scripts directory if not exists

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type system updates that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Replace INGREDIENT_CATEGORIES array in apps/nextjs/src/db/schema/enums.ts with 30-category taxonomy
- [ ] T005 Verify IngredientCategory type derives correctly from updated array
- [ ] T006 Run pnpm typecheck from apps/nextjs/ to identify old category references

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Database Populated with Standard Ingredients (Priority: P1) 🎯 MVP

**Goal**: Database contains comprehensive library of 2000+ ingredient names and categories for recipe matching and meal planning

**Independent Test**: Query ingredients table after migration and verify all 2000+ ingredients from en-ingredient-names.csv are present with correct categories matching taxonomy.md

### Implementation for User Story 1

- [ ] T007 [P] [US1] Create generate-ingredient-migration.ts script in apps/nextjs/scripts/
- [ ] T008 [US1] Implement CSV parsing function with proper quote handling and UTF-8 encoding
- [ ] T009 [US1] Implement SQL string escaping function (double single quotes)
- [ ] T010 [US1] Implement batch INSERT generation function (100 rows per batch)
- [ ] T011 [US1] Implement category validation against 30 INGREDIENT_CATEGORIES
- [ ] T012 [US1] Implement migration file generation with ON CONFLICT DO NOTHING clause
- [ ] T013 [US1] Add category breakdown statistics reporting
- [ ] T014 [US1] Execute generate-ingredient-migration.ts to create SQL migration file
- [ ] T015 [US1] Review generated migration file in apps/nextjs/src/db/migrations/NNNN_insert_ingredients.sql
- [ ] T016 [US1] Run pnpm db:migrate from apps/nextjs/ to apply migration
- [ ] T017 [US1] Validate ingredient count with SELECT COUNT(*) FROM ingredients (expect 2000+)
- [ ] T018 [US1] Validate category coverage with category GROUP BY query (expect all 30 categories)
- [ ] T019 [US1] Validate no duplicates with duplicate name check query (expect 0 rows)
- [ ] T020 [US1] Test migration idempotency by running pnpm db:migrate again (expect no changes)

**Checkpoint**: At this point, database should be fully populated with ingredients and User Story 1 is complete

---

## Phase 4: User Story 2 - Script Organized in Proper Project Structure (Priority: P2)

**Goal**: Development team can easily find and maintain ingredient extraction script in apps/nextjs/scripts/ instead of research/scripts/

**Independent Test**: Run script from apps/nextjs/scripts/ and verify it executes successfully with same functionality as before

### Implementation for User Story 2

- [ ] T021 [US2] Copy research/scripts/extract-ingredients.ts to apps/nextjs/scripts/extract-ingredients.ts
- [ ] T022 [US2] Update path resolution in extract-ingredients.ts to navigate from apps/nextjs/scripts/ to research/
- [ ] T023 [US2] Update scriptDir calculation to use __dirname instead of import.meta.url if needed
- [ ] T024 [US2] Update researchDir calculation to navigate up 3 levels from script location
- [ ] T025 [US2] Verify inputPath correctly references research/food-ingredient-taxonomy.txt
- [ ] T026 [US2] Verify outputPath correctly references research/[langCode]-ingredient-names.csv
- [ ] T027 [US2] Test script execution from apps/nextjs/ with tsx scripts/extract-ingredients.ts en
- [ ] T028 [US2] Verify script outputs to research/en-ingredient-names.csv with correct data
- [ ] T029 [US2] Compare output with original script output to ensure identical functionality
- [ ] T030 [US2] Remove research/scripts/extract-ingredients.ts after verification

**Checkpoint**: Script is now in proper location and User Story 2 is complete

---

## Phase 5: User Story 3 - Code Uses Correct Category Taxonomy (Priority: P3)

**Goal**: TypeScript code references ingredient categories using standardized 30-category taxonomy from taxonomy.md

**Independent Test**: Search codebase for ingredient category references and verify they match 30 categories from taxonomy.md

### Implementation for User Story 3

- [ ] T031 [P] [US3] Search codebase for old category references (proteins_nonmeat, canned_jarred, starches, legumes)
- [ ] T032 [US3] Update all hardcoded category references to use new taxonomy values
- [ ] T033 [US3] Replace hardcoded category arrays with INGREDIENT_CATEGORIES import where appropriate
- [ ] T034 [US3] Update type annotations to use IngredientCategory type from enums.ts
- [ ] T035 [US3] Update any category validation logic to use new 30 categories
- [ ] T036 [US3] Update category filter/dropdown components if present
- [ ] T037 [US3] Run pnpm typecheck from apps/nextjs/ to verify zero type errors
- [ ] T038 [US3] Run pnpm dev to verify app starts without errors
- [ ] T039 [US3] Test ingredient-related features locally (filters, search, autocomplete)
- [ ] T040 [US3] Grep codebase to ensure no old category strings remain

**Checkpoint**: All code now uses correct taxonomy and User Story 3 is complete

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and final validation

- [ ] T041 [P] Update CLAUDE.md with note about 30-category ingredient taxonomy
- [ ] T042 [P] Update CLAUDE.md with reference to ingredient migration
- [ ] T043 [P] Update CLAUDE.md with script location change (research/scripts → apps/nextjs/scripts)
- [ ] T044 Validate all success criteria from spec.md are met
- [ ] T045 Run final pnpm typecheck to ensure zero errors
- [ ] T046 Document migration in project changelog or release notes if applicable
- [ ] T047 Commit all changes with descriptive commit message

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed) after Phase 2
  - Or sequentially in priority order (US1 → US2 → US3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May need US1 complete for full testing

### Within Each User Story

**User Story 1**:
- T007-T013: Can work in parallel (script development)
- T014: Depends on T007-T013 (execute script)
- T015: Depends on T014 (review output)
- T016: Depends on T015 (apply migration)
- T017-T020: Depend on T016 (validation)

**User Story 2**:
- T021-T026: Sequential path updates
- T027-T029: Testing phase depends on T021-T026
- T030: Depends on successful T027-T029

**User Story 3**:
- T031: Can run immediately (discovery)
- T032-T036: Can work in parallel on different files
- T037-T040: Validation depends on T032-T036

### Parallel Opportunities

- All Setup tasks (T001-T003) can run in parallel
- Within US1: Script development (T007-T013) can be written in parallel
- Within US3: File updates (T032-T036) can run in parallel if different files
- Polish tasks (T041-T043) can run in parallel (documentation)

---

## Parallel Example: User Story 1 Script Development

```bash
# These tasks can be worked on in parallel (different functions):
Task T008: "Implement CSV parsing function"
Task T009: "Implement SQL string escaping function"
Task T010: "Implement batch INSERT generation function"
Task T011: "Implement category validation"
```

---

## Parallel Example: User Story 3 Code Updates

```bash
# If different files, these can run in parallel:
Task T032: "Update category references in src/components/filters.tsx"
Task T033: "Update category references in src/lib/ingredients.ts"
Task T034: "Update category references in src/app/pantry/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - updates type system)
3. Complete Phase 3: User Story 1 (database population)
4. **STOP and VALIDATE**: Query database, verify 2000+ ingredients
5. Deploy/demo if ready

**At this point you have a working ingredient database** - US2 and US3 are improvements, not blockers

### Incremental Delivery

1. Setup + Foundational → Type system updated
2. Add User Story 1 → Database populated → **MVP COMPLETE**
3. Add User Story 2 → Script relocated → Better maintainability
4. Add User Story 3 → Code updated → Full consistency
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (migration)
   - Developer B: User Story 2 (script move)
   - Developer C: User Story 3 (code updates)
3. Stories complete and validate independently

---

## Notes

- [P] tasks = different files/functions, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each user story completion
- Stop at any checkpoint to validate story independently
- US1 is MVP - US2/US3 are enhancements
- Migration is idempotent (safe to run multiple times)
- All SQL generation uses proper escaping (security)
- TypeScript type checking validates category consistency
