# Research: LLM Rate Limiting

## Decision 1: Schema Pattern

**Decision**: Append-only `llm_usage_log` table following `cooking_log` pattern
**Rationale**: Matches existing codebase conventions — uuid PK, `defaultRandom()`, `timestamp({ withTimezone: true })`, composite index. Append-only avoids UPDATE race conditions.
**Alternatives**: Counter table (rejected — requires UPDATE + race handling + reset cron)

## Decision 2: Route Auth Migration

**Decision**: Migrate 6 `withUser` routes to `withAuth` to get DB access for usage tracking
**Rationale**: `withAuth` provides `{ userId, db }` needed for both `checkUsageLimit` and `logUsage`. `withUser` only provides `{ user }` with no DB client.
**Alternatives**: Create separate DB connection in service (rejected — bypasses RLS, violates project patterns)

**Routes needing migration**:
| Route | Current | Target |
|-------|---------|--------|
| `/api/onboarding/process-text` | `withUser` | `withAuth` |
| `/api/onboarding/process-voice` | `withUser` | `withAuth` |
| `/api/onboarding/process-recipe` | `withUser` | `withAuth` |
| `/api/onboarding/story/process-input` | `withUser` | `withAuth` |
| `/api/recipes/process-text` | `withUser` | `withAuth` |
| `/api/recipes/process-voice` | `withUser` | `withAuth` |

**Already using `withAuth`** (no migration needed):
- `/api/inventory/agent-proposal`
- `/api/recipes/agent-proposal`

## Decision 3: RLS Policy

**Decision**: Enable RLS on `llm_usage_log` with SELECT + INSERT policies for own rows
**Rationale**: Since routes use `createUserDb` (RLS-scoped), the table needs RLS policies. Users need SELECT (for count check) and INSERT (for logging). No UPDATE or DELETE needed (append-only).
**Alternatives**: Skip RLS and use adminDb (rejected — violates project security pattern)

## Decision 4: Admin Bypass

**Decision**: Use `ADMIN_USER_IDS` env var, parsed via same pattern as `admin-auth.ts`
**Rationale**: Reuse existing admin identification mechanism. Check happens in service layer before DB query, so admin requests skip the COUNT query entirely.
**Alternatives**: DB-level admin role (rejected — overkill, env var already established)

## Decision 5: Error Response

**Decision**: Return 429 with JSON `{ error: "Daily LLM usage limit reached. Resets at midnight UTC." }`
**Rationale**: Standard HTTP 429 for rate limiting. Message tells user when to expect reset. Consistent with existing error patterns (JSON body with `error` field).
**Alternatives**: Custom error class with `classifyLlmError` (rejected — unnecessary abstraction for single error type)

## Decision 6: Task Ordering

**Decision**: Schema first → generate migration → manual apply → service → route integration
**Rationale**: User explicitly requested: Drizzle schema first, then generate, then ask to manually apply. Service depends on schema types. Routes depend on service.
