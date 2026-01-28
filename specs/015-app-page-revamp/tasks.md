# Tasks: App Page Revamp

**Input**: Design documents from `/specs/015-app-page-revamp/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested - manual testing for MVP per plan.md

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US6)
- All paths relative to `apps/nextjs/`

---

## Phase 1: Setup

**Purpose**: Project initialization and types

- [X] T001 [P] Create cooking-related types in src/types/cooking.ts (RecipeWithAvailability, CookingLogEntry, MarkCookedPayload, IngredientDiff)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Server actions and data layer shared by multiple user stories

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Create server action file src/app/actions/cooking-log.ts with getRecipesWithAvailability function
- [X] T003 Add getCookingHistory function to src/app/actions/cooking-log.ts (last 10 entries)
- [X] T004 Add markRecipeAsCooked server action to src/app/actions/cooking-log.ts (transaction: log + inventory update)

**Checkpoint**: Data layer ready - user story implementation can now begin

---

## Phase 3: User Story 4 - Redirect Non-Onboarded Users (Priority: P1)

**Goal**: Gate access to /app for users with no recipes AND no inventory

**Independent Test**: Log in as user with zero recipes + zero inventory → verify redirect to /onboarding

### Implementation for User Story 4

- [X] T005 [US4] Modify src/app/(protected)/app/layout.tsx to check recipe/inventory count
- [X] T006 [US4] Add redirect to /onboarding when both counts are zero in layout.tsx

**Checkpoint**: Non-onboarded users now redirected - core gate in place

---

## Phase 4: User Story 1 - View Available Recipes (Priority: P1) 🎯 MVP

**Goal**: Display recipes where all anchor ingredients are in stock

**Independent Test**: Create user with recipes + matching inventory → verify "Available Recipes" section shows correct recipes

### Implementation for User Story 1

- [X] T007 [P] [US1] Create RecipeAvailabilityCard component in src/components/app/recipe-availability-card.tsx
- [X] T008 [US1] Modify src/app/(protected)/app/page.tsx to fetch recipes with availability
- [X] T009 [US1] Add "Available Recipes" section to page.tsx using RecipeAvailabilityCard (variant="available")
- [X] T010 [US1] Add empty state message when no available recipes

**Checkpoint**: Users can see available recipes - core value proposition delivered

---

## Phase 5: User Story 3 - Mark Recipe as Cooked (Priority: P1)

**Goal**: Mark available recipe as cooked with inventory adjustment

**Independent Test**: Click "Mark as Cooked" on available recipe → verify modal shows diffs → save → verify cooking_log entry + inventory updates

### Implementation for User Story 3

- [X] T011 [P] [US3] Create MarkCookedModal component in src/components/app/mark-cooked-modal.tsx
- [X] T012 [US3] Add ingredient diff display with adjustable quantities to modal (tap to cycle 0-3)
- [X] T013 [US3] Connect MarkCookedModal to markRecipeAsCooked server action
- [X] T014 [US3] Add "Mark as Cooked" button to RecipeAvailabilityCard (available variant only)
- [X] T015 [US3] Add page revalidation after successful cook action

**Checkpoint**: Full cook cycle works - users can track what they cook

---

## Phase 6: User Story 2 - View Almost-Available Recipes (Priority: P2)

**Goal**: Display recipes missing 1-2 anchor ingredients

**Independent Test**: Create recipes missing 1-2 ingredients → verify "Almost Available" section shows them with missing ingredients listed

### Implementation for User Story 2

- [X] T016 [US2] Add "almost-available" variant to RecipeAvailabilityCard with missing ingredients display
- [X] T017 [US2] Add "Almost Available Recipes" section to page.tsx below available section
- [X] T018 [US2] Ensure recipes missing 3+ anchors are filtered out
- [X] T019 [US2] Add empty state message when no almost-available recipes

**Checkpoint**: Users can see what's close to being cookable

---

## Phase 7: User Story 5 - Navigate Between App Sections (Priority: P2)

**Goal**: Persistent navigation header across all /app routes

**Independent Test**: Visit each /app route → verify nav items visible and active state highlights correctly

### Implementation for User Story 5

- [X] T020 [P] [US5] Create AppNavigation component in src/components/app/app-navigation.tsx
- [X] T021 [US5] Implement usePathname-based active state highlighting
- [X] T022 [US5] Add AppNavigation to src/app/(protected)/app/layout.tsx

**Checkpoint**: Users can navigate between Main, Recipes, Inventory with one click

---

## Phase 8: User Story 6 - View Cooking History (Priority: P3)

**Goal**: Display last 10 cooking log entries in table format

**Independent Test**: Mark recipes as cooked → verify entries appear in "Cooking History" table at bottom of /app

### Implementation for User Story 6

- [X] T023 [P] [US6] Create CookingHistoryTable component in src/components/app/cooking-history-table.tsx
- [X] T024 [US6] Apply neo-brutalism styling to table (thick borders, bold fonts, no rounded corners)
- [X] T025 [US6] Add "Cooking History (Last 10)" section to page.tsx at bottom
- [X] T026 [US6] Add empty state message when no cooking history

**Checkpoint**: Users can see their recent cooking history

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases and final refinements

- [X] T027 [P] Handle edge case: recipe with no anchor ingredients (treat as available)
- [X] T028 [P] Handle edge case: quantity would go negative (floor at 0)
- [X] T029 [P] Handle edge case: recipe deleted mid-modal flow (graceful error)
- [ ] T030 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational completion
- **Polish (Phase 9)**: Depends on all user stories complete

### User Story Dependencies

- **US4 (Redirect)**: First P1 - gates access, can start after Foundational
- **US1 (Available)**: After US4 - core value, needs availability data
- **US3 (Mark Cooked)**: After US1 - needs available recipes to exist
- **US2 (Almost Available)**: After US1 - extends card component
- **US5 (Navigation)**: Independent of content stories - layout only
- **US6 (Cooking History)**: After US3 - needs cooking log entries to display

### MVP Path (Minimum Viable)

1. Phase 1: Setup (T001)
2. Phase 2: Foundational (T002-T004)
3. Phase 3: US4 Redirect (T005-T006)
4. Phase 4: US1 Available Recipes (T007-T010)
5. **STOP**: Test independently - users can see available recipes

### Parallel Opportunities

```bash
# Phase 1 + Phase 2 initial tasks:
T001 (types) can run parallel with T002 start

# Phase 4 + Phase 7 (different files):
T007 (RecipeAvailabilityCard) || T020 (AppNavigation)

# Phase 5 + Phase 8 (different files):
T011 (MarkCookedModal) || T023 (CookingHistoryTable)

# Phase 9 (all independent):
T027 || T028 || T029
```

---

## Implementation Strategy

### MVP First (Phase 1-4)

1. Complete Setup + Foundational
2. Add redirect gate (US4)
3. Add available recipes (US1)
4. **VALIDATE**: User with recipes/inventory sees available recipes
5. Deploy if needed

### Incremental Delivery

1. MVP → Add mark as cooked (US3) → Full cook cycle works
2. Add almost-available (US2) → Users see close-to-cookable recipes
3. Add navigation (US5) → Better UX across app
4. Add cooking history (US6) → Nice-to-have visibility
5. Polish → Edge cases handled

---

## Notes

- All components use neo-brutalism styling (thick borders, shadows, vibrant gradients)
- RecipeAvailabilityCard: green gradient for available, yellow/orange for almost-available
- Server action preferred over API route per research.md recommendation
- Quantity levels are 0-3; default decrement is max(0, current - 1)
- Pantry staples always considered "in stock" regardless of quantity
