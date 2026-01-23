# Tasks: Route Restructuring and Admin Access

**Input**: Design documents from `/specs/006-admin-dashboard/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No test tasks included (not requested in specification). Manual testing acceptable for MVP.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

All paths relative to `apps/nextjs/` directory:
- Route groups: `src/app/(group)/`
- Middleware: `src/middleware.ts`
- Components: `src/components/`
- Utilities: `src/utils/`

---

## Phase 1: Setup (Environment & Project Initialization)

**Purpose**: Configure environment and validate existing project structure

- [X] T001 Add ADMIN_USER_IDS to apps/nextjs/.env.local (obtain from Supabase Auth dashboard)
- [X] T002 [P] Verify existing Supabase Auth configuration in apps/nextjs/.env.local
- [X] T003 [P] Confirm Next.js 16, React 19, TypeScript 5 installed via apps/nextjs/package.json
- [X] T004 Test existing auth flow (login/logout) to ensure no regressions

**Checkpoint**: Environment configured - route migration can begin

---

## Phase 2: Foundational (Middleware & Core Infrastructure)

**Purpose**: Core authentication and routing infrastructure that MUST be complete before user stories

**⚠️ CRITICAL**: No user story work can begin until middleware is complete

- [X] T005 Create apps/nextjs/src/middleware.ts with Supabase client setup
- [X] T006 Implement admin route protection logic in middleware (check /admin/* paths)
- [X] T007 Implement protected app route authentication in middleware (check /app/* paths)
- [X] T008 Configure middleware matcher to include /admin/*, /app/* paths
- [X] T009 Test middleware redirects: unauthenticated → /login, non-admin → /unauthorized

**Checkpoint**: Middleware active - all routes protected, user stories can proceed

---

## Phase 3: User Story 1 - Route Restructuring (Priority: P1) 🎯 MVP

**Goal**: Migrate all application pages to /app/* route structure with updated navigation links

**Independent Test**: Navigate to /app/onboarding, /app/inventory, /app/recipes, /app/suggestions - all pages load correctly with authenticated user. Old URLs (/onboarding) return 404.

### Implementation for User Story 1

- [X] T010 [P] [US1] Create apps/nextjs/src/app/(app)/layout.tsx (App-specific layout wrapper)
- [X] T011 [P] [US1] Create apps/nextjs/src/app/(app)/onboarding/ directory
- [X] T012 [US1] Copy apps/nextjs/src/app/(protected)/onboarding/page.tsx to (app)/onboarding/page.tsx
- [X] T013 [P] [US1] Create apps/nextjs/src/app/(app)/inventory/ directory
- [X] T014 [US1] Copy apps/nextjs/src/app/(protected)/inventory/page.tsx to (app)/inventory/page.tsx
- [X] T015 [P] [US1] Create apps/nextjs/src/app/(app)/recipes/ directory
- [X] T016 [US1] Copy apps/nextjs/src/app/(protected)/recipes/page.tsx to (app)/recipes/page.tsx
- [X] T017 [P] [US1] Create apps/nextjs/src/app/(app)/suggestions/ directory
- [X] T018 [US1] Copy apps/nextjs/src/app/(protected)/suggestions/page.tsx to (app)/suggestions/page.tsx
- [X] T019 [US1] Update navigation links in (app)/suggestions/page.tsx: href="/inventory" → href="/app/inventory"
- [X] T020 [US1] Update navigation links in (app)/suggestions/page.tsx: href="/recipes" → href="/app/recipes"
- [X] T021 [US1] Update router.push("/suggestions") to router.push("/app/suggestions") in (app)/onboarding/page.tsx
- [X] T022 [US1] Update OAuth redirect in (auth)/login/page.tsx: next=/onboarding → next=/app/onboarding
- [X] T023 [US1] Verify all /app/* pages render correctly for authenticated users
- [X] T024 [US1] Verify old URLs (/onboarding, /inventory, etc.) return 404 as expected

**Checkpoint**: User Story 1 complete - all pages accessible at /app/*, navigation updated, old URLs removed

---

## Phase 4: User Story 2 - Admin Access Control (Priority: P2)

**Goal**: Restrict /admin route to authorized admin user only, show 404 to unauthorized users

**Independent Test**: Admin user (ID matching ADMIN_USER_IDS) navigates to /admin → sees page. Non-admin user navigates to /admin → sees 404 page (URL unchanged). Unauthenticated user → redirected to /login?redirect=/admin.

### Implementation for User Story 2

- [X] T025 [P] [US2] Create apps/nextjs/src/app/admin/layout.tsx (Admin-specific layout)
- [X] T026 [P] [US2] Create apps/nextjs/src/app/not-found.tsx for custom 404 page
- [X] T027 [US2] Implement 404 page with neobrutalism design (yellow/orange gradient, thick borders)
- [X] T028 [US2] Add 404 page content: "404 - Not Found" heading, "There's nothing to find here" message
- [X] T029 [US2] Add "Back to Home" link to 404 page with shadow hover effects
- [X] T030 [US2] Test proxy admin check: verify ADMIN_USER_IDS comparison logic
- [X] T031 [US2] Test 404 rewrite: non-admin authenticated user → sees 404 (URL unchanged)
- [X] T032 [US2] Test login redirect: unauthenticated user at /admin → /login?redirect=/admin
- [X] T033 [US2] Verify admin user can access /admin (will show 404 until US3 complete - expected)

**Checkpoint**: User Story 2 complete - /admin route protected, unauthorized page functional

---

## Phase 5: User Story 3 - Admin Placeholder Page (Priority: P3)

**Goal**: Create admin dashboard landing page with vibrant neobrutalism design

**Independent Test**: Admin user navigates to /admin → sees placeholder dashboard with pink gradient, thick borders, "Coming Soon" features list.

### Implementation for User Story 3

- [X] T034 [US3] Create apps/nextjs/src/app/(admin)/page.tsx for admin dashboard placeholder
- [X] T035 [US3] Implement dashboard header: text-3xl md:text-6xl, font-black, uppercase "Admin Dashboard"
- [X] T036 [US3] Add main content card: border-4 md:border-6, bg-gradient-to-br from-pink-200 to-pink-300
- [X] T037 [US3] Apply neobrutalism shadows: shadow-[6px_6px] md:shadow-[8px_8px] with rgba(0,0,0,1)
- [X] T038 [US3] Add "Coming Soon" section with feature list (system analytics, config management, user management, content admin)
- [X] T039 [US3] Implement mobile-first responsive design (smaller borders/shadows on mobile, no rotations)
- [X] T040 [US3] Test admin dashboard renders correctly for admin user
- [X] T041 [US3] Verify neobrutalism styling: thick black borders, vibrant gradients, bold fonts

**Checkpoint**: All user stories complete - full feature functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and optional cleanup

- [X] T042 [P] Run TypeScript compilation check: `cd apps/nextjs && npx tsc --noEmit`
- [X] T043 [P] Verify all existing pages function under new /app/* structure (manual browser testing)
- [X] T044 [P] Test landing page / remains accessible without authentication
- [X] T045 Search for any remaining old URL references: `grep -r "href=\"/onboarding" apps/nextjs/src/`
- [X] T046 Search for remaining router.push old URLs: `grep -r "router.push(\"/inventory" apps/nextjs/src/`
- [X] T047 (Optional) Remove old (protected) route group: `rm -rf apps/nextjs/src/app/(protected)` (defer to follow-up PR if preferred)
- [X] T048 Build production bundle to verify no errors: `cd apps/nextjs && pnpm build`
- [X] T049 Run quickstart.md manual test checklist (all checkboxes from quickstart.md)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) completion
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) completion - Can run in parallel with US1 if multi-developer team
- **User Story 3 (Phase 5)**: Depends on User Story 2 (Phase 4) completion (needs /admin route protection active)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on Foundational (Phase 2) - Independent of US1 (can parallelize)
- **User Story 3 (P3)**: Depends on US2 completion (needs protected /admin route)

### Within Each User Story

**User Story 1**:
- T010-T011 (Create directories) can run in parallel
- T012-T018 (Copy pages) are sequential within each page but parallelizable across pages
- T019-T022 (Update navigation) sequential (depends on copies)
- T023-T024 (Verification) sequential (depends on all updates)

**User Story 2**:
- T025-T026 (Create directories) can run in parallel
- T027-T029 (Unauthorized page) sequential
- T030-T033 (Testing) sequential

**User Story 3**:
- T034-T038 (Dashboard implementation) sequential (same file)
- T039-T041 (Testing) sequential

### Parallel Opportunities

- **Within Phase 1**: T002 and T003 can run in parallel (different checks)
- **Within Phase 3 (US1)**: T011, T013, T015, T017 (directory creation) can all run in parallel
- **Within Phase 3 (US1)**: T019 and T020 can run in parallel (different link types in same file)
- **Between User Stories**: US1 and US2 can be worked on in parallel by different developers (after Phase 2 completes)
- **Within Phase 6**: T042, T043, T044 can run in parallel (independent verification tasks)

---

## Parallel Example: User Story 1 Directory Setup

```bash
# Launch all directory creation tasks for US1 together:
Task T011: "Create apps/nextjs/src/app/(app)/onboarding/ directory"
Task T013: "Create apps/nextjs/src/app/(app)/inventory/ directory"
Task T015: "Create apps/nextjs/src/app/(app)/recipes/ directory"
Task T017: "Create apps/nextjs/src/app/(app)/suggestions/ directory"

# Then copy pages in parallel:
Task T012: "Copy (protected)/onboarding/page.tsx to (app)/onboarding/page.tsx"
Task T014: "Copy (protected)/inventory/page.tsx to (app)/inventory/page.tsx"
Task T016: "Copy (protected)/recipes/page.tsx to (app)/recipes/page.tsx"
Task T018: "Copy (protected)/suggestions/page.tsx to (app)/suggestions/page.tsx"
```

---

## Parallel Example: US1 and US2 (Multi-Developer Team)

```bash
# After Phase 2 (Foundational) completes, two developers can work in parallel:

Developer A (US1 - Route Restructuring):
Task T010-T024: "Complete all route migration and navigation updates"

Developer B (US2 - Admin Access Control):
Task T025-T033: "Complete admin protection and unauthorized page"

# US3 waits for US2 to complete (needs protected /admin route)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T009) - **CRITICAL BLOCKER**
3. Complete Phase 3: User Story 1 (T010-T024)
4. **STOP and VALIDATE**: Test all /app/* routes work, old URLs 404
5. Deploy/demo if ready (MVP functional!)

**Result**: Users can access all application features under /app/* structure

### Incremental Delivery (Recommended)

1. Complete Phase 1 + Phase 2 → Foundation ready
2. Complete Phase 3 (US1) → Test independently → Deploy (MVP!)
3. Complete Phase 4 (US2) → Test independently → Deploy (admin protection added)
4. Complete Phase 5 (US3) → Test independently → Deploy (admin dashboard visible)
5. Complete Phase 6 → Production-ready release

**Result**: Each phase adds value without breaking previous functionality

### Parallel Team Strategy (2-3 Developers)

With multiple developers:

1. All developers complete Phase 1 + Phase 2 together
2. Once Phase 2 done:
   - Developer A: Phase 3 (US1 - Route restructuring)
   - Developer B: Phase 4 (US2 - Admin access control)
3. After US2 completes:
   - Developer B: Phase 5 (US3 - Admin placeholder page)
4. All developers: Phase 6 (Polish & verification)

**Result**: US1 and US2 complete in parallel, reducing total time by ~30%

---

## Notes

- [P] tasks = different files or independent operations, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each logical group of tasks (e.g., after completing all page copies)
- Stop at any checkpoint to validate story independently before proceeding
- No test tasks included (manual testing acceptable per MVP constitution)
- Navigation link updates (T019-T022) are CRITICAL - missing these causes poor UX with 404 errors
- Old (protected) route group can remain temporarily for safety (removal optional in T047)
- Admin user ID must be obtained from Supabase Auth dashboard before starting (T001)

---

## Task Count Summary

- **Total Tasks**: 49
- **Phase 1 (Setup)**: 4 tasks
- **Phase 2 (Foundational)**: 5 tasks (BLOCKER)
- **Phase 3 (US1)**: 15 tasks
- **Phase 4 (US2)**: 9 tasks
- **Phase 5 (US3)**: 8 tasks
- **Phase 6 (Polish)**: 8 tasks

**Parallel Opportunities**: 13 tasks marked [P] for parallelization
**MVP Scope**: Phase 1-3 (24 tasks) delivers functional route migration
**Full Feature**: All 49 tasks delivers complete admin access system

**Estimated Completion**:
- MVP (US1 only): 2-2.5 hours
- MVP + Admin (US1-US2): 2.5-3 hours
- Full Feature (US1-US3): 3-3.5 hours
