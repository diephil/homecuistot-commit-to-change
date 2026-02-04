# Tasks: Admin Unrecognized Ingredient Promotion

**Input**: Design documents from `/specs/023-admin-ingredient-promotion/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/admin-api.md, contracts/opik-api.md, quickstart.md

**Tests**: Manual testing only (MVP phase per constitution). No automated test tasks.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Exact file paths included in descriptions

## Path Conventions

- **Monorepo base**: `apps/nextjs/src/`
- **Pages**: `apps/nextjs/src/app/(admin)/admin/`
- **API routes**: `apps/nextjs/src/app/api/admin/`
- **Services**: `apps/nextjs/src/lib/services/`
- **DB**: `apps/nextjs/src/db/`

---

## Phase 1: Setup

**Purpose**: Branch and directory structure

- [X] T001 Create feature branch `023-admin-ingredient-promotion` from `main`
- [X] T002 Create directory structure: `app/api/admin/spans/next/`, `app/api/admin/spans/mark-reviewed/`, `app/api/admin/ingredients/promote/`, `app/(admin)/admin/unrecognized/`
- [X] T003 [P] Add `OPIK_WORKSPACE=philippe-diep` to `apps/nextjs/.env.prod` (after `OPIK_API_KEY` line). Add `OPIK_WORKSPACE=` (empty) to `apps/nextjs/.env.local` for local dev (no workspace needed for self-hosted Opik)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Opik service layer and admin auth helper — MUST complete before any user story

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [US-INFRA] Create Opik REST API service at `apps/nextjs/src/lib/services/opik-spans.ts` with types (`OpikSpan`, `SearchSpansResponse`), `getOpikHeaders()` for auth (local: no headers, production: `authorization` from `OPIK_API_KEY` + `Comet-Workspace` from `OPIK_WORKSPACE` — no Bearer prefix), `getNextUnprocessedSpan()` (POST search with `unrecognized_items` / NOT `promotion_reviewed` filters, limit 1), `getSpanById({ spanId })` (GET by ID), and `markSpanAsReviewed({ spanId })` (GET-then-PATCH: re-fetch span, append `promotion_reviewed` to current tags, PATCH with trace_id). Ref: contracts/opik-api.md, research.md §1
- [X] T005 [P] [US-INFRA] Create admin auth helper — extract repeatable auth check pattern (verify session via `createClient()` + check `user.id` against `ADMIN_USER_IDS` env var) to reuse across all 3 API routes. Return `{ user }` or `NextResponse` 401. Ref: research.md §3

**Checkpoint**: Opik service and auth helper ready. User story implementation can begin.

---

## Phase 3: US1 + US2 — Admin Welcome Page + Header Navigation (Priority: P1)

**Goal**: Replace `/admin` placeholder with welcome page listing features. Add header nav with "Unrecognized Items" tab and "Go To App" CTA. Create reusable admin components first, then use them in pages.

**Independent Test**: Navigate to `/admin` → see welcome page with feature card linking to `/admin/unrecognized`. Header shows nav links and "Go To App" CTA on all admin pages.

### Implementation

- [X] T006 [US1+US2] Create reusable admin components in `apps/nextjs/src/components/admin/` — `AdminNavLink.tsx` (nav link with active state highlighting, neobrutalist styling: bold border, yellow bg when active, white bg default), `AdminFeatureCard.tsx` (clickable card linking to a feature page, gradient bg, thick borders, shadow offset, hover effect). Export via `components/admin/index.ts`. All components follow Vibrant Neobrutalism design (constitution VII). Ref: spec.md FR-019, FR-020
- [X] T007 [P] [US1] Modify `apps/nextjs/src/app/(admin)/admin/page.tsx` — replace placeholder "Demo In Progress" with welcome page: hero section with title, use `AdminFeatureCard` for "Review Unrecognized Items" linking to `/admin/unrecognized`, "Coming Soon" section. Neobrutalist styling. Ref: quickstart.md Phase 4
- [X] T008 [P] [US2] Modify `apps/nextjs/src/app/(admin)/admin/layout.tsx` — add navigation bar below title row using `AdminNavLink` for "Unrecognized Items" (`/admin/unrecognized`). Add "Go To App" CTA linking to `/app` (cyan bg, neobrutalist shadow). Keep existing `LogoutButton`. Ref: quickstart.md Phase 3

**Checkpoint**: Admin welcome page and header navigation functional. Admin can navigate between `/admin`, `/admin/unrecognized`, and `/app`.

---

## Phase 4: US3 — Load and Display Unrecognized Ingredients (Priority: P2)

**Goal**: CTA-triggered span loading on `/admin/unrecognized`. Backend fetches span from Opik, deduplicates items, filters against DB, returns cleaned list.

**Independent Test**: Click "Load Next Span" CTA → system fetches most recent unprocessed span → displays deduplicated, DB-filtered ingredient names. Shows "no more spans" if none remain.

### Implementation

- [ ] T009 [US3] Create reusable review components in `apps/nextjs/src/components/admin/` — `ItemReviewRow.tsx` (displays ingredient name + category dropdown + dismiss "X" button, neobrutalist styling), `CategorySelect.tsx` (styled `<select>` with all 30 ingredient categories, defaults to `non_classified`, bold border). Export via `components/admin/index.ts`. Ref: spec.md FR-011, FR-019, FR-020
- [ ] T010 [US3] Create API route `apps/nextjs/src/app/api/admin/spans/next/route.ts` — GET handler: admin auth check (T005), call `getNextUnprocessedSpan()` (T004), extract `metadata.unrecognized[]`, deduplicate (case-insensitive), query `adminDb` for existing ingredients (`LOWER(name) IN (...)`), filter out existing, return `{ spanId, traceId, items[], totalInSpan }` or `{ spanId: null, items: [], totalInSpan: 0 }` if no spans. Ref: contracts/admin-api.md §GET /api/admin/spans/next, data-model.md Workflow 1
- [ ] T011 [US3] Create unrecognized items page `apps/nextjs/src/app/(admin)/admin/unrecognized/page.tsx` — `'use client'` component with states: `loadedSpan`, `promotions`, `isLoading`, `error`. Initial render: CTA button "Load Next Span". On click: fetch `/api/admin/spans/next`, display items list using `ItemReviewRow` + `CategorySelect` components. Show "no more spans" message when `spanId` is null. Neobrutalist styling. Ref: quickstart.md Phase 5, spec.md FR-006 through FR-010

**Checkpoint**: Admin can load and view unrecognized ingredients from Opik spans.

---

## Phase 5: US4 — Promote Ingredients with Category (Priority: P3)

**Goal**: Admin assigns categories and promotes ingredients to DB. Span tagged as reviewed.

**Independent Test**: Select categories → click "Promote" → ingredients appear in DB with correct category → span tagged `promotion_reviewed` in Opik → toast confirms count.

### Implementation

- [ ] T012 [US4] Create API route `apps/nextjs/src/app/api/admin/ingredients/promote/route.ts` — POST handler: admin auth check, Zod validation (`spanId: uuid, promotions: [{name: string, category: IngredientCategory}]`), validate categories against 30-item enum, batch insert via `adminDb.insert(ingredients).values(...).onConflictDoNothing()` (lowercase names), call `markSpanAsReviewed({ spanId })` (GET-then-PATCH), return `{ promoted, skipped, spanTagged }`. Ref: contracts/admin-api.md §POST /api/admin/ingredients/promote, data-model.md Workflow 2
- [ ] T013 [US4] Add promote functionality to `apps/nextjs/src/app/(admin)/admin/unrecognized/page.tsx` — "Promote" button: collects `promotions[]` from state, POST to `/api/admin/ingredients/promote` with `{ spanId, promotions }`, show toast with promoted/skipped counts, reset state for next span. Disable button when no items remain. Ref: spec.md US4 acceptance scenarios

**Checkpoint**: Full promote workflow functional. Ingredients enter DB, spans get tagged.

---

## Phase 6: US5 — Skip/Dismiss Non-Ingredients (Priority: P4)

**Goal**: Admin can dismiss individual items or all items without promoting. Span still tagged as reviewed.

**Independent Test**: Click dismiss on an item → removed from review list. Click "Dismiss All" → span tagged reviewed without any DB inserts.

### Implementation

- [ ] T014 [US5] Create API route `apps/nextjs/src/app/api/admin/spans/mark-reviewed/route.ts` — POST handler: admin auth check, Zod validation (`spanId: uuid`), call `markSpanAsReviewed({ spanId })` (GET-then-PATCH), return `{ spanTagged }`. Ref: contracts/admin-api.md §POST /api/admin/spans/mark-reviewed, data-model.md Workflow 3
- [ ] T015 [US5] Add dismiss functionality to `apps/nextjs/src/app/(admin)/admin/unrecognized/page.tsx` — per-item "X" button removes item from `promotions` state. "Dismiss All" button: confirm dialog, POST to `/api/admin/spans/mark-reviewed` with `{ spanId }`, reset state. Ref: spec.md US5 acceptance scenarios

**Checkpoint**: Admin can dismiss items individually or in bulk. Span lifecycle complete.

---

## Phase 7: US6 — Load Next Span (Priority: P5)

**Goal**: After finishing a span review, CTA to load next unprocessed span.

**Independent Test**: After promote or dismiss-all, "Load Next Span" CTA appears. Click → next span loads. If none remain, "no more spans" message.

### Implementation

- [ ] T016 [US6] Add "Load Next Span" CTA to `apps/nextjs/src/app/(admin)/admin/unrecognized/page.tsx` — after successful promote or dismiss-all (state reset, `loadedSpan` is null), show "Load Next Span" CTA (reuse `handleLoadSpan`). Show completion message when API returns `spanId: null`. Ref: spec.md US6 acceptance scenarios, FR-015, FR-016

**Checkpoint**: Sequential span processing fully functional. Admin can process 20+ spans in a single session.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, edge cases, UX refinements

- [ ] T017 [P] Error handling audit — verify all 3 API routes return proper HTTP status codes (400/401/500) with error messages per contracts/admin-api.md §Error Handling
- [ ] T018 [P] Loading states — verify all async operations show loading indicators (disable buttons, show "Loading..." / "Processing..." text) per quickstart.md UI patterns
- [ ] T019 Edge case: malformed span metadata — if `metadata.unrecognized` is missing or not an array, skip span and log warning. Ref: spec.md Edge Cases
- [ ] T020 Manual testing pass — run through quickstart.md Testing Guide checklist: Opik connectivity, all 3 API routes via curl, full UI workflow (load → promote → next, load → dismiss → next, empty queue)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1+US2)**: Depends on Phase 2 — layout/nav only, no API dependency
- **Phase 4 (US3)**: Depends on Phase 2 (Opik service) — can run in parallel with Phase 3
- **Phase 5 (US4)**: Depends on Phase 4 (span loading page exists)
- **Phase 6 (US5)**: Depends on Phase 4 (span loading page exists), can run in parallel with Phase 5
- **Phase 7 (US6)**: Depends on Phase 5 or Phase 6 (post-action state exists)
- **Phase 8 (Polish)**: Depends on all user stories complete

### Parallel Opportunities

```
Phase 1 → Phase 2
              ↓
         ┌────┴────┐
    Phase 3 (P1)  Phase 4 (P2)
         │         ↓
         │    ┌────┴────┐
         │  Phase 5    Phase 6
         │  (P3)       (P4)
         │    └────┬────┘
         │      Phase 7 (P5)
         └────────┬────┘
              Phase 8
```

- T007 and T008 can run in parallel (different files, after T006 components)
- T011 and T013 can run in parallel (different API route files)
- T016 and T017 can run in parallel (different concerns)
- Phase 3 and Phase 4 can run in parallel (no file overlap)

### Within Each Phase

- Auth helper (T005) and Opik service (T004) can be built in parallel
- T006 (reusable components) MUST complete before T007 and T008 (pages that use them)
- API route must be created before its corresponding UI integration
- Core implementation before polish

### Commit Strategy

```bash
# Phase 2
git commit -m "feat(admin): add Opik REST API service and admin auth helper"

# Phase 3
git commit -m "feat(admin): add reusable admin components, welcome page and header navigation"

# Phase 4
git commit -m "feat(admin): add span loading API route and unrecognized items page"

# Phase 5
git commit -m "feat(admin): add ingredient promotion API route and UI"

# Phase 6
git commit -m "feat(admin): add dismiss functionality and mark-reviewed API route"

# Phase 7
git commit -m "feat(admin): add load next span CTA for sequential processing"

# Phase 8
git commit -m "feat(admin): polish error handling and edge cases"
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: Welcome page + nav (P1)
4. Complete Phase 4: Span loading + display (P2)
5. **STOP and VALIDATE**: Admin can see unrecognized items

### Full Feature (Sequential)

1. Setup → Foundational → US1+US2 → US3 → US4 → US5 → US6 → Polish
2. Commit after each phase
3. Each phase adds value without breaking previous phases

---

## Notes

- All Opik PATCH operations use GET-then-PATCH pattern (re-fetch span before updating tags)
- Frontend only sends `spanId` — backend handles re-fetching current span state
- `adminDb` bypasses RLS for ingredient operations (global catalog, not user-scoped)
- Category dropdown defaults to `non_classified`
- Ingredient names stored lowercase, matched case-insensitive
- No schema migrations required — uses existing `ingredients` table
- No auto-loading of spans — all CTA-triggered
