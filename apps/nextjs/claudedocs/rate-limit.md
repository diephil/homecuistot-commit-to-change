# Rate Limiting — LLM Usage Per Day

## Goal
Limit free users to **50 LLM calls/day** to control costs. Simple, fast to ship.

## Decisions
- **Reset**: UTC midnight (no cron, just query `created_at >= today`)
- **Limit behavior**: Hard block (429 error), no warnings
- **Admin bypass**: `ADMIN_USER_IDS` env var → skip check
- **Tracking**: Request count only, no token counts
- **Daily limit**: Configurable via `DAILY_LLM_LIMIT` env var (default 50)

## Schema

### Table: `llm_usage_log` (append-only, 1 row per call)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | `defaultRandom()` |
| `user_id` | uuid NOT NULL | FK to auth.users |
| `endpoint` | text NOT NULL | e.g. `/api/recipes/agent-proposal` |
| `created_at` | timestamp NOT NULL | `defaultNow()` |

### Index
```sql
CREATE INDEX idx_llm_usage_user_date ON llm_usage_log (user_id, created_at);
```
Composite index enables fast `COUNT(*) WHERE user_id = ? AND created_at >= ?` (index-only scan, sub-ms).

### Why log table, not counter table
- No reset cron/logic needed — old rows naturally stop counting
- No race conditions on concurrent requests (INSERT vs UPDATE)
- Free analytics later (usage patterns, endpoint breakdown)
- Periodic cleanup optional (DELETE rows > 30 days)

## Service: `src/lib/services/usage-limit.ts`

### `checkUsageLimit({ userId, db })`
1. If `userId` in `ADMIN_USER_IDS` → return (skip)
2. `SELECT COUNT(*) FROM llm_usage_log WHERE user_id = ? AND created_at >= today_utc_midnight`
3. If count >= `DAILY_LLM_LIMIT` → throw 429 `RateLimitError`

### `logUsage({ userId, db, endpoint })`
1. `INSERT INTO llm_usage_log (user_id, endpoint)`
2. Called after successful LLM response only (failed calls don't count)

## Integration: 8 API routes

Each LLM route gets 2 lines added:

```typescript
export const POST = withAuth(async ({ userId, db, request }) => {
  await checkUsageLimit({ userId, db })        // <-- ADD: before AI call

  // ... existing LLM processing ...

  await logUsage({ userId, db, endpoint: '/api/...' })  // <-- ADD: after success
  return NextResponse.json(result)
})
```

### Routes to update
1. `src/app/api/inventory/agent-proposal/route.ts`
2. `src/app/api/onboarding/process-text/route.ts`
3. `src/app/api/onboarding/process-voice/route.ts`
4. `src/app/api/onboarding/process-recipe/route.ts`
5. `src/app/api/onboarding/story/process-input/route.ts`
6. `src/app/api/recipes/agent-proposal/route.ts`
7. `src/app/api/recipes/process-text/route.ts`
8. `src/app/api/recipes/process-voice/route.ts`

### `withUser()` → `withAuth()` migration
Some routes use `withUser()` (no `db`). These need upgrading to `withAuth()` to get a DB client for the check/log queries.

## Files

| Action | File |
|--------|------|
| **New** | `src/db/schema/llm-usage-log.ts` |
| **Edit** | `src/db/schema/index.ts` (export new table) |
| **New** | `src/lib/services/usage-limit.ts` |
| **Edit** | 8 API route files (2 lines each) |
| **Run** | `pnpm db:generate` → `pnpm db:migrate` |

## Env vars

```bash
# Add to .env.local
DAILY_LLM_LIMIT=50   # optional, defaults to 50
```

## Unresolved questions
- `withUser()` routes need `withAuth()` for DB access — any concern with that upgrade?
- Cleanup policy for old rows? (e.g. cron to DELETE > 30 days, or leave indefinitely)
