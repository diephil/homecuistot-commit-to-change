# Tasks: Base Pages UI Foundation

**Input**: Design documents from `/specs/003-base-pages-ui/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not included - manual visual testing only per spec constraints

**Organization**: Tasks grouped by user story to enable independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Next.js 16 app router structure in `apps/nextjs/`:
- Public pages: `src/app/page.tsx`, `src/app/(auth)/*/page.tsx`
- Protected pages: `src/app/(protected)/*/page.tsx`
- Components: `src/components/ui/`
- Icons: `public/icons/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install RetroUI components and configure project for neo-brutalist UI

- [ ] T001 Install RetroUI Badge component from shadcn registry in apps/nextjs
- [ ] T002 [P] Install RetroUI Card component from shadcn registry in apps/nextjs
- [ ] T003 [P] Install RetroUI Button component from shadcn registry in apps/nextjs
- [ ] T004 [P] Install lucide-react for icons in apps/nextjs
- [ ] T005 Create route group directory apps/nextjs/src/app/(auth) for public pages
- [ ] T006 Create route group directory apps/nextjs/src/app/(protected) for protected pages
- [ ] T007 [P] Create icons directory apps/nextjs/public/icons

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 Verify TypeScript strict mode enabled in apps/nextjs/tsconfig.json
- [ ] T009 Verify Tailwind CSS v4 configured with truncate, flex-wrap utilities in apps/nextjs/tailwind.config.ts
- [ ] T010 Verify Next.js 16 app router working with `pnpm dev` in apps/nextjs
- [ ] T011 Create placeholder microphone icon SVG in apps/nextjs/public/icons/microphone.svg
- [ ] T012 Create placeholder empty plate icon SVG in apps/nextjs/public/icons/empty-plate.svg

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - First Time Visitor Exploration (Priority: P1) 🎯 MVP

**Goal**: Landing page with logo, hero, origin/problem, how-it-works sections - responsive layout

**Independent Test**: Navigate to `/` and verify logo, title "Home Cuistot", sign-up/login CTAs, hero section, origin/problem section, how-it-works section all visible in order; test responsive layout 320px-1920px with no horizontal scroll

### Implementation for User Story 1

- [ ] T013 [US1] Create landing page at apps/nextjs/src/app/page.tsx with logo and "Home Cuistot" title
- [ ] T014 [US1] Add sign-up/login CTAs at top of landing page using RetroUI Button components
- [ ] T015 [US1] Add hero section with headline to landing page
- [ ] T016 [US1] Add origin/problem section to landing page
- [ ] T017 [US1] Add how-it-works section to landing page
- [ ] T018 [US1] Apply responsive Tailwind classes to ensure no horizontal scroll 320px-1920px
- [ ] T019 [US1] Create login page at apps/nextjs/src/app/(auth)/login/page.tsx with Google/Discord OAuth CTAs using RetroUI Button

**Checkpoint**: Landing and login pages fully functional - can navigate and view all sections responsively

---

## Phase 4: User Story 2 - Onboarding Journey Visualization (Priority: P2)

**Goal**: Single-route 3-step onboarding with sliding transitions, badge selection, microphone placeholder

**Independent Test**: Navigate to `/onboarding`, verify step 1 (welcome + "Start Onboarding" CTA), click to advance to step 2 (3 sections with badge buttons, continue/clear CTAs), click to advance to step 3 (summary + microphone + "Finish Onboarding"); verify sliding animation without URL changes

### Implementation for User Story 2

- [ ] T020 [P] [US2] Define MOCK_DISHES constant (7 items with id, name, isSelected) at top of apps/nextjs/src/app/(protected)/onboarding/page.tsx
- [ ] T021 [P] [US2] Define MOCK_FRIDGE_INGREDIENTS constant (7 items) at top of apps/nextjs/src/app/(protected)/onboarding/page.tsx
- [ ] T022 [P] [US2] Define MOCK_PANTRY_INGREDIENTS constant (7 items) at top of apps/nextjs/src/app/(protected)/onboarding/page.tsx
- [ ] T023 [US2] Create onboarding page at apps/nextjs/src/app/(protected)/onboarding/page.tsx with useState for currentStep (1-3)
- [ ] T024 [US2] Implement Step 1 content: welcome message, voice authorization note, "Start Onboarding" CTA using RetroUI Button
- [ ] T025 [US2] Implement Step 2 content: three sections (dishes, fridge, pantry) with badge-style buttons using RetroUI Badge with flex-wrap layout
- [ ] T026 [US2] Add continue/clear CTAs at bottom of Step 2 using RetroUI Button
- [ ] T027 [US2] Implement Step 3 content: summary of selected items grouped as "Ingredients", microphone icon + "Tap to speak" text, "Finish Onboarding" button
- [ ] T028 [US2] Implement sliding transition with CSS transform translateX based on currentStep state (FR-015)
- [ ] T029 [US2] Apply text truncation (truncate class) to badge text for long ingredient/dish names

**Checkpoint**: Onboarding page complete with 3 steps, sliding transitions, mock data, responsive badge wrapping

---

## Phase 5: User Story 3 - Main App Navigation Structure (Priority: P3)

**Goal**: Suggestions, Inventory, and Recipes pages with mock data, recipe cards, ingredient lists, navigation

**Independent Test**: Navigate to `/suggestions` (verify available/almost-available sections + navigation CTAs), `/inventory` (verify ingredient list with quantity levels + microphone CTA), `/recipes` (verify recipe cards grid + "Add new recipe" card)

### Implementation for User Story 3

#### Suggestions Page

- [ ] T030 [P] [US3] Define MOCK_RECIPES constant (8 items with id, title, description, ingredients, isAvailable) at top of apps/nextjs/src/app/(protected)/suggestions/page.tsx
- [ ] T031 [US3] Create suggestions page at apps/nextjs/src/app/(protected)/suggestions/page.tsx
- [ ] T032 [US3] Implement "Available Recipes" section filtering MOCK_RECIPES where isAvailable=true, display with RetroUI Card
- [ ] T033 [US3] Implement "Almost Available Recipes" section filtering MOCK_RECIPES where isAvailable=false, display with RetroUI Card
- [ ] T034 [US3] Add "Mark as Cooked" CTA per recipe using RetroUI Button (visual only, no handler)
- [ ] T035 [US3] Add navigation CTAs to /inventory and /recipes using RetroUI Button variant="link"
- [ ] T036 [US3] Apply text truncation (truncate class) to recipe titles

#### Inventory Page

- [ ] T037 [P] [US3] Define MOCK_FRIDGE_INGREDIENTS constant (7 items) at top of apps/nextjs/src/app/(protected)/inventory/page.tsx
- [ ] T038 [P] [US3] Define MOCK_PANTRY_INGREDIENTS constant (7 items) at top of apps/nextjs/src/app/(protected)/inventory/page.tsx
- [ ] T039 [US3] Create inventory page at apps/nextjs/src/app/(protected)/inventory/page.tsx
- [ ] T040 [US3] Implement ingredient list displaying name and quantityLevel (0-3) using native ul/li with Tailwind styling
- [ ] T041 [US3] Add instructions text for editing quantities by tapping (visual only, no interaction)
- [ ] T042 [US3] Add microphone icon + "Tap to speak" text using lucide-react Mic icon and RetroUI Button
- [ ] T043 [US3] Apply text truncation (truncate class) to ingredient names

#### Recipes Page

- [ ] T044 [P] [US3] Define MOCK_RECIPES constant (8 items) at top of apps/nextjs/src/app/(protected)/recipes/page.tsx
- [ ] T045 [US3] Create recipes page at apps/nextjs/src/app/(protected)/recipes/page.tsx
- [ ] T046 [US3] Implement recipe cards grid using RetroUI Card displaying title, description, ingredient list preview
- [ ] T047 [US3] Add "Add a new recipe" card with CTA using RetroUI Card and Button
- [ ] T048 [US3] Add edit/delete/"mark as cooked" CTAs per recipe using RetroUI Button (visual only, no handlers)
- [ ] T049 [US3] Apply text truncation (truncate class) to recipe titles in cards
- [ ] T050 [US3] Apply responsive grid layout (3 columns desktop, 2 tablet, 1 mobile) using Tailwind grid utilities

**Checkpoint**: All 3 main app pages complete with mock data, navigation, responsive layouts

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Empty states and final visual polish affecting multiple pages

- [ ] T051 [P] Implement empty state component for recipes: text "No recipes yet" + empty-plate icon in suggestions page (when MOCK_RECIPES=[])
- [ ] T052 [P] Implement empty state component for ingredients: text "No ingredients yet" + icon in inventory page (when MOCK_*_INGREDIENTS=[])
- [ ] T053 [P] Implement empty state component for recipes in recipes page (when MOCK_RECIPES=[])
- [ ] T054 Verify all pages responsive 320px-1920px: test landing, login, onboarding steps 1-3, suggestions, inventory, recipes
- [ ] T055 Verify text truncation on all long names: test recipe titles, ingredient names, dish names with 50+ char strings
- [ ] T056 Verify badge wrapping on narrow screens: test onboarding step 2 at 320px width
- [ ] T057 Run quickstart.md visual verification checklist for all 6 routes
- [ ] T058 Verify TypeScript compilation succeeds with no errors: `pnpm build` in apps/nextjs
- [ ] T059 Verify pages load <2s: test with browser DevTools Network tab on throttled connection

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - US1 (Landing/Login) → US2 (Onboarding) → US3 (Main App) (sequential in priority order)
  - OR US1, US2, US3 can be developed in parallel if team capacity allows
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - Independent of US1 (different routes)
- **User Story 3 (P3)**: Can start after Foundational - Independent of US1/US2 (different routes)

### Within Each User Story

- Mock data constants (T020-T022, T030, T037-T038, T044) MUST be defined before page implementation
- Page creation tasks before content implementation
- Core implementation before responsive polish
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 (Setup)**: T002, T003, T004, T007 can run in parallel (different components/directories)
- **Phase 2 (Foundational)**: T011, T012 can run in parallel (different icon files)
- **Phase 4 (US2)**: T020, T021, T022 can run in parallel (different mock data constants)
- **Phase 5 (US3)**:
  - T030 (suggestions mock data) in parallel with T037-T038 (inventory mock data) and T044 (recipes mock data)
  - Within suggestions: T032, T033 can run after T031
  - Within inventory: T037-T038 in parallel
  - Within recipes: T046, T047 can run after T045
- **Phase 6 (Polish)**: T051, T052, T053 can run in parallel (different pages)
- **User Stories**: US1, US2, US3 can be developed in parallel by different team members after Foundational phase

---

## Parallel Example: User Story 2

```bash
# Launch all mock data constants for US2 together:
Task: "Define MOCK_DISHES constant at top of apps/nextjs/src/app/(protected)/onboarding/page.tsx"
Task: "Define MOCK_FRIDGE_INGREDIENTS constant at top of apps/nextjs/src/app/(protected)/onboarding/page.tsx"
Task: "Define MOCK_PANTRY_INGREDIENTS constant at top of apps/nextjs/src/app/(protected)/onboarding/page.tsx"
```

## Parallel Example: User Story 3

```bash
# Launch all page-specific mock data together:
Task: "Define MOCK_RECIPES constant at top of apps/nextjs/src/app/(protected)/suggestions/page.tsx"
Task: "Define MOCK_FRIDGE_INGREDIENTS constant at top of apps/nextjs/src/app/(protected)/inventory/page.tsx"
Task: "Define MOCK_PANTRY_INGREDIENTS constant at top of apps/nextjs/src/app/(protected)/inventory/page.tsx"
Task: "Define MOCK_RECIPES constant at top of apps/nextjs/src/app/(protected)/recipes/page.tsx"

# Launch all empty state components together (Phase 6):
Task: "Implement empty state component for recipes in suggestions page"
Task: "Implement empty state component for ingredients in inventory page"
Task: "Implement empty state component for recipes in recipes page"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T012) - CRITICAL
3. Complete Phase 3: User Story 1 (T013-T019)
4. **STOP and VALIDATE**: Test landing + login pages independently
5. Deploy/demo if ready (minimal viable product)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Landing/Login) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Onboarding) → Test independently → Deploy/Demo
4. Add User Story 3 (Main App) → Test independently → Deploy/Demo
5. Add Polish (Empty states) → Final verification → Production-ready

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T012)
2. Once Foundational is done:
   - Developer A: User Story 1 (T013-T019)
   - Developer B: User Story 2 (T020-T029)
   - Developer C: User Story 3 (T030-T050)
3. Stories complete and integrate independently (different routes, no conflicts)
4. Final phase: Team completes Polish together (T051-T059)

---

## Task Summary

**Total Tasks**: 59
- **Phase 1 (Setup)**: 7 tasks
- **Phase 2 (Foundational)**: 5 tasks
- **Phase 3 (US1 - Landing/Login)**: 7 tasks
- **Phase 4 (US2 - Onboarding)**: 10 tasks
- **Phase 5 (US3 - Main App)**: 21 tasks (7 suggestions + 7 inventory + 7 recipes)
- **Phase 6 (Polish)**: 9 tasks

**Parallel Opportunities**: 19 tasks marked [P] (32% parallelizable)

**Independent Test Criteria**:
- **US1**: Navigate to `/` and `/login`, verify all visual sections present, responsive layout works
- **US2**: Navigate to `/onboarding`, verify 3 steps with sliding transitions, badge wrapping, mock data displays
- **US3**: Navigate to `/suggestions`, `/inventory`, `/recipes`, verify all sections, mock data, navigation, responsive grids

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 19 tasks
- Delivers landing + login pages as proof-of-concept
- Validates RetroUI integration, responsive layout, neo-brutalist design
- Foundation for subsequent stories

---

## Notes

- [P] tasks = different files or independent components, no dependencies
- [US*] label maps task to specific user story for traceability
- Each user story independently completable and testable
- No automated tests - manual visual verification per quickstart.md checklist
- Mock data declared as `as const` at top of page.tsx files for type safety
- Commit after each task or logical group of parallel tasks
- Stop at any checkpoint to validate story independently
- Avoid: cross-story dependencies, same-file conflicts, state mutations (visual-only constraint)
