# Tasks: Inventory Page Rework

**Input**: Design documents from `/specs/014-inventory-page-rework/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Manual testing per constitution - no automated tests for MVP

**Organization**: Tasks grouped by user story for independent implementation/testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no dependencies)
- **[Story]**: User story (US1, US2, etc.)
- Exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Project initialization and prompt registration

- [X] T001 Create types/inventory.ts with Zod schemas and derived types
- [X] T002 Create lib/prompts/inventory-update/prompt.ts with INVENTORY_UPDATE_PROMPT definition
- [X] T003 Create lib/prompts/inventory-update/process.ts with Gemini integration
- [X] T004 Create scripts/register-inventory-prompt.ts for Opik prompt registration
- [X] T005 Add npm scripts to package.json: prompt:inventory, prompt:inventory:prod, update prompt:all
- [X] T006 Run pnpm prompt:inventory to register prompt to local Opik

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core API routes that all user stories depend on

**⚠️ CRITICAL**: User story implementation depends on these routes

- [X] T007 [P] Implement POST /api/inventory/process-voice in app/api/inventory/process-voice/route.ts
- [X] T008 [P] Implement POST /api/inventory/process-text in app/api/inventory/process-text/route.ts
- [X] T009 [P] Implement POST /api/inventory/validate in app/api/inventory/validate/route.ts
- [X] T010 [P] Implement POST /api/inventory/batch in app/api/inventory/batch/route.ts
- [X] T011 [P] Implement PATCH /api/inventory/[id]/toggle-staple in app/api/inventory/[id]/toggle-staple/route.ts
- [X] T012 [P] Implement DELETE /api/inventory/[id] in app/api/inventory/[id]/route.ts

**Checkpoint**: Foundation ready - user story implementation can begin

---

## Phase 3: User Story 1 - View Inventory with Quantity Levels (Priority: P1) 🎯 MVP

**Goal**: Users see ingredients in two sections (Available/Pantry Staples) with color-coded dot matrix badges

**Independent Test**: Load inventory page with user data, verify both sections render with correct quantity badges

### Implementation for User Story 1

- [ ] T013 [P] [US1] Create components/inventory/inventory-section.tsx for section wrapper
- [ ] T014 [P] [US1] Create components/inventory/help-modal.tsx for feature explanation
- [ ] T015 [US1] Rewrite app/(protected)/app/inventory/page.tsx to fetch and display two sections
- [ ] T016 [US1] Integrate IngredientBadge dots variant for quantity display in inventory-section.tsx
- [ ] T017 [US1] Add empty state handling for zero inventory items in page.tsx
- [ ] T018 [US1] Add InfoCard explanation for Pantry Staples section in inventory-section.tsx

**Checkpoint**: User Story 1 complete - users can view inventory in both sections

---

## Phase 4: User Story 2 - Manually Adjust Ingredient Quantity (Priority: P2)

**Goal**: Users tap ingredient badge to manually set quantity level (0-3)

**Independent Test**: Click badge, change quantity, verify persistence

### Implementation for User Story 2

- [ ] T019 [US2] Create components/inventory/quantity-selector.tsx with 0-3 level options
- [ ] T020 [US2] Add interactive prop and onClick handler to IngredientBadge in inventory-section.tsx
- [ ] T021 [US2] Wire quantity-selector to POST /api/inventory endpoint for single updates
- [ ] T022 [US2] Add optimistic UI updates with error rollback in inventory-section.tsx
- [ ] T023 [US2] Add toast notifications for success/error in quantity change flow

**Checkpoint**: User Story 2 complete - manual quantity adjustment works

---

## Phase 5: User Story 3 - Move Ingredients Between Sections (Priority: P2)

**Goal**: Users toggle ingredients between Available and Pantry Staples sections

**Independent Test**: Move ingredient, verify new section and correct status

### Implementation for User Story 3

- [ ] T024 [US3] Add toggle staple button to ingredient cards in inventory-section.tsx
- [ ] T025 [US3] Wire toggle button to PATCH /api/inventory/[id]/toggle-staple
- [ ] T026 [US3] Add optimistic section move with error rollback in page.tsx
- [ ] T027 [US3] Add toast notification for staple toggle success/error

**Checkpoint**: User Story 3 complete - section toggling works

---

## Phase 6: User Story 4 - Voice-Based Inventory Update (Priority: P3)

**Goal**: Users record voice description of inventory changes, see proposed updates

**Independent Test**: Record voice, review proposals, verify correct extraction

### Implementation for User Story 4

- [ ] T028 [P] [US4] Create components/inventory/inventory-update-modal.tsx with input stage
- [ ] T029 [P] [US4] Create components/inventory/update-confirmation.tsx for proposal review
- [ ] T030 [US4] Integrate VoiceInput component from components/recipes/voice-input.tsx in modal
- [ ] T031 [US4] Wire voice recording to POST /api/inventory/process-voice
- [ ] T032 [US4] Add processing stage with loading skeleton in modal
- [ ] T033 [US4] Display extracted updates with confidence levels in update-confirmation.tsx
- [ ] T034 [US4] Add error handling for voice permission denial and recording failures
- [ ] T035 [US4] Add "Update Inventory" button in page header to open modal

**Checkpoint**: User Story 4 complete - voice input and proposal generation works

---

## Phase 7: User Story 5 - Confirm or Cancel Inventory Updates (Priority: P3)

**Goal**: Users review proposed changes with before/after comparison, confirm or cancel

**Independent Test**: Complete voice input, confirm changes, verify database updates

### Implementation for User Story 5

- [ ] T036 [US5] Add before/after quantity comparison "(2 → 3)" in update-confirmation.tsx
- [ ] T037 [US5] Wire validation of ingredient names via POST /api/inventory/validate
- [ ] T038 [US5] Split recognized/unrecognized items in confirmation view
- [ ] T039 [US5] Add unrecognized items warning with Alert component
- [ ] T040 [US5] Wire Save button to POST /api/inventory/batch for confirmed updates
- [ ] T041 [US5] Add Cancel button to close modal without changes
- [ ] T042 [US5] Refresh inventory display on successful save
- [ ] T043 [US5] Add saving state with loading indicator in modal

**Checkpoint**: User Story 5 complete - full voice update flow works end-to-end

---

## Phase 8: User Story 6 - Text Input Alternative (Priority: P4)

**Goal**: Users type inventory updates as alternative to voice

**Independent Test**: Switch to text mode, type updates, verify same processing

### Implementation for User Story 6

- [ ] T044 [US6] Add text/voice mode toggle in inventory-update-modal.tsx
- [ ] T045 [US6] Add TextArea component for text input mode
- [ ] T046 [US6] Wire text submit to POST /api/inventory/process-text
- [ ] T047 [US6] Ensure same confirmation flow applies to text input
- [ ] T048 [US6] Add keyboard shortcut hints for text mode

**Checkpoint**: User Story 6 complete - text input alternative works

---

## Phase 9: User Story 7 - Remove Ingredient from Inventory (Priority: P4)

**Goal**: Users permanently delete ingredient from inventory (different from quantity=0)

**Independent Test**: Remove ingredient, verify deletion

### Implementation for User Story 7

- [ ] T049 [US7] Add delete (X) button to ingredient cards in inventory-section.tsx
- [ ] T050 [US7] Add confirmation dialog before deletion
- [ ] T051 [US7] Wire delete button to DELETE /api/inventory/[id]
- [ ] T052 [US7] Remove deleted item from UI optimistically with error rollback
- [ ] T053 [US7] Add toast notification for delete success/error

**Checkpoint**: User Story 7 complete - ingredient removal works

---

## Phase 10: User Story 8 - Help and Onboarding (Priority: P4)

**Goal**: Users understand page features via help modal

**Independent Test**: Open help, verify all features explained

### Implementation for User Story 8

- [ ] T054 [US8] Add help icon button in page header in page.tsx
- [ ] T055 [US8] Populate help-modal.tsx with feature explanations and voice examples
- [ ] T056 [US8] Add sections: badge tapping, pantry staples, voice input phrases
- [ ] T057 [US8] Style help modal with neo-brutalist design

**Checkpoint**: User Story 8 complete - help documentation accessible

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Quality improvements across all user stories

- [ ] T058 [P] Add error boundaries for component error handling
- [ ] T059 [P] Performance optimization: lazy load modal components
- [ ] T060 [P] Accessibility audit: keyboard navigation, ARIA labels
- [ ] T061 [P] Mobile responsiveness testing and adjustments
- [ ] T062 Run quickstart.md manual testing checklist
- [ ] T063 Code cleanup and remove temporary console.logs
- [ ] T064 Update documentation with API examples
- [ ] T065 Verify Opik traces for all LLM calls

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-10)**: All depend on Foundational completion
  - US1-US3 can run in parallel (different features)
  - US4-US5 sequential (confirmation depends on voice input)
  - US6-US8 can run in parallel after US4-US5
- **Polish (Phase 11)**: Depends on desired user stories complete

### User Story Dependencies

- **US1 (P1)**: No dependencies on other stories
- **US2 (P2)**: Requires US1 (needs badges to adjust)
- **US3 (P2)**: Requires US1 (needs items to toggle)
- **US4 (P3)**: No dependencies on other stories
- **US5 (P3)**: Requires US4 (confirmation for voice proposals)
- **US6 (P4)**: Requires US4 (text alternative for voice modal)
- **US7 (P4)**: Requires US1 (needs items to delete)
- **US8 (P4)**: No dependencies on other stories

### Within Each User Story

- Components before page integration
- API wiring before error handling
- Core functionality before optimizations

### Parallel Opportunities

- All Setup tasks (T001-T006) can run in parallel
- All Foundational API routes (T007-T012) can run in parallel
- US1 components (T013-T014) can run in parallel
- Once US1 complete: US2, US3, US7 can run in parallel
- Once US4 complete: US5, US6 can run in parallel
- Polish tasks (T058-T061) can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch all API routes together:
Task: "POST /api/inventory/process-voice in app/api/inventory/process-voice/route.ts"
Task: "POST /api/inventory/process-text in app/api/inventory/process-text/route.ts"
Task: "POST /api/inventory/validate in app/api/inventory/validate/route.ts"
Task: "POST /api/inventory/batch in app/api/inventory/batch/route.ts"
Task: "PATCH /api/inventory/[id]/toggle-staple in app/api/inventory/[id]/toggle-staple/route.ts"
Task: "DELETE /api/inventory/[id] in app/api/inventory/[id]/route.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test US1 independently
5. Deploy/demo basic inventory view

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Test → Deploy (MVP!)
3. Add US2 → Test → Deploy (manual adjustment)
4. Add US3 → Test → Deploy (staple toggle)
5. Add US4-US5 → Test → Deploy (voice updates)
6. Add US6-US8 → Test → Deploy (polish)

### Parallel Team Strategy

With multiple developers after Foundational:

- Developer A: US1 → US2 → US3
- Developer B: US4 → US5 → US6
- Developer C: US7 → US8 → Polish

---

## Notes

- [P] = Parallelizable (different files, no dependencies)
- [Story] = Traceability to user stories in spec.md
- Each story independently testable
- Manual testing checklist in quickstart.md
- Commit after each user story checkpoint
- No automated tests per MVP constitution
- All API routes use Drizzle parameterized queries for security
- LLM calls traced via Opik for observability
