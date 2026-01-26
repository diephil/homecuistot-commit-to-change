# Tasks: Onboarding Data Persistence

**Input**: Design documents from `/specs/011-onboarding-data-persist/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, research.md, quickstart.md, contracts/

**Tests**: Manual testing per constitution (MVP phase) - no automated test tasks included.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo**: `apps/nextjs/src/` for source code
- **API Routes**: `apps/nextjs/src/app/api/`
- **Components**: `apps/nextjs/src/app/(protected)/app/`
- **Library**: `apps/nextjs/src/lib/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization - minimal for this feature (existing project)

- [x] T001 Verify existing DB schema supports all required tables (ingredients, recipes, user_recipes, recipe_ingredients, user_inventory, user_pantry_staples, unrecognized_items) in `apps/nextjs/src/db/schema/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Create Zod validation schema for PersistRequest in `apps/nextjs/src/types/onboarding.ts`
- [x] T003 [P] Create recipe generation prompt template in `apps/nextjs/src/lib/prompts/recipe-generation/prompt.ts`
- [x] T004 [P] Create recipe generation Zod schema (RecipeDetailSchema, RecipeBatchSchema) in `apps/nextjs/src/lib/prompts/recipe-generation/schema.ts`
- [x] T005 Implement recipe generation LLM process function in `apps/nextjs/src/lib/prompts/recipe-generation/process.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 + 2 - Data Persistence & Ingredient Matching (Priority: P1) MVP

**Goal**: User finishes onboarding, ingredients matched case-insensitively, data saved to DB

**Independent Test**: Complete onboarding with dishes+ingredients, verify data in user_inventory, user_recipes, recipe_ingredients

### Implementation for User Story 1 + 2 (Combined - tightly coupled)

- [x] T006 [US1] Create persist API route handler in `apps/nextjs/src/app/api/onboarding/persist/route.ts`
- [x] T007 [US1] Implement auth validation using createClient/getSession pattern in `apps/nextjs/src/app/api/onboarding/persist/route.ts`
- [x] T008 [US1] Implement ingredient matching with case-insensitive WHERE LOWER(name) IN clause in `apps/nextjs/src/app/api/onboarding/persist/route.ts`
- [x] T009 [US1] Implement unrecognized items logging (context='ingredient') with console.log and DB insert in `apps/nextjs/src/app/api/onboarding/persist/route.ts`
- [x] T010 [US1] Call LLM recipe generation for dishes and match returned ingredients against DB in `apps/nextjs/src/app/api/onboarding/persist/route.ts`
- [x] T011 [US1] Insert recipes records (name, description from LLM, userId, isSeeded=false) with ON CONFLICT DO NOTHING in `apps/nextjs/src/app/api/onboarding/persist/route.ts`
- [x] T012 [US1] Insert user_recipes junction records (source='onboarding') with ON CONFLICT DO NOTHING in `apps/nextjs/src/app/api/onboarding/persist/route.ts`
- [x] T013 [US1] Insert recipe_ingredients records (ingredientType='anchor') for matched LLM ingredients with ON CONFLICT DO NOTHING in `apps/nextjs/src/app/api/onboarding/persist/route.ts`
- [x] T014 [US1] Insert user_inventory records (quantityLevel=3) for all matched ingredients with ON CONFLICT DO NOTHING in `apps/nextjs/src/app/api/onboarding/persist/route.ts`
- [x] T015 [US1] Insert user_pantry_staples records for matched pantry items with ON CONFLICT DO NOTHING in `apps/nextjs/src/app/api/onboarding/persist/route.ts`
- [x] T016 [US1] Return PersistResponse with counts (recipesCreated, inventoryCreated, pantryStaplesCreated, unrecognizedCount) in `apps/nextjs/src/app/api/onboarding/persist/route.ts`

**Checkpoint**: API endpoint complete - can persist onboarding data

---

## Phase 4: User Story 3 - Recipe Generation via LLM (Priority: P1)

**Goal**: Dish names enriched with descriptions and ingredient lists via Gemini

**Independent Test**: Add "Pasta Carbonara" as dish, verify recipe saved with description and 1-6 ingredients

Note: Core LLM integration already in Phase 2 (foundational) and Phase 3 (API call). This phase handles edge cases.

### Implementation for User Story 3

- [x] T017 [US3] Handle LLM retry on failure (retry once, save recipe name-only on second failure) in `apps/nextjs/src/app/api/onboarding/persist/route.ts`
- [x] T018 [US3] Handle 0 dishes edge case (skip LLM call, only save inventory) in `apps/nextjs/src/app/api/onboarding/persist/route.ts`
- [x] T019 [US3] Deduplicate ingredient names before DB lookup in `apps/nextjs/src/app/api/onboarding/persist/route.ts`

**Checkpoint**: Recipe generation complete with edge case handling

---

## Phase 5: User Story 4 - Completion Screen UX (Priority: P2)

**Goal**: User sees celebratory Step 4 with animation, 4-second minimum display, then redirect

**Independent Test**: Trigger completion, verify animation displays and 4-second minimum enforced

### Implementation for User Story 4

- [x] T020 [US4] Add Step 4 to OnboardingState type (currentStep: 1 | 2 | 3 | 4) in `apps/nextjs/src/types/onboarding.ts`
- [x] T021 [US4] Add handleCompleteSetup function with 4-second minimum timer logic in `apps/nextjs/src/app/(protected)/app/onboarding/page.tsx`
- [x] T022 [US4] Implement Step 4 UI with "Congrats!" message and neobrutalism animation in `apps/nextjs/src/app/(protected)/app/onboarding/page.tsx`
- [x] T023 [US4] Add API call to /api/onboarding/persist with error handling in handleCompleteSetup in `apps/nextjs/src/app/(protected)/app/onboarding/page.tsx`
- [x] T024 [US4] Implement redirect to /app after timer completes in `apps/nextjs/src/app/(protected)/app/onboarding/page.tsx`
- [x] T025 [US4] Update Step 3 "Complete Setup" button to trigger handleCompleteSetup in `apps/nextjs/src/app/(protected)/app/onboarding/page.tsx`

**Checkpoint**: Completion screen UX complete

---

## Phase 6: /app Page Integration

**Goal**: Users see onboarded recipes in "Available Recipes" section after completing onboarding

**Independent Test**: Complete onboarding, navigate to /app, verify recipes display

### Implementation for /app Page

- [x] T026 Fetch user_recipes with source='onboarding' joined with recipes table in `apps/nextjs/src/app/(protected)/app/page.tsx`
- [x] T027 Display fetched recipes in "Available Recipes" section (replace mock if real data exists) in `apps/nextjs/src/app/(protected)/app/page.tsx`
- [x] T028 Keep mock data for "Almost Available Recipes" section in `apps/nextjs/src/app/(protected)/app/page.tsx`

**Checkpoint**: Full onboarding flow complete - end-to-end testable

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, edge cases, validation

- [x] T029 Add graceful error handling for persistence failures (don't crash Step 4) in `apps/nextjs/src/app/(protected)/app/onboarding/page.tsx`
- [x] T030 Validate edge case: duplicate ingredient names in user list (dedupe before lookup) in `apps/nextjs/src/app/api/onboarding/persist/route.ts`
- [ ] T031 Run quickstart.md manual testing checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - verify existing schema
- **Foundational (Phase 2)**: Depends on Setup - creates shared types and LLM functions
- **US1+2 (Phase 3)**: Depends on Foundational - API endpoint implementation
- **US3 (Phase 4)**: Depends on Phase 3 - edge case handling for LLM
- **US4 (Phase 5)**: Depends on Phase 3 - UI calls API endpoint
- **/app Integration (Phase 6)**: Depends on Phase 3 - reads persisted data
- **Polish (Phase 7)**: Depends on all user stories complete

### Within Each Phase

- T003 and T004 can run in parallel (different files)
- T006-T016 are sequential (single file, incremental building)
- T020-T025 are sequential (single file, incremental building)
- T026-T028 are sequential (single file)

### Parallel Opportunities

```bash
# Phase 2 - Foundational (parallel):
Task: T003 - prompt template
Task: T004 - Zod schemas

# Phase 5 and 6 can run in parallel after Phase 3:
Task: Phase 5 (UI) - different files from Phase 6 (/app page)
Task: Phase 6 (/app) - different files from Phase 5 (onboarding)
```

---

## Implementation Strategy

### MVP First (User Stories 1+2+3)

1. Complete Phase 1: Setup (verify schema)
2. Complete Phase 2: Foundational (types, LLM prompts)
3. Complete Phase 3: US1+2 API endpoint
4. Complete Phase 4: US3 edge cases
5. **STOP and VALIDATE**: Test API endpoint with curl/Postman
6. Proceed to UI integration

### Incremental Delivery

1. Setup + Foundational → Types and LLM ready
2. US1+2+3 (Phase 3+4) → API complete, manually testable
3. US4 (Phase 5) → UI complete, end-to-end flow works
4. Phase 6 → /app displays real data
5. Phase 7 → Polish and edge cases

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- US1 and US2 combined in Phase 3 (tightly coupled - ingredient matching IS persistence)
- Manual testing per quickstart.md checklist (MVP phase)
- All inserts use ON CONFLICT DO NOTHING for idempotency
- Commit after each phase completes
