# Tasks: Onboarding Steps 2 & 3 Revamp

**Input**: Design documents from `/specs/019-onboarding-revamp/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Manual testing per MVP phase (no automated test tasks)

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app (monorepo)**: `apps/nextjs/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Static data, types, and shared components

- [X] T001 [P] Add static types (CookingSkill, StaticDish, StaticDishIngredient, IngredientMatchResult) in apps/nextjs/src/types/onboarding.ts
- [X] T002 [P] Add COMMON_INGREDIENTS (16 items) constant in apps/nextjs/src/constants/onboarding.ts
- [X] T003 [P] Add BASIC_RECIPES (8 static dishes) constant in apps/nextjs/src/constants/onboarding.ts
- [X] T004 [P] Add ADVANCED_RECIPES (8 static dishes) constant in apps/nextjs/src/constants/onboarding.ts
- [X] T005 [P] Create IngredientChip shared component with selectable/read-only modes in apps/nextjs/src/components/shared/IngredientChip.tsx
- [X] T006 Create VoiceTextInput shared component with mic recording + text fallback in apps/nextjs/src/components/shared/VoiceTextInput.tsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ingredient matching service and LLM prompt updates that all voice/text stories depend on

**CRITICAL**: No user story work (except US1-US3 UI) can begin until this phase is complete

- [X] T007 Create matchIngredients() helper function in apps/nextjs/src/lib/services/ingredient-matcher.ts
- [X] T008 Add IngredientExtractionSchema (Zod) in apps/nextjs/src/types/onboarding.ts
- [X] T009 [P] Update voice prompt for ingredient-only extraction (add/remove arrays) in apps/nextjs/src/lib/prompts/onboarding-voice/prompt.ts
- [X] T010 [P] Update voice process.ts to use IngredientExtractionSchema in apps/nextjs/src/lib/prompts/onboarding-voice/process.ts
- [X] T011 [P] Update text prompt for ingredient-only extraction in apps/nextjs/src/lib/prompts/onboarding-text/prompt.ts
- [X] T012 [P] Update text process.ts to use IngredientExtractionSchema in apps/nextjs/src/lib/prompts/onboarding-text/process.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Select Cooking Skill Level (Priority: P1)

**Goal**: User selects Basic/Advanced skill, unlocking ingredients section

**Independent Test**: Select skill, see visual feedback, ingredients section appears

### Implementation for User Story 1

- [X] T013 [US1] Add cookingSkill state (null | 'basic' | 'advanced') to onboarding page in apps/nextjs/src/app/(protected)/app/onboarding/page.tsx
- [X] T014 [US1] Create CookingSkillSelector UI section with radio-style buttons in apps/nextjs/src/app/(protected)/app/onboarding/page.tsx
- [X] T015 [US1] Implement skill selection visual states (selected = bright + checkmark, unselected = grayed) in apps/nextjs/src/app/(protected)/app/onboarding/page.tsx
- [X] T016 [US1] Conditionally hide ingredients section until skill selected in apps/nextjs/src/app/(protected)/app/onboarding/page.tsx

**Checkpoint**: User Story 1 complete - skill selection works independently

---

## Phase 4: User Story 2 - Select Common Ingredients (Priority: P1)

**Goal**: User multi-selects from 16 common ingredients, enables "Next Step"

**Independent Test**: Select multiple ingredients, CTA enables, hint appears

### Implementation for User Story 2

- [X] T017 [US2] Add selectedIngredients state (string[]) to onboarding page in apps/nextjs/src/app/(protected)/app/onboarding/page.tsx
- [X] T018 [US2] Render 16 COMMON_INGREDIENTS as IngredientChip grid (selectable mode) in apps/nextjs/src/app/(protected)/app/onboarding/page.tsx
- [X] T019 [US2] Implement toggle selection behavior for ingredients in apps/nextjs/src/app/(protected)/app/onboarding/page.tsx
- [X] T020 [US2] Enable "Next Step" only when 1+ ingredients selected in apps/nextjs/src/app/(protected)/app/onboarding/page.tsx
- [X] T021 [US2] Show hint text only when skill + 1+ ingredients selected in apps/nextjs/src/app/(protected)/app/onboarding/page.tsx
- [X] T022 [US2] Preserve selectedIngredients when advancing to step 3 in apps/nextjs/src/app/(protected)/app/onboarding/page.tsx

**Checkpoint**: User Stories 1 AND 2 complete - step 2 fully functional

---

## Phase 5: User Story 3 - Review Ingredients List on Step 3 (Priority: P1)

**Goal**: User sees step 2 selections as read-only display on step 3

**Independent Test**: Navigate to step 3, all step 2 selections appear as non-selectable

### Implementation for User Story 3

- [X] T023 [US3] Change step 3 title to "Add more ingredients" in apps/nextjs/src/app/(protected)/app/onboarding/page.tsx
- [X] T024 [US3] Display step 2 ingredients as IngredientChip grid (readOnly mode) in apps/nextjs/src/app/(protected)/app/onboarding/page.tsx
- [X] T025 [US3] Enable "Complete Setup" only when 1+ ingredients in list in apps/nextjs/src/app/(protected)/app/onboarding/page.tsx

**Checkpoint**: User Stories 1-3 complete - core step 2→3 flow works

---

## Phase 6: User Story 4 - Add Ingredients via Voice (Priority: P2)

**Goal**: User speaks to add ingredients, system processes and adds to list

**Independent Test**: Activate mic, speak ingredient names, see them appear in list

### Implementation for User Story 4

- [X] T026 [US4] Update process-voice route request to include currentContext.ingredients in apps/nextjs/src/app/api/onboarding/process-voice/route.ts
- [X] T027 [US4] Update process-voice route response to return IngredientExtractionResponse in apps/nextjs/src/app/api/onboarding/process-voice/route.ts
- [X] T028 [US4] Integrate VoiceTextInput component on step 3 with onSubmit handler in apps/nextjs/src/app/(protected)/app/onboarding/page.tsx
- [X] T029 [US4] Handle voice submission: send audio to API, add ingredients_to_add to list in apps/nextjs/src/app/(protected)/app/onboarding/page.tsx
- [X] T030 [US4] Show toast "Ingredient list has been updated" on successful add in apps/nextjs/src/app/(protected)/app/onboarding/page.tsx
- [X] T031 [US4] Pass instructions prop to VoiceTextInput with add example in apps/nextjs/src/app/(protected)/app/onboarding/page.tsx

**Checkpoint**: User Story 4 complete - voice add works independently

---

## Phase 7: User Story 5 - Remove Ingredients via Voice (Priority: P2)

**Goal**: User speaks to remove ingredients, system removes from list

**Independent Test**: Say ingredient to remove, it disappears from list

### Implementation for User Story 5

- [X] T032 [US5] Handle voice response: remove ingredients_to_remove from list state in apps/nextjs/src/app/(protected)/app/onboarding/page.tsx
- [X] T033 [US5] Silently ignore removal of items not in list in apps/nextjs/src/app/(protected)/app/onboarding/page.tsx
- [X] T034 [US5] Update instructions to include add/remove example in apps/nextjs/src/app/(protected)/app/onboarding/page.tsx

**Checkpoint**: User Stories 4 AND 5 complete - full voice add/remove works

---

## Phase 8: User Story 6 - Add Ingredients via Text (Priority: P2)

**Goal**: User types ingredients as alternative to voice

**Independent Test**: Switch to text mode, type ingredients, see them added

### Implementation for User Story 6

- [X] T035 [US6] Update process-text route request/response to match process-voice in apps/nextjs/src/app/api/onboarding/process-text/route.ts
- [X] T036 [US6] Handle text submission from VoiceTextInput: send to API, update list in apps/nextjs/src/app/(protected)/app/onboarding/page.tsx
- [X] T037 [US6] Show toast on successful text processing in apps/nextjs/src/app/(protected)/app/onboarding/page.tsx

**Checkpoint**: User Stories 4-6 complete - all input methods work

---

## Phase 9: User Story 7 - Complete Onboarding with Persistence (Priority: P1)

**Goal**: "Complete Setup" persists ingredients and skill-based recipes to DB

**Independent Test**: Click Complete Setup, verify DB has recipes and inventory

### Implementation for User Story 7

- [X] T038 [US7] Update persist route to accept cookingSkill parameter in apps/nextjs/src/app/api/onboarding/persist/route.ts
- [X] T039 [US7] Call matchIngredients() to categorize ingredient names in apps/nextjs/src/app/api/onboarding/persist/route.ts
- [X] T040 [US7] Create new unrecognized_items for unrecognizedItemsToCreate in apps/nextjs/src/app/api/onboarding/persist/route.ts
- [X] T041 [US7] Select BASIC_RECIPES or BASIC_RECIPES + ADVANCED_RECIPES based on skill in apps/nextjs/src/app/api/onboarding/persist/route.ts
- [X] T042 [US7] Insert user_recipes from static dishes in apps/nextjs/src/app/api/onboarding/persist/route.ts
- [X] T043 [US7] Insert recipe_ingredients with anchor/optional types via matchIngredients in apps/nextjs/src/app/api/onboarding/persist/route.ts
- [X] T044 [US7] Insert user_inventory entries (quantity_level=3) for all ingredients in apps/nextjs/src/app/api/onboarding/persist/route.ts
- [X] T045 [US7] Wrap all DB operations in transaction in apps/nextjs/src/app/api/onboarding/persist/route.ts
- [X] T046 [US7] Pass cookingSkill to persist API from onboarding page in apps/nextjs/src/app/(protected)/app/onboarding/page.tsx
- [X] T047 [US7] Return PersistResponse with counts in apps/nextjs/src/app/api/onboarding/persist/route.ts

**Checkpoint**: User Story 7 complete - full onboarding flow works end-to-end

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, error handling, and validation

- [ ] T048 [P] Handle empty voice/text input: show toast "No updates were detected" when LLM returns empty arrays (FR-037) in apps/nextjs/src/app/(protected)/app/onboarding/page.tsx
- [ ] T049 [P] Handle LLM timeout with error message and retry option in apps/nextjs/src/app/(protected)/app/onboarding/page.tsx
- [ ] T050 [P] Preserve skill/ingredient selection when navigating back to step 1 in apps/nextjs/src/app/(protected)/app/onboarding/page.tsx
- [ ] T051 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on T001, T008 for types - BLOCKS voice/text stories
- **US1-US3 (Phases 3-5)**: Depend on T005 (IngredientChip) - can proceed after Phase 1
- **US4-US6 (Phases 6-8)**: Depend on Phase 2 + T006 (VoiceTextInput)
- **US7 (Phase 9)**: Depends on Phase 2 (matchIngredients) and can start in parallel with US4-6
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: T005 (IngredientChip) only
- **US2 (P1)**: T002 (COMMON_INGREDIENTS) + T005 (IngredientChip)
- **US3 (P1)**: T005 (IngredientChip) only
- **US4 (P2)**: Phase 2 complete + T006 (VoiceTextInput)
- **US5 (P2)**: US4 complete (shared voice handling)
- **US6 (P2)**: Phase 2 complete + T006 (VoiceTextInput)
- **US7 (P1)**: Phase 2 + T002-T004 (static data)

### Parallel Opportunities

**Phase 1 (all parallel except T006)**:
```
T001 (types) | T002 (COMMON_INGREDIENTS) | T003 (BASIC_RECIPES) | T004 (ADVANCED_RECIPES) | T005 (IngredientChip)
T006 (VoiceTextInput) - depends on useVoiceInput hook (existing)
```

**Phase 2 (prompts parallel)**:
```
T009 (voice prompt) | T011 (text prompt)
T010 (voice process) | T012 (text process)
```

**Phases 3-5 (US1-3 can be combined since same file)**:
Sequential within page.tsx, but independent of Phase 2

---

## Implementation Strategy

### MVP First (User Stories 1-3 + 7)

1. Complete Phase 1: Setup (types, constants, IngredientChip, VoiceTextInput)
2. Complete Phase 2: Foundational (matcher, prompts)
3. Complete Phases 3-5: US1-US3 (step 2 + step 3 display)
4. Complete Phase 9: US7 (persistence)
5. **STOP and VALIDATE**: Test full flow without voice/text additions
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Base infrastructure ready
2. US1-3 + US7 → Core flow works (select skill, pick ingredients, persist)
3. US4-5 → Voice add/remove enhancement
4. US6 → Text fallback enhancement
5. Polish → Edge cases handled

---

## Summary

- **Total tasks**: 51
- **Phase 1 (Setup)**: 6 tasks (includes VoiceTextInput)
- **Phase 2 (Foundational)**: 6 tasks
- **US1 (Skill Selection)**: 4 tasks
- **US2 (Ingredient Selection)**: 6 tasks
- **US3 (Review Display)**: 3 tasks
- **US4 (Voice Add)**: 6 tasks
- **US5 (Voice Remove)**: 3 tasks
- **US6 (Text Input)**: 3 tasks
- **US7 (Persistence)**: 10 tasks
- **Polish**: 4 tasks

**MVP Scope**: Phases 1-2, US1-3, US7 (29 tasks)
**Full Scope**: All phases (51 tasks)

---

## Reusable Components

| Component | Location | Purpose | Future Reuse |
|-----------|----------|---------|--------------|
| VoiceTextInput | components/shared/ | Mic + text fallback input | Recipe editing, inventory quick-add, voice notes |
| IngredientChip | components/shared/ | Selectable/read-only ingredient display | Inventory page, recipe ingredients |
