# Tasks: User Pantry Staples

**Input**: Design documents from `/specs/010-user-pantry-staples/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.yaml

**Tests**: Manual testing per constitution (no automated tests)

**Organization**: Tasks grouped by user story for independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3, US4)

## Path Conventions

- **Monorepo**: `apps/nextjs/src/` for all source code
- **Schema**: `apps/nextjs/src/db/schema/`
- **Types**: `apps/nextjs/src/types/`
- **LLM Prompts**: `apps/nextjs/src/lib/prompts/`
- **UI**: `apps/nextjs/src/app/(protected)/app/onboarding/`

---

## Phase 1: Setup

**Purpose**: Project structure verification

- [ ] T001 Verify branch `010-user-pantry-staples` is active and clean
- [ ] T002 Verify Supabase local running (`make sbstart`) and `.env.local` configured

---

## Phase 2: Foundational (Database + Types)

**Purpose**: Schema changes and type definitions that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Remove `ingredientAliases` table from `apps/nextjs/src/db/schema/ingredients.ts`
- [ ] T004 Remove `ingredientAliasesRelations` from `apps/nextjs/src/db/schema/ingredients.ts`
- [ ] T005 Remove `aliases` relation from `ingredientsRelations` in `apps/nextjs/src/db/schema/ingredients.ts`
- [ ] T006 [P] Create `apps/nextjs/src/db/schema/user-pantry-staples.ts` with userPantryStaples table per data-model.md
- [ ] T007 Export `userPantryStaples` and relations from `apps/nextjs/src/db/schema/index.ts`
- [ ] T008 Run `pnpm db:generate` from `apps/nextjs/` to generate migration
- [ ] T009 Run `pnpm db:migrate` to apply migration to local DB
- [ ] T010 Verify migration: `ingredient_aliases` dropped, `user_pantry_staples` created
- [ ] T011 [P] Add `StorageLocationSchema` enum to `apps/nextjs/src/types/onboarding.ts`
- [ ] T012 [P] Add `ExtractedIngredientSchema` (name + storageLocation) to `apps/nextjs/src/types/onboarding.ts`
- [ ] T013 Update `OnboardingUpdateSchema.add.ingredients` to use `ExtractedIngredientSchema` in `apps/nextjs/src/types/onboarding.ts`

**Checkpoint**: Foundation ready - database migrated, types defined

---

## Phase 3: User Story 4 - View Ingredients Separated by Storage Location (Priority: P1) 🎯 MVP

**Goal**: Display ingredients in "Pantry Items" and "Fridge Items" sections in Review & Refine view

**Why First**: This is the core UI change and enables testing of LLM storage classification

**Independent Test**: User adds ingredients via voice/text → sees them in separate Pantry/Fridge sections

### LLM Prompt Updates (US4)

- [ ] T014 [P] [US4] Update prompt in `apps/nextjs/src/lib/prompts/onboarding-text/process.ts` to request storage location classification
- [ ] T015 [P] [US4] Update `responseSchema` in `apps/nextjs/src/lib/prompts/onboarding-text/process.ts` to include storageLocation enum
- [ ] T016 [P] [US4] Update prompt in `apps/nextjs/src/lib/prompts/onboarding-voice/process.ts` to request storage location classification
- [ ] T017 [P] [US4] Update `responseSchema` in `apps/nextjs/src/lib/prompts/onboarding-voice/process.ts` to include storageLocation enum

### UI Updates (US4)

- [ ] T018 [US4] Update `applyOnboardingUpdate` in `apps/nextjs/src/app/(protected)/app/onboarding/page.tsx` to route ingredients by storageLocation to `state.pantry` or `state.fridge`
- [ ] T019 [US4] Update Step 3 Review & Refine view in `apps/nextjs/src/app/(protected)/app/onboarding/page.tsx` to show "Pantry Items" and "Fridge Items" as separate sections
- [ ] T020 [US4] Update display logic to hide empty sections (FR-010) in `apps/nextjs/src/app/(protected)/app/onboarding/page.tsx`
- [ ] T021 [US4] Verify TypeScript compiles (`pnpm build` from `apps/nextjs/`)

**Checkpoint**: US4 complete - ingredients display in separate sections

---

## Phase 4: User Story 1 - Mark Ingredient as Pantry Staple (Priority: P1)

**Goal**: Users can mark ingredients as "always have" staples

**Independent Test**: User marks ingredient as staple → persists across sessions

**Note**: Database table created in Phase 2. This phase adds UI interaction.

### Implementation (US1)

- [ ] T022 [US1] Design staple toggle UI component for ingredient items in Review & Refine view
- [ ] T023 [US1] Add staple toggle handler to `apps/nextjs/src/app/(protected)/app/onboarding/page.tsx`
- [ ] T024 [US1] Create server action or API route for adding staple in `apps/nextjs/src/app/api/pantry-staples/route.ts`
- [ ] T025 [US1] Implement add staple with Drizzle insert (handle unique constraint for idempotency)
- [ ] T026 [US1] Add optimistic UI update for staple toggle

**Checkpoint**: US1 complete - users can mark staples

---

## Phase 5: User Story 2 - Remove Ingredient from Pantry Staples (Priority: P1)

**Goal**: Users can remove ingredients from their staples list

**Independent Test**: User removes staple → no longer appears in staples list

### Implementation (US2)

- [ ] T027 [US2] Add remove staple handler to `apps/nextjs/src/app/(protected)/app/onboarding/page.tsx`
- [ ] T028 [US2] Extend API route for removing staple in `apps/nextjs/src/app/api/pantry-staples/route.ts`
- [ ] T029 [US2] Implement remove staple with Drizzle delete
- [ ] T030 [US2] Add optimistic UI update for staple removal

**Checkpoint**: US2 complete - users can remove staples

---

## Phase 6: User Story 3 - View Pantry Staples List (Priority: P2)

**Goal**: Users can view all their pantry staples in one place

**Independent Test**: User navigates to staples list → sees all marked ingredients

### Implementation (US3)

- [ ] T031 [US3] Create staples list view component or section in onboarding UI
- [ ] T032 [US3] Add API route for fetching user staples in `apps/nextjs/src/app/api/pantry-staples/route.ts`
- [ ] T033 [US3] Implement get staples with Drizzle query (join with ingredients table)
- [ ] T034 [US3] Add empty state with guidance when no staples exist
- [ ] T035 [US3] Display staples with remove button

**Checkpoint**: US3 complete - users can view and manage staples list

---

## Phase 7: Polish & Verification

**Purpose**: Cross-cutting cleanup and verification

- [ ] T036 [P] Run `pnpm lint` and fix any issues
- [ ] T037 [P] Run `pnpm build` to verify TypeScript compilation
- [ ] T038 Search codebase for remaining `ingredientAliases` references and remove (FR-007)
- [ ] T039 Manual test: voice input → verify storage location classification (SC-007)
- [ ] T040 Manual test: text input → verify storage location classification
- [ ] T041 Manual test: staple add/remove → verify <2s response (SC-001)
- [ ] T042 Run quickstart.md verification checklist
- [ ] T043 Run `pnpm db:migrate:prod` to apply migration to production

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies
- **Phase 2 (Foundational)**: Depends on Phase 1 - BLOCKS all user stories
- **Phase 3 (US4)**: Depends on Phase 2 - MVP, do first
- **Phase 4 (US1)**: Depends on Phase 2 - can run after US4
- **Phase 5 (US2)**: Depends on Phase 4 (uses same API route)
- **Phase 6 (US3)**: Depends on Phase 4 (extends API route)
- **Phase 7 (Polish)**: Depends on all user stories

### User Story Dependencies

- **US4 (P1)**: Core change - LLM + UI separation. Do first.
- **US1 (P1)**: Depends on database from Phase 2. Can start after US4.
- **US2 (P1)**: Extends US1 API. Must follow US1.
- **US3 (P2)**: Extends US1/US2 API. Must follow US2.

### Parallel Opportunities

Within Phase 2:
- T006 (schema file) can run parallel to T003-T005 (removal)
- T011, T012 (type additions) can run in parallel

Within Phase 3:
- T014, T015, T016, T017 (prompt updates) can ALL run in parallel

---

## Parallel Example: Phase 3

```bash
# Launch all LLM prompt updates together:
Task: "Update prompt in onboarding-text/process.ts for storage location"
Task: "Update responseSchema in onboarding-text/process.ts"
Task: "Update prompt in onboarding-voice/process.ts for storage location"
Task: "Update responseSchema in onboarding-voice/process.ts"
```

---

## Implementation Strategy

### MVP First (US4 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: US4 (storage location in UI)
4. **STOP and VALIDATE**: Test pantry/fridge separation
5. Deploy if ready - core value delivered

### Incremental Delivery

1. Setup + Foundational → Database ready
2. Add US4 → Test storage separation → Deploy (MVP!)
3. Add US1 → Test staple marking → Deploy
4. Add US2 → Test staple removal → Deploy
5. Add US3 → Test staples list → Deploy

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to user story
- No automated tests per constitution (manual testing)
- LLM default for unknown storage: fridge (safer for perishables)
- Commit after each logical group of tasks
- Stop at any checkpoint to validate independently
