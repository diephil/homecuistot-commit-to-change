# Tasks: Voice Recipe Editor

**Input**: Design documents from `/specs/016-voice-recipe-editor/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api.yaml ✅

**Tests**: Not requested (manual testing per plan.md)

**Organization**: Tasks grouped by user story for independent implementation/testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story mapping (US1, US2, US3, US4)
- Exact file paths included

---

## Phase 1: Setup

**Purpose**: Create new directories and base files

- [X] T001 Create `src/lib/prompts/recipe-updater/` directory structure
- [X] T002 [P] Add `"creation"` tag and `mode: "creation"` metadata to `src/lib/prompts/recipe-editor/prompt.ts`

---

## Phase 2: Foundational (Types & Schemas)

**Purpose**: Define shared types needed by all user stories

**⚠️ CRITICAL**: Voice/text implementation depends on these types

- [X] T003 Add `recipeStateSchema` and `RecipeState` type to `src/types/recipes.ts`
- [X] T004 Add `recipeUpdateVoiceRequestSchema` and type to `src/types/recipes.ts`
- [X] T005 Add `recipeUpdateTextRequestSchema` and type to `src/types/recipes.ts`

**Checkpoint**: Types ready - LLM and API implementation can begin

---

## Phase 3: User Story 1 - Edit Recipe via Voice (Priority: P1) 🎯 MVP

**Goal**: Voice recording updates recipe, preserving unchanged fields

**Independent Test**: Open existing recipe → record "add garlic as optional" → verify ingredient added, title/description unchanged

### Implementation for User Story 1

- [X] T006 [US1] Create `RECIPE_UPDATER_PROMPT` in `src/lib/prompts/recipe-updater/prompt.ts`
- [X] T007 [US1] Create `processVoiceRecipeUpdate()` in `src/lib/prompts/recipe-updater/process.ts` with Opik tracing
- [X] T008 [US1] Create POST handler in `src/app/api/recipes/update-voice/route.ts`
- [X] T009 [US1] Add `stage` state (`form|processing|preview`) to `src/components/recipes/recipe-form.tsx`
- [X] T010 [US1] Enable `QuickInputSection` in edit mode in `src/components/recipes/recipe-form.tsx`
- [X] T011 [US1] Add `handleVoiceComplete` for edit mode → POST `/api/recipes/update-voice` in `src/components/recipes/recipe-form.tsx`
- [X] T012 [US1] Add preview state showing proposed changes in `src/components/recipes/recipe-form.tsx`
- [X] T013 [US1] Add save/dismiss actions from preview in `src/components/recipes/recipe-form.tsx`

**Checkpoint**: Voice editing functional - user can record update, preview, save/dismiss

---

## Phase 4: User Story 2 - Edit Recipe via Text (Priority: P1)

**Goal**: Text input updates recipe identically to voice

**Independent Test**: Open existing recipe → type "replace rice with quinoa" → verify ingredient changed, others unchanged

### Implementation for User Story 2

- [X] T014 [US2] Create `processTextRecipeUpdate()` in `src/lib/prompts/recipe-updater/process.ts` with Opik tracing
- [X] T015 [US2] Create POST handler in `src/app/api/recipes/update-text/route.ts`
- [X] T016 [US2] Add `handleTextSubmit` for edit mode → POST `/api/recipes/update-text` in `src/components/recipes/recipe-form.tsx`

**Checkpoint**: Text editing functional - user can type update, preview, save/dismiss

---

## Phase 5: User Story 3 - Switch Between Voice and Text (Priority: P2)

**Goal**: Seamless toggle between voice/text input modes

**Independent Test**: Open recipe edit mode → switch voice↔text → verify both modes remain functional

### Implementation for User Story 3

- [X] T017 [US3] Verify `QuickInputSection` toggle works in edit mode in `src/components/recipes/recipe-form.tsx`

**Checkpoint**: Input mode toggle functional (likely already works via QuickInputSection reuse)

---

## Phase 6: User Story 4 - Partial Update Preservation (Priority: P1)

**Goal**: Changes apply ONLY to explicitly mentioned fields

**Independent Test**: Make 5 sequential edits (title, ingredient add, description, ingredient remove, mark optional) → verify each preserves all other fields

### Implementation for User Story 4

- [X] T018 [US4] Update LLM prompt to emphasize field preservation rules in `src/lib/prompts/recipe-updater/prompt.ts`
- [X] T019 [US4] Add logging for field change detection in `src/lib/prompts/recipe-updater/process.ts`

**Checkpoint**: Partial updates preserve unmentioned fields

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validation, edge cases, error handling

- [X] T020 Integrate `validateIngredients()` after LLM response in `src/lib/prompts/recipe-updater/process.ts`
- [X] T021 Show toast for unrecognized ingredients in `src/components/recipes/recipe-form.tsx`
- [X] T022 [P] Add error toast for API failures in `src/components/recipes/recipe-form.tsx`
- [X] T023 [P] Add loading skeleton during processing in `src/components/recipes/recipe-form.tsx`
- [X] T024 Add validation blocking zero-ingredient updates in `src/components/recipes/recipe-form.tsx`
- [ ] T025 Run quickstart.md manual testing checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup
- **US1/US2/US4 (Phases 3, 4, 6)**: Depend on Foundational
- **US3 (Phase 5)**: Depends on US1 and US2
- **Polish (Phase 7)**: Depends on all user stories

### User Story Dependencies

```
Phase 2 (Types)
    ↓
┌───┼───┐
↓   ↓   ↓
US1 US2 US4  (can run in parallel after Phase 2)
    ↓   ↓
    └─┬─┘
      ↓
     US3     (needs both voice and text working)
      ↓
   Polish
```

### Within Each User Story

1. LLM prompt/process functions first
2. API route second
3. UI integration third
4. All UI tasks sequential (same file)

### Parallel Opportunities

- T001, T002: Can run in parallel
- T003, T004, T005: Sequential (same file)
- T006-T008: Sequential within US1 (dependencies)
- T009-T013: Sequential (same file: recipe-form.tsx)
- T014-T016: Sequential within US2 (dependencies)
- T020-T024: T022/T023 can run in parallel (error vs loading)

---

## Parallel Example: Setup Phase

```bash
# Launch setup tasks together:
Task: "Create src/lib/prompts/recipe-updater/ directory"
Task: "Add creation tag to recipe-editor/prompt.ts"
```

---

## Parallel Example: After Foundational Phase

```bash
# US1 and US2 LLM work can happen in parallel:
Task: "Create RECIPE_UPDATER_PROMPT in prompt.ts"  # US1 starts
Task: "Create processTextRecipeUpdate in process.ts"  # US2 waits for prompt

# But actually US2 depends on US1's prompt, so sequential:
# T006 → T007 → T008 (US1)
# T014 → T015 → T016 (US2, but T014 depends on T006)
```

---

## Implementation Strategy

### MVP First (Voice Only - User Story 1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (types)
3. Complete Phase 3: User Story 1 (voice editing)
4. **STOP and VALIDATE**: Test voice editing independently
5. Demo: "Users can edit recipes via voice"

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (voice) → Test → Deploy (MVP!)
3. Add US2 (text) → Test → Deploy (full input modes)
4. Add US4 (preservation) → Test → Confidence in partial updates
5. Add US3 (toggle) → Test → UX complete
6. Polish → Full feature ready

### Single Developer Strategy

Execute sequentially by priority:
1. Phases 1-3 (Setup → Foundational → US1 Voice)
2. Phase 4 (US2 Text)
3. Phase 6 (US4 Preservation - may overlap with US1/US2 prompt)
4. Phase 5 (US3 Toggle - verification only)
5. Phase 7 (Polish)

---

## Notes

- US1 and US2 share the same prompt but different process functions
- US3 likely zero-implementation (QuickInputSection already supports toggle)
- US4 is primarily prompt engineering, can be folded into US1/US2
- All UI changes are in one file (recipe-form.tsx) - cannot parallelize
- Opik tracing added via `trackGemini()` wrapper in process.ts
