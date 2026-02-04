# Tasks: Onboarding Integration

**Input**: Design documents from `/specs/025-onboarding-integration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested. Manual testing per MVP constitution.

**Organization**: Tasks grouped by user story. User reports expected after each phase checkpoint.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Base

All paths relative to `apps/nextjs/src/` unless specified otherwise.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Schema and type definitions that multiple user stories depend on

- [X] T001 REMOVED — No new schema needed, reusing `inventory-update.orchestration.ts` which already handles quantity detection
- [X] T002 [P] Extend `StoryCompleteRequestSchema` in `lib/story-onboarding/types.ts` — change `ingredients` and `pantryStaples` from `z.array(z.string())` to `z.array(z.object({ name: z.string(), quantityLevel: z.number() }))`, derive updated `StoryCompleteRequest` type

**Checkpoint**: Types ready. Report for review before proceeding.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend changes that must complete before frontend stories can work

**⚠️ CRITICAL**: US2 (quantity bug fix) and US3 (correct persistence) depend on these.

- [X] T003 REMOVED — No agent changes needed, reusing `inventory-update.orchestration.ts`
- [X] T004 REMOVED — No agent changes needed, reusing `inventory-update.orchestration.ts`
- [X] T005 Update process-input route in `app/api/onboarding/story/process-input/route.ts` — replace `ingredientExtractorAgent` with `createInventoryManagerAgentProposal` from `lib/orchestration/inventory-update.orchestration.ts`, add "onboarding-story" tag, adapt response to extract `{ name, quantityLevel }` from `ValidatedInventoryUpdate.proposedQuantity`, add Opik trace metadata for unrecognized items
- [X] T006 Update `prefillDemoData` service in `lib/services/demo-data-prefill.ts` — change `ingredients` and `pantryStaples` params from `string[]` to `Array<{ name: string, quantityLevel: number }>`, use each item's `quantityLevel` instead of hardcoded 3
- [X] T007 Update story complete route in `app/api/onboarding/story/complete/route.ts` — parse body with updated `StoryCompleteRequestSchema`, pass structured ingredients/pantryStaples to `prefillDemoData` (NO CHANGES NEEDED - already uses updated schema and service)

**Checkpoint**: Backend ready. Report for review before proceeding.

---

## Phase 3: User Story 1 — New User Sees Story Onboarding (Priority: P1) 🎯 MVP

**Goal**: Replace old wizard at `/onboarding` with the story-based flow. Remove `/onboarding/story` sub-route.

**Independent Test**: Navigate to `/onboarding` as a new user → see Scene 1 of story onboarding instead of old wizard.

### Implementation for User Story 1

- [X] T008 [US1] Swap `page.tsx` in `app/(protected)/app/onboarding/page.tsx` — replace `OnboardingPageContent` import with `StoryOnboarding` import from `./story/StoryOnboarding`, keep `ErrorBoundary` and `OnboardingGuard` wrappers, keep server-side `hasCompletedOnboarding` guard

**Checkpoint**: Route swap done. `/onboarding` now shows story flow. Old wizard is dead code (kept). Report for review.

---

## Phase 4: User Story 2 — Voice Input Returns Correct Quantity Level (Priority: P1)

**Goal**: Fix the quantityLevel bug — Scene 4 voice/text input returns and uses LLM-extracted quantity levels instead of hardcoded 3.

**Independent Test**: In Scene 4, type "I bought some eggs" → verify eggs show "some" (2) not "plenty" (3).

### Implementation for User Story 2

- [X] T009 [US2] Update Scene4Voice inventory update logic in `app/(protected)/app/onboarding/story/scenes/Scene4Voice.tsx` — when processing `data.add`, read `quantityLevel` from each item (`data.add` is now `Array<{ name, quantityLevel }>`) instead of hardcoding 3. For existing items: set `existing.quantityLevel = item.quantityLevel`. For new items: use `item.quantityLevel` in the push. Default to 3 if quantityLevel missing (fallback safety).

**Checkpoint**: Quantity bug fixed end-to-end (LLM → API → frontend). Report for review.

---

## Phase 5: User Story 3 — Onboarding Completion Persists Correct Quantities (Priority: P1)

**Goal**: Scene 7 completion sends per-ingredient quantityLevel to the API, which persists them correctly.

**Independent Test**: Complete full story → check DB → quantities match final story state.

### Implementation for User Story 3

- [X] T010 [US3] Update Scene7Manifesto payload in `app/(protected)/app/onboarding/story/scenes/Scene7Manifesto.tsx` — change `ingredients` from `inventory.filter().map(i => i.name)` to `inventory.filter().map(i => ({ name: i.name, quantityLevel: i.quantityLevel }))`, same for `pantryStaples`

**Checkpoint**: Full data flow complete (voice input → correct qty in UI → correct qty persisted in DB). Report for review.

---

## Phase 6: User Story 4 — Opik Trace Metadata for Unrecognized Items (Priority: P2)

**Goal**: Add proper tags and metadata to Opik traces when unrecognized ingredients are detected.

**Independent Test**: Input an unrecognized ingredient → verify Opik trace has `unrecognized_items` tag and metadata.

### Implementation for User Story 4

- [X] T011 [US4] Fix Opik trace update in `app/api/onboarding/story/process-input/route.ts` — ALREADY HANDLED by orchestration: `createInventoryManagerAgentProposal` internally adds `"unrecognized_items"` tag and `unrecognized` metadata when unrecognized items exist, plus "onboarding-story" provider tag for differentiation

**Checkpoint**: Observability gap fixed. Report for review.

---

## Phase 7: User Story 5 & 6 — App Page Buttons (Priority: P2)

**Goal**: Reset clears story localStorage. "Start Demo" renamed to "Start Onboarding" with client-only redirect.

**Independent Test**: Click "Reset user data" → verify story restarts from Scene 1. Click "Start Onboarding" → verify redirect to `/onboarding` with no API call.

### Implementation for User Stories 5 & 6

- [X] T012 [P] [US5] Add `homecuistot:story-onboarding` to localStorage cleanup in `components/app/ResetUserDataButton.tsx` — add `localStorage.removeItem('homecuistot:story-onboarding')` in the `handleReset` try block alongside existing removals
- [X] T013 [P] [US6] Remove StartDemoButton entirely — delete `components/app/StartDemoButton.tsx` and remove all imports/usage from `app/(protected)/app/page.tsx`

**Checkpoint**: All user stories complete. Report for review.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Verification, type-check, cleanup

- [ ] T014 Run `pnpm build` from `apps/nextjs/` to verify TypeScript compilation succeeds with all changes
- [ ] T015 Run quickstart.md manual testing flow end-to-end (full story, voice input with quantity words, DB verification, button tests)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (types must exist for backend to compile)
- **Phase 3 (US1)**: Depends on Phase 1 only (route swap doesn't need backend changes)
- **Phase 4 (US2)**: Depends on Phase 2 (needs updated agent + route)
- **Phase 5 (US3)**: Depends on Phase 2 (needs updated completion schema + prefillDemoData)
- **Phase 6 (US4)**: Depends on Phase 2 (modifies process-input route from T005)
- **Phase 7 (US5+US6)**: No dependencies on other phases (isolated button changes)
- **Phase 8 (Polish)**: Depends on all previous phases

### Parallel Opportunities

After Phase 2 completes:
- US1 (Phase 3), US2 (Phase 4), US3 (Phase 5), US4 (Phase 6), US5+US6 (Phase 7) can all run in parallel
- Within Phase 7: T012 and T013 can run in parallel (different files)
- Within Phase 1: T001 and T002 can run in parallel (different files)

### Task-Level Dependencies

```
T001, T002 (types) → T003, T004 (agent) → T005 (route) → T009 (Scene4), T011 (Opik)
T001, T002 (types) → T006 (prefill) → T007 (complete route) → T010 (Scene7)
T008 (route swap) — independent
T012, T013 (buttons) — independent
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Phase 1: Setup types (T001, T002)
2. Phase 3: Route swap (T008)
3. **STOP**: Story onboarding live at `/onboarding`

### Incremental Delivery

1. Phase 1 + Phase 2 → Backend ready
2. Phase 3 (US1) → Story at `/onboarding` ✅
3. Phase 4 (US2) → Quantity bug fixed ✅
4. Phase 5 (US3) → Correct persistence ✅
5. Phase 6 (US4) → Opik traces fixed ✅
6. Phase 7 (US5+US6) → Buttons updated ✅
7. Phase 8 → Build verification ✅

---

## Notes

- No new files created. All 11 files are modifications.
- No database migrations needed.
- Old onboarding code kept untouched per user request. Dead code list in plan.md.
- `api/onboarding/status/` usage by OnboardingGuard should be verified during Phase 3.
- User requested phase-by-phase reports for review.
