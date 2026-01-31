# Tasks: Unrecognized Items Display

**Input**: Design documents from `/specs/021-unrecognized-items-display/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Manual testing only (per MVP constitution - no automated test tasks)

**Organization**: Tasks grouped by user story for independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3, US4, US5)
- Paths relative to `apps/nextjs/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project structure and type definitions

- [x] T001 Create type definitions with Drizzle schema derivation in src/types/inventory.types.ts
- [x] T002 [P] Create service layer directory structure in src/lib/services/
- [x] T003 [P] Create server actions directory structure in src/app/actions/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Implement unrecognized items service with delete operation in src/lib/services/unrecognized-items.service.ts
- [x] T005 Implement deleteUnrecognizedItem server action in src/app/actions/inventory.actions.ts
- [x] T006 [P] Create PantryStapleIcon reusable component with Infinity icon in src/components/shared/PantryStapleIcon.tsx
- [x] T007 [P] Create UnrecognizedItemRow reusable component with restricted UI in src/components/shared/UnrecognizedItemRow.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Unrecognized Items (Priority: P1) 🎯 MVP

**Goal**: Display unrecognized items at end of inventory list with visual distinction

**Independent Test**: Add unrecognized item to user_inventory, verify it appears at list end with reduced opacity and muted text

### Implementation for User Story 1

- [x] T008 [US1] Modify inventory page to fetch items with unrecognized relations in src/app/(protected)/app/inventory/page.tsx
- [x] T009 [US1] Add sorting logic to separate recognized from unrecognized items in src/app/(protected)/app/inventory/page.tsx
- [x] T010 [US1] Render unrecognized items section at end of list using UnrecognizedItemRow component in src/app/(protected)/app/inventory/page.tsx

**Checkpoint**: User Story 1 fully functional - unrecognized items visible with visual distinction

---

## Phase 4: User Story 2 - Limited Interaction with Unrecognized Items (Priority: P2)

**Goal**: Prevent quantity/pantry staple changes for unrecognized items, only delete action available

**Independent Test**: Click unrecognized item, verify quantity controls and pantry staple checkbox disabled/hidden, delete button functional

### Implementation for User Story 2

- [x] T011 [US2] Add disabled state styling to UnrecognizedItemRow (no click handlers, pointer-events-none) in src/components/shared/UnrecognizedItemRow.tsx
- [x] T012 [US2] Verify quantity controls not rendered for unrecognized items in UnrecognizedItemRow component in src/components/shared/UnrecognizedItemRow.tsx
- [x] T013 [US2] Verify pantry staple control not rendered for unrecognized items in UnrecognizedItemRow component in src/components/shared/UnrecognizedItemRow.tsx

**Checkpoint**: User Stories 1 AND 2 functional - unrecognized items visible and non-interactive except delete

---

## Phase 5: User Story 3 - Delete Unrecognized Items (Priority: P3)

**Goal**: Users can delete unrecognized items from inventory while preserving unrecognized_items table records

**Independent Test**: Delete unrecognized item, verify removed from inventory page but remains in unrecognized_items table

### Implementation for User Story 3

- [x] T014 [US3] Add delete button with Trash2 icon to UnrecognizedItemRow component in src/components/shared/UnrecognizedItemRow.tsx
- [x] T015 [US3] Implement client-side delete handler with optimistic UI update in src/components/shared/UnrecognizedItemRow.tsx
- [x] T016 [US3] Add error handling with toast notifications (success and failure) in src/components/shared/UnrecognizedItemRow.tsx
- [x] T017 [US3] Add rollback logic for failed delete operations in src/components/shared/UnrecognizedItemRow.tsx

**Checkpoint**: User Stories 1, 2, AND 3 functional - users can view, understand restrictions, and delete unrecognized items

---

## Phase 6: User Story 4 - Help Documentation (Priority: P4)

**Goal**: Provide contextual help explaining unrecognized items, future recognition, and deletion behavior

**Independent Test**: Open help modal via "?" button, verify unrecognized items section exists with explanation

### Implementation for User Story 4

- [x] T018 [US4] Locate existing HelpModal component in src/components/ directory (search for help, modal, or "?" related files)
- [x] T019 [US4] Add unrecognized items section to HelpModal with explanation of limited recognition in src/components/inventory/help-modal.tsx
- [x] T020 [US4] Add future recognition explanation to HelpModal section in src/components/inventory/help-modal.tsx
- [x] T021 [US4] Add deletion behavior explanation (removes from inventory, preserves record) to HelpModal in src/components/inventory/help-modal.tsx

**Checkpoint**: User Stories 1-4 functional - users have contextual help for understanding unrecognized items

---

## Phase 7: User Story 5 - Pantry Staple UI Improvements (Priority: P4)

**Goal**: Replace star icon with infinity symbol, add hint text explaining pantry staples

**Independent Test**: View pantry staples section, verify infinity icon displayed and hint text visible below section

### Implementation for User Story 5

- [x] T022 [US5] Locate existing pantry staple icon usage in inventory components (search for Star icon or pantry staple rendering)
- [x] T023 [US5] Replace Star icon imports with Infinity icon in src/components/inventory/inventory-section.tsx
- [x] T024 [US5] Add pantry staple hint text below pantry staples section header in src/app/(protected)/app/inventory/page.tsx
- [x] T025 [US5] Add conditional rendering to hide hint text when no pantry staples exist in src/app/(protected)/app/inventory/page.tsx

**Checkpoint**: All user stories functional - pantry staple UI improved with infinity icon and explanatory hint

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and quality improvements

- [x] T026 [P] Verify TypeScript compilation succeeds (pnpm build from apps/nextjs/)
- [x] T027 [P] Run linting and format check (pnpm lint from apps/nextjs/)
- [ ] T028 Run quickstart.md manual testing checklist validation
- [ ] T029 Verify performance criteria: inventory loads <2s with unrecognized items (SC-001)
- [ ] T030 [P] Test with seed data: verify page loads <3s with 500 total items (SC-005)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories CAN proceed in parallel (different components/files)
  - OR sequentially in priority order (P1 → P2 → P3 → P4 → P4)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 completion (modifies UnrecognizedItemRow created in foundational)
- **User Story 3 (P3)**: Depends on US1 and US2 (adds delete functionality to restricted items)
- **User Story 4 (P4)**: Independent after Foundational - can run in parallel with US1-3
- **User Story 5 (P4)**: Independent after Foundational - can run in parallel with US1-4

### Within Each User Story

- **US1**: Tasks must run sequentially (T008 → T009 → T010) - same file modifications
- **US2**: Tasks can run in parallel (all modify UnrecognizedItemRow component in different ways)
- **US3**: Tasks must run sequentially (T014 → T015 → T016 → T017) - progressive enhancement of delete handler
- **US4**: Tasks must run sequentially (T018 find file → T019-T021 modify sections)
- **US5**: T022 must complete first (find files), then T023-T025 can run in parallel

### Parallel Opportunities

**Setup Phase (Phase 1)**:
```bash
Task T002: Create service layer directory
Task T003: Create server actions directory
```

**Foundational Phase (Phase 2)**:
```bash
Task T006: Create PantryStapleIcon component
Task T007: Create UnrecognizedItemRow component
```

**User Story 2**:
```bash
Task T011: Add disabled state styling
Task T012: Verify quantity controls not rendered
Task T013: Verify pantry staple control not rendered
```

**Polish Phase (Phase 8)**:
```bash
Task T026: TypeScript compilation check
Task T027: Linting and format check
Task T030: Performance test with 500 items
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T007) - CRITICAL
3. Complete Phase 3: User Story 1 (T008-T010)
4. **STOP and VALIDATE**: Test unrecognized items display independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! - unrecognized items visible)
3. Add User Story 2 → Test independently → Deploy/Demo (restricted interactions working)
4. Add User Story 3 → Test independently → Deploy/Demo (delete functionality working)
5. Add User Story 4 → Test independently → Deploy/Demo (help documentation complete)
6. Add User Story 5 → Test independently → Deploy/Demo (pantry staple UI improved)
7. Polish Phase → Final validation → Production deploy

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T007)
2. Once Foundational done:
   - Developer A: User Story 1 (T008-T010)
   - Developer B: User Story 4 (T018-T021) - independent, can run in parallel
   - Developer C: User Story 5 (T022-T025) - independent, can run in parallel
3. After US1 complete:
   - Developer A: User Story 2 (T011-T013)
   - Developer A then: User Story 3 (T014-T017)
4. Stories integrate without conflicts

---

## Notes

- [P] tasks = different files or independent modifications, no dependencies
- [Story] label maps task to user story from spec.md for traceability
- Each user story independently completable and testable
- Manual testing checklist in quickstart.md (T028)
- Commit after each user story phase completion (per Speckit workflow)
- Stop at any checkpoint to validate story independently
- HelpModal location must be found in T018 before proceeding with T019-T021
- Pantry staple icon locations must be found in T022 before T023
