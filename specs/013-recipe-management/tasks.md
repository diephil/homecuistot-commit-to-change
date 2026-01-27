# Tasks: Recipe Management

**Input**: Design documents from `/specs/013-recipe-management/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.yaml, quickstart.md

**Tests**: Not requested - manual testing acceptable per MVP constitution

**Organization**: Tasks grouped by user story for independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5)
- Include exact file paths in descriptions

## Path Conventions

Monorepo structure: `apps/nextjs/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and toast component setup

- [X] T001 Install shadcn/ui toast component via `npx shadcn@latest add toast` in apps/nextjs/ (used sonner instead, toast deprecated)
- [X] T002 Add `<Toaster />` to root layout in apps/nextjs/src/app/layout.tsx
- [X] T003 [P] Add npm scripts `prompt:recipe` and `prompt:recipe:prod` to apps/nextjs/package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create Zod schemas in apps/nextjs/src/types/recipes.ts (RecipeExtraction, ValidationResult, constraints)
- [X] T005 [P] Create recipe-editor prompt template in apps/nextjs/src/lib/prompts/recipe-editor/prompt.ts
- [X] T006 [P] Create recipe-editor output schema in apps/nextjs/src/lib/prompts/recipe-editor/schema.ts
- [X] T007 Create recipe-editor process utility in apps/nextjs/src/lib/prompts/recipe-editor/process.ts (Gemini integration with Opik tracking)
- [X] T008 [P] Create Opik prompt registration script in apps/nextjs/scripts/register-recipe-prompt.ts
- [X] T009 [P] Create server actions file in apps/nextjs/src/app/actions/recipes.ts (getRecipes, createRecipe, updateRecipe, deleteRecipe)

**Checkpoint**: Foundation ready - user story implementation can begin

---

## Phase 3: User Story 1 - View Recipe Summary on App Dashboard (Priority: P1)

**Goal**: Display top 10 recent recipes on /app page - non-clickable, title + description only

**Independent Test**: Navigate to /app, verify top 10 recipes display, confirm items not interactive

### Implementation for User Story 1

- [X] T010 [US1] Create RecipeCard component (non-interactive variant) in apps/nextjs/src/components/recipes/recipe-card.tsx
- [X] T011 [US1] Create RecipeList component (summary mode) in apps/nextjs/src/components/recipes/recipe-list.tsx
- [X] T012 [US1] Modify /app page to display recipe summary section in apps/nextjs/src/app/(protected)/app/page.tsx
- [X] T013 [US1] Add navigation link from /app to /recipes page

**Checkpoint**: User Story 1 complete - /app shows top 10 recipes (non-clickable)

---

## Phase 4: User Story 2 - Manage Recipes on Recipe List Page (Priority: P1)

**Goal**: /recipes page with clickable recipe cards, "Add recipe" button, inline modal/expanded edit

**Independent Test**: Navigate to /recipes, verify clickable cards, test "Add recipe" and card click

### Implementation for User Story 2

- [X] T014 [P] [US2] Create /recipes page structure in apps/nextjs/src/app/(protected)/recipes/page.tsx
- [X] T015 [P] [US2] Extend RecipeCard for interactive variant (hover states, cursor pointer) in apps/nextjs/src/components/recipes/recipe-card.tsx
- [X] T016 [US2] Create RecipeForm component (modal/expanded card) in apps/nextjs/src/components/recipes/recipe-form.tsx
- [X] T017 [US2] Implement "Add recipe" button with blank form state on /recipes page
- [X] T018 [US2] Implement recipe card click → open modal with populated data for editing

**Checkpoint**: User Story 2 complete - /recipes page fully navigable with add/edit flows

---

## Phase 5: User Story 3 - Edit Recipe Details with Ingredient Management (Priority: P1)

**Goal**: Recipe form shows title, description, ingredients with optional checkboxes, delete button (edit mode only)

**Independent Test**: Open recipe, toggle ingredient optional checkboxes, save, verify persistence

### Implementation for User Story 3

- [X] T019 [US3] Add ingredient list display to RecipeForm with optional checkboxes in apps/nextjs/src/components/recipes/recipe-form.tsx
- [X] T020 [US3] Implement optional toggle state management in RecipeForm
- [X] T021 [US3] Implement save functionality with updateRecipe server action integration
- [X] T022 [US3] Add inline delete confirmation (button transforms to "Confirm delete?" with confirm/cancel)
- [X] T023 [US3] Conditionally render delete button (edit mode only, not add mode)

**Checkpoint**: User Story 3 complete - full recipe editing with ingredient optional marking

---

## Phase 6: User Story 4 - Voice or Text Input for Recipe Creation (Priority: P2)

**Goal**: Voice/text input via LLM extraction, skeleton loading, ingredient suggestions

**Independent Test**: Click microphone or type text, verify extracted fields appear with skeleton loading

### Implementation for User Story 4

- [X] T024 [P] [US4] Create /api/recipes/process-voice route in apps/nextjs/src/app/api/recipes/process-voice/route.ts
- [X] T025 [P] [US4] Create /api/recipes/process-text route in apps/nextjs/src/app/api/recipes/process-text/route.ts
- [X] T026 [US4] Create VoiceInput component (mic button, recording state, 1-min limit) in apps/nextjs/src/components/recipes/voice-input.tsx
- [X] T027 [US4] Add text input field with submit button to RecipeForm
- [X] T028 [US4] Implement skeleton placeholders + "Extracting recipe..." loading state in RecipeForm
- [X] T029 [US4] Wire voice/text API calls to RecipeForm and populate fields on response
- [X] T030 [US4] Display LLM-suggested optional flags on ingredients (pre-marked checkboxes)

**Checkpoint**: User Story 4 complete - voice/text input extracts and populates recipe fields

---

## Phase 7: User Story 5 - Ingredient Database Validation (Priority: P2)

**Goal**: Validate ingredients against DB before save, show unrecognized items toast

**Independent Test**: Add recipe with made-up ingredient, verify toast notification for unrecognized items

### Implementation for User Story 5

- [X] T031 [P] [US5] Create /api/recipes/validate route in apps/nextjs/src/app/api/recipes/validate/route.ts
- [X] T032 [US5] Call validation endpoint before save in RecipeForm (called during extraction)
- [X] T033 [US5] Display toast notification for unrecognized ingredients (auto-dismiss 5s)
- [ ] T034 [US5] Implement unrecognized items resolution UI (remove, rename, keep as custom text) - DEFERRED (MVP: just show toast)
- [ ] T035 [US5] Store unrecognized items in database with context='recipe' - DEFERRED (MVP: just validate)

**Checkpoint**: User Story 5 complete - ingredient validation with unrecognized items handling

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Refinements affecting multiple user stories

- [ ] T036 Run quickstart.md validation checklist - MANUAL TESTING REQUIRED
- [X] T037 [P] Verify tenant isolation (RLS) works for all recipe operations (all queries use createUserDb pattern)
- [ ] T038 Performance check: recipe list loads <2s, voice extraction <15s - MANUAL TESTING REQUIRED
- [ ] T039 Register recipe-editor prompt with Opik (`pnpm prompt:recipe`) - USER ACTION REQUIRED

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phases 3-7)**: All depend on Foundational completion
  - US1, US2, US3 are P1 (core functionality) - complete sequentially
  - US4, US5 are P2 (enhancements) - depend on US1-US3 for base UI
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: View recipe summary → Foundation only
- **US2 (P1)**: Recipe list page → Foundation only (shares components with US1)
- **US3 (P1)**: Edit recipe details → Depends on US2 (needs RecipeForm)
- **US4 (P2)**: Voice/text input → Depends on US3 (needs RecipeForm)
- **US5 (P2)**: Ingredient validation → Depends on US4 (needs extraction flow)

### Within Each User Story

- Components before page integration
- API routes before client-side calls
- Core features before enhancements

### Parallel Opportunities

**Phase 2 (Foundational)**:
```bash
# Launch in parallel:
T005 recipe-editor/prompt.ts
T006 recipe-editor/schema.ts
T008 register-recipe-prompt.ts
T009 server actions
```

**Phase 4 (US2)**:
```bash
# Launch in parallel:
T014 /recipes page structure
T015 RecipeCard interactive variant
```

**Phase 6 (US4)**:
```bash
# Launch in parallel:
T024 process-voice route
T025 process-text route
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup (toast component)
2. Complete Phase 2: Foundational (schemas, prompts, actions)
3. Complete Phase 3: US1 (/app recipe summary)
4. Complete Phase 4: US2 (/recipes page)
5. Complete Phase 5: US3 (recipe editing)
6. **STOP and VALIDATE**: Test CRUD without voice/LLM

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Test /app page → Deploy (shows recipes)
3. Add US2 → Test /recipes page → Deploy (manage recipes)
4. Add US3 → Test editing → Deploy (full CRUD!)
5. Add US4 → Test voice/text → Deploy (LLM extraction)
6. Add US5 → Test validation → Deploy (complete feature)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each story independently testable after completion
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No tests generated (manual testing per constitution)
