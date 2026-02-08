# Tasks: LLM Rate Limiting

**Input**: Design documents from `/specs/031-llm-rate-limit/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested — manual testing only (MVP).

**Organization**: Tasks grouped by user story. All 3 stories share the same foundational schema + service layer, then diverge at route integration.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Schema & Migration (Shared Infrastructure)

**Purpose**: Create the `llm_usage_log` table and generate Drizzle migration

- [x] T001 Create Drizzle schema for `llm_usage_log` table in `apps/nextjs/src/db/schema/llm-usage-log.ts` — uuid PK, `user_id` uuid NOT NULL, `endpoint` text NOT NULL, `created_at` timestamptz NOT NULL defaultNow(), composite index on `(user_id, created_at)`. Follow `cooking-log.ts` pattern.
- [x] T002 Export new schema from barrel file `apps/nextjs/src/db/schema/index.ts` — add `export * from './llm-usage-log'`
- [x] T003 Run `pnpm db:generate` from `apps/nextjs/` to generate migration SQL
- [x] T004 **USER ACTION**: Review generated migration in `apps/nextjs/src/db/migrations/`, run `pnpm db:migrate`, verify with `pnpm db:status`
- [x] T005 Create RLS migration file `apps/nextjs/src/db/migrations/XXXX_rls_llm_usage_log.sql` — enable RLS, add SELECT policy (`auth.uid() = user_id`), add INSERT policy (`auth.uid() = user_id`). Follow `0001_enable_rls_policies.sql` pattern.
- [ ] T006 **USER ACTION**: Apply RLS migration via `pnpm db:migrate`, verify with `pnpm db:status`

**Checkpoint**: `llm_usage_log` table exists with RLS policies. Ready for service layer.

---

## Phase 2: Foundational (Service Layer)

**Purpose**: Core rate-limiting service that ALL user stories depend on

**CRITICAL**: No route integration can begin until this phase is complete

- [ ] T007 Create usage limit service in `apps/nextjs/src/lib/services/usage-limit.ts` — implement `checkUsageLimit({ userId, db })` (admin bypass via `ADMIN_USER_IDS` env var, COUNT query for today's UTC usage, throw 429 NextResponse if >= `DAILY_LLM_LIMIT` default 100, fail closed on DB error) and `logUsage({ userId, db, endpoint })` (INSERT into `llm_usage_log`). Use named parameters per constitution. Import admin ID parsing pattern from `admin-auth.ts`.

**Checkpoint**: Service layer ready. Route integration can begin.

---

## Phase 3: User Story 1 - Rate-Limited User Receives Clear Feedback (Priority: P1)

**Goal**: Users exceeding 100 daily LLM calls get a 429 error. Users under the limit proceed normally.

**Independent Test**: Make LLM calls via any endpoint. Set `DAILY_LLM_LIMIT=1`, verify 2nd call returns 429. Reset to 100, verify normal flow.

### Implementation for User Story 1

**Migrate `withUser` → `withAuth` (6 routes, parallelizable)**:

- [ ] T008 [P] [US1] Migrate `apps/nextjs/src/app/api/onboarding/process-text/route.ts` from `withUser` to `withAuth` — update import, destructure `{ userId, db, request }`, add `await checkUsageLimit({ userId, db })` before LLM call, add `await logUsage({ userId, db, endpoint: '/api/onboarding/process-text' })` after successful response before return
- [ ] T009 [P] [US1] Migrate `apps/nextjs/src/app/api/onboarding/process-voice/route.ts` from `withUser` to `withAuth` — same pattern: import, destructure, checkUsageLimit before LLM, logUsage after success with endpoint `/api/onboarding/process-voice`
- [ ] T010 [P] [US1] Migrate `apps/nextjs/src/app/api/onboarding/process-recipe/route.ts` from `withUser` to `withAuth` — same pattern with endpoint `/api/onboarding/process-recipe`
- [ ] T011 [P] [US1] Migrate `apps/nextjs/src/app/api/onboarding/story/process-input/route.ts` from `withUser` to `withAuth` — same pattern with endpoint `/api/onboarding/story/process-input`
- [ ] T012 [P] [US1] Migrate `apps/nextjs/src/app/api/recipes/process-text/route.ts` from `withUser` to `withAuth` — same pattern with endpoint `/api/recipes/process-text`
- [ ] T013 [P] [US1] Migrate `apps/nextjs/src/app/api/recipes/process-voice/route.ts` from `withUser` to `withAuth` — same pattern with endpoint `/api/recipes/process-voice`

**Add rate limiting to already-`withAuth` routes (2 routes, parallelizable)**:

- [ ] T014 [P] [US1] Add rate limiting to `apps/nextjs/src/app/api/inventory/agent-proposal/route.ts` — add `await checkUsageLimit({ userId, db })` before LLM call, add `await logUsage({ userId, db, endpoint: '/api/inventory/agent-proposal' })` after successful response
- [ ] T015 [P] [US1] Add rate limiting to `apps/nextjs/src/app/api/recipes/agent-proposal/route.ts` — add `await checkUsageLimit({ userId, db })` before LLM call, add `await logUsage({ userId, db, endpoint: '/api/recipes/agent-proposal' })` after successful response

**Checkpoint**: All 8 routes enforce rate limiting. US1 fully testable: make 100+ calls → 101st returns 429.

---

## Phase 4: User Story 2 - Admin Users Bypass Rate Limits (Priority: P2)

**Goal**: Admin users (in `ADMIN_USER_IDS`) skip rate limit checks entirely.

**Independent Test**: Configure admin user UUID in `ADMIN_USER_IDS`, set `DAILY_LLM_LIMIT=1`, verify admin can make unlimited calls while non-admin gets 429 on 2nd call.

### Implementation for User Story 2

No additional tasks needed — admin bypass is already implemented in T007 (`checkUsageLimit` checks `ADMIN_USER_IDS` before DB query). This story is satisfied by Phase 2 service layer.

**Checkpoint**: Admin bypass works. Verify by testing with admin user UUID.

---

## Phase 5: User Story 3 - Usage Tracking for Analytics (Priority: P3)

**Goal**: Each successful LLM call creates a log entry with user, endpoint, and timestamp. Failed calls are not logged.

**Independent Test**: Make several LLM calls across different endpoints, query `llm_usage_log` table in Drizzle Studio (`pnpm db:studio`) to verify entries with correct `user_id`, `endpoint`, and `created_at`.

### Implementation for User Story 3

No additional tasks needed — usage logging is already implemented in T007 (`logUsage` inserts row) and integrated in T008-T015 (each route calls `logUsage` after success, before return). Failed calls naturally don't reach the `logUsage` call because it's placed after the try block's successful response.

**Checkpoint**: Usage logs populated with correct metadata for all successful calls.

---

## Phase 6: Polish & Verification

**Purpose**: Build verification and final validation

- [ ] T016 Run `pnpm build` from `apps/nextjs/` to verify TypeScript compilation succeeds with all changes
- [ ] T017 Run `pnpm lint` from `apps/nextjs/` to verify no new lint errors introduced

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Schema)**: No dependencies — start immediately
- **Phase 2 (Service)**: Depends on Phase 1 completion (needs schema types)
- **Phase 3 (US1 Routes)**: Depends on Phase 2 completion (needs service functions)
- **Phase 4 (US2 Admin)**: Already complete via Phase 2 — verify only
- **Phase 5 (US3 Tracking)**: Already complete via Phase 2 + Phase 3 — verify only
- **Phase 6 (Polish)**: Depends on Phase 3 completion

### User Story Dependencies

- **US1 (Rate Limiting)**: Depends on schema + service. Core delivery.
- **US2 (Admin Bypass)**: Built into service layer (T007). No additional tasks.
- **US3 (Usage Tracking)**: Built into service layer (T007) + route integration (T008-T015). No additional tasks.

### Within Phase 3 (US1)

- T008-T013 (withUser→withAuth migrations): All parallelizable — different files, no dependencies
- T014-T015 (withAuth routes): Parallelizable with T008-T013
- All 8 route tasks (T008-T015) are parallelizable with each other

### Parallel Opportunities

```
Phase 1: T001 → T002 → T003 → T004 (USER) → T005 → T006 (USER)  [sequential]
Phase 2: T007                                                      [sequential]
Phase 3: T008, T009, T010, T011, T012, T013, T014, T015           [all parallel]
Phase 6: T016 → T017                                               [sequential]
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Schema & migration (T001-T006)
2. Complete Phase 2: Service layer (T007)
3. Complete Phase 3: Route integration (T008-T015, all parallel)
4. **STOP and VALIDATE**: Test rate limiting with `DAILY_LLM_LIMIT=1`
5. Phase 6: Build + lint check

### Incremental Delivery

Not applicable — all 3 user stories are delivered by the same implementation. US2 (admin bypass) and US3 (usage tracking) are inherent properties of the service layer, not separate increments.

---

## Notes

- T004 and T006 are USER ACTION tasks — Claude stops and asks user to apply/verify migrations
- All 8 route tasks (T008-T015) touch different files → fully parallelizable
- US2 and US3 have no dedicated tasks because their functionality is built into the service layer (T007) and route integration pattern
- Total: 17 tasks (6 schema, 1 service, 8 routes, 2 verification)
