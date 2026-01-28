# Tasks: Demo Data Reset

**Input**: Design documents from `/specs/017-demo-data-reset/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Manual testing only (MVP phase per constitution)

**Organization**: Tasks grouped by user story for independent implementation

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- All paths relative to `apps/nextjs/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create demo data constants and shared modal component

- [x] T001 [P] Create demo data constants in `src/db/demo-data.ts` with DEMO_INVENTORY (21 items) and DEMO_RECIPES (6 recipes) arrays per data-model.md
- [x] T002 [P] Create shared ConfirmationModal component in `src/components/app/confirmation-modal.tsx` with props: isOpen, title, message, confirmText, confirmButtonClass, isLoading, onConfirm, onCancel

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Refactor existing component to use shared modal, add server action

- [x] T003 Refactor ResetUserDataButton in `src/components/app/reset-user-data-button.tsx` to use ConfirmationModal component (remove inline modal, keep existing behavior: redirect to onboarding on success)
- [x] T004 Add startDemoData server action in `src/app/actions/user-data.ts` following contract: auth check → transaction (delete all user data → lookup ingredient IDs → insert demo inventory → insert demo recipes → insert recipe ingredients) → revalidate paths → return result

**Checkpoint**: Foundation ready - shared modal works, server action available

---

## Phase 3: User Story 1 - Start Demo Mode (Priority: P1) 🎯 MVP

**Goal**: User clicks "Start Demo", confirms, sees demo data on /app page

**Independent Test**: Click Start Demo → Confirm → Page shows "Ready To Cook" recipes (Scrambled Eggs, Spaghetti Aglio e Olio)

### Implementation for User Story 1

- [x] T005 [US1] Create StartDemoButton component in `src/components/app/start-demo-button.tsx` with blue neo-brutalist styling (bg-blue-400), "🚀 Start Demo" text, opens ConfirmationModal on click
- [x] T006 [US1] Wire StartDemoButton to call startDemoData() server action on confirm, call router.refresh() on success, show alert on error
- [x] T007 [US1] Update page layout in `src/app/(protected)/app/page.tsx`: import StartDemoButton, add to section with gap-4 spacing next to ResetUserDataButton

**Checkpoint**: User Story 1 complete - demo mode fully functional

---

## Phase 4: User Story 2 - Cancel Demo Reset (Priority: P2)

**Goal**: User can cancel modal without data changes

**Independent Test**: Click Start Demo → Cancel → No data changes, modal closes

### Implementation for User Story 2

- [x] T008 [US2] Verify ConfirmationModal cancel behavior in `src/components/app/confirmation-modal.tsx`: clicking Cancel calls onCancel, clicking overlay calls onCancel (unless loading), both buttons disabled during loading
- [x] T009 [US2] Verify StartDemoButton cancel handling in `src/components/app/start-demo-button.tsx`: setIsModalOpen(false) on cancel, no server action call

**Checkpoint**: User Story 2 complete - cancel flow works correctly

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validation and cleanup

- [ ] T010 [P] Verify transaction rollback: test that partial demo data insertion failure leaves user with no data changes
- [ ] T011 [P] Verify revalidation: after demo data insert, /app, /app/inventory, /app/recipes all show fresh data without manual refresh
- [ ] T012 Run quickstart.md manual testing checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - T001, T002 can run in parallel
- **Foundational (Phase 2)**: T003 depends on T002 (ConfirmationModal), T004 depends on T001 (demo data)
- **User Story 1 (Phase 3)**: T005 depends on T002, T006 depends on T004+T005, T007 depends on T005
- **User Story 2 (Phase 4)**: Verifies T002 and T005 behavior
- **Polish (Phase 5)**: Depends on all user stories complete

### User Story Independence

- **User Story 1 (P1)**: Core functionality - can be delivered as MVP
- **User Story 2 (P2)**: Cancel behavior - naturally included in modal component, minimal additional work

### Task Graph

```
T001 (demo-data.ts) ─────────────────────┐
                                         ├──▶ T004 (server action)
T002 (ConfirmationModal) ──┬─────────────┘           │
                           │                         │
                           ├──▶ T003 (refactor Reset)│
                           │                         │
                           └──▶ T005 (StartDemoBtn) ─┴──▶ T006 (wire action) ──▶ T007 (page.tsx)
                                        │
                                        └──▶ T008, T009 (verify cancel)
```

### Parallel Opportunities

```bash
# Phase 1 - run in parallel:
Task: "Create demo data constants in src/db/demo-data.ts"
Task: "Create shared ConfirmationModal in src/components/app/confirmation-modal.tsx"

# Phase 5 - run in parallel:
Task: "Verify transaction rollback"
Task: "Verify revalidation"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001, T002 in parallel)
2. Complete Phase 2: Foundational (T003, T004)
3. Complete Phase 3: User Story 1 (T005 → T006 → T007)
4. **STOP and VALIDATE**: Test demo mode end-to-end
5. Deploy if ready

### Full Feature

1. Complete MVP (Phases 1-3)
2. Verify User Story 2 (Phase 4: T008, T009)
3. Polish (Phase 5: T010, T011, T012)

---

## Files Summary

| File | Action | Task |
|------|--------|------|
| `src/db/demo-data.ts` | CREATE | T001 |
| `src/components/app/confirmation-modal.tsx` | CREATE | T002 |
| `src/components/app/reset-user-data-button.tsx` | MODIFY | T003 |
| `src/app/actions/user-data.ts` | MODIFY | T004 |
| `src/components/app/start-demo-button.tsx` | CREATE | T005, T006, T009 |
| `src/app/(protected)/app/page.tsx` | MODIFY | T007 |

Total: 3 new files, 3 modified files, 12 tasks

---

## Notes

- All paths relative to `apps/nextjs/`
- No automated tests (MVP phase - manual testing per constitution)
- Blue button styling per constitution VII (Vibrant Neobrutalism)
- Transaction guarantees atomic rollback on failure
- router.refresh() keeps user on /app page (no navigation)
