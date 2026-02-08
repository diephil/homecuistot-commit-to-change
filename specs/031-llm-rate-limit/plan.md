# Implementation Plan: LLM Rate Limiting

**Branch**: `031-llm-rate-limit` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/031-llm-rate-limit/spec.md`

## Summary

Limit free users to 100 LLM calls/day via an append-only `llm_usage_log` table. Each LLM route checks the count before processing and logs after success. Admin users bypass the check. Daily reset is implicit via timestamp-based queries (no cron). Implementation follows existing Drizzle schema, RLS, and `withAuth` patterns.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Next.js 16
**Primary Dependencies**: Drizzle ORM 0.45.1, Supabase Auth (@supabase/ssr), Vercel AI SDK
**Storage**: Supabase PostgreSQL via Drizzle ORM with RLS
**Testing**: Vitest (manual testing primary for MVP)
**Target Platform**: Vercel serverless (Node.js)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Rate limit check < 100ms (single indexed COUNT query)
**Constraints**: Must use RLS-scoped DB client (`createUserDb`), append-only log, no cron jobs
**Scale/Scope**: ~100-1000 active users, 100 calls/user/day max, 8 API routes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. MVP-First | PASS | Minimal implementation: 1 table, 1 service, 2 lines per route |
| II. Pragmatic Type Safety | PASS | Types derived from Drizzle schema |
| III. Essential Validation | PASS | Validates at boundary (API route), fail-closed |
| IV. Test-Ready Infrastructure | PASS | Vitest available, manual testing acceptable for MVP |
| V. Type Derivation | PASS | Table types inferred from `pgTable` definition |
| VI. Named Parameters | PASS | `checkUsageLimit({ userId, db })` and `logUsage({ userId, db, endpoint })` |
| VII. Neobrutalism Design | N/A | Backend-only feature, no UI components |
| Non-Negotiable Safeguards | PASS | No auth bypasses (uses RLS), no SQL injection (parameterized), no data loss |

## Project Structure

### Documentation (this feature)

```text
specs/031-llm-rate-limit/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: research decisions
├── data-model.md        # Phase 1: entity model
├── quickstart.md        # Phase 1: implementation guide
├── contracts/
│   └── api.md           # Phase 1: service contracts
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
apps/nextjs/src/
├── db/
│   ├── schema/
│   │   ├── llm-usage-log.ts    # NEW: table definition
│   │   └── index.ts            # EDIT: add export
│   └── migrations/
│       ├── XXXX_*.sql          # GENERATED: schema migration
│       └── XXXX_rls_*.sql      # MANUAL: RLS policies
├── lib/
│   └── services/
│       └── usage-limit.ts      # NEW: checkUsageLimit + logUsage
└── app/
    └── api/
        ├── inventory/agent-proposal/route.ts     # EDIT: +2 lines
        ├── onboarding/
        │   ├── process-text/route.ts             # EDIT: withUser→withAuth +2 lines
        │   ├── process-voice/route.ts            # EDIT: withUser→withAuth +2 lines
        │   ├── process-recipe/route.ts           # EDIT: withUser→withAuth +2 lines
        │   └── story/process-input/route.ts      # EDIT: withUser→withAuth +2 lines
        └── recipes/
            ├── agent-proposal/route.ts           # EDIT: +2 lines
            ├── process-text/route.ts             # EDIT: withUser→withAuth +2 lines
            └── process-voice/route.ts            # EDIT: withUser→withAuth +2 lines
```

**Structure Decision**: Follows existing project layout. New schema file in `db/schema/`, new service in `lib/services/`, edits to existing route files.

## Implementation Phases

### Phase 1: Schema & Migration

**Task 1.1**: Create Drizzle schema `src/db/schema/llm-usage-log.ts`
- Table: `llm_usage_log` with `id`, `user_id`, `endpoint`, `created_at`
- Composite index on `(user_id, created_at)`
- Follow `cooking-log.ts` pattern exactly

**Task 1.2**: Export from `src/db/schema/index.ts`
- Add `export * from './llm-usage-log'`

**Task 1.3**: Generate migration
- Run `pnpm db:generate`

**Task 1.4**: USER ACTION — Apply migration manually
- Review generated SQL in `src/db/migrations/`
- Run `pnpm db:migrate`
- Verify with `pnpm db:status`

**Task 1.5**: Create RLS migration (manual SQL)
- Create custom migration file for RLS policies
- Enable RLS on `llm_usage_log`
- Add SELECT policy (users view own usage)
- Add INSERT policy (users insert own usage)
- Apply migration

### Phase 2: Service Layer

**Task 2.1**: Create `src/lib/services/usage-limit.ts`
- `checkUsageLimit({ userId, db })` — admin bypass + count check + 429 throw
- `logUsage({ userId, db, endpoint })` — insert log row
- Import `ADMIN_USER_IDS` pattern from `admin-auth.ts`
- Daily limit from `process.env.DAILY_LLM_LIMIT` (default 100)

### Phase 3: Route Integration

**Task 3.1**: Migrate 6 routes from `withUser` → `withAuth`
- Update import statement
- Update handler signature to destructure `{ userId, db, request }` (and `params` where used)
- Ensure existing logic still works with new context shape

**Task 3.2**: Add rate limiting to all 8 routes
- Add `await checkUsageLimit({ userId, db })` before first LLM call
- Add `await logUsage({ userId, db, endpoint: '/api/...' })` after successful response, before return

### Phase 4: Verification

**Task 4.1**: Manual testing
- Make LLM calls, verify `llm_usage_log` rows created
- Verify admin user bypasses limit
- Verify 429 response when limit exceeded (can temporarily set `DAILY_LLM_LIMIT=1`)
- Verify build passes: `pnpm build`

## Complexity Tracking

No constitution violations. No complexity tracking needed.
