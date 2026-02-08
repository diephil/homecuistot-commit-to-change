# API Contracts: LLM Rate Limiting

## Service Interface: `usage-limit.ts`

### `checkUsageLimit({ userId, db })`

Checks if user has exceeded daily LLM limit. Called BEFORE LLM processing.

**Parameters**:
- `userId: string` — Supabase user ID
- `db: UserDb` — RLS-scoped database transaction wrapper

**Returns**: `void` (resolves silently if under limit)

**Throws**: `NextResponse` with status 429 if limit exceeded

**Behavior**:
1. If `userId` is in `ADMIN_USER_IDS` → return immediately (skip check)
2. Count rows in `llm_usage_log` where `user_id = userId` and `created_at >= today UTC midnight`
3. If count >= `DAILY_LLM_LIMIT` (env var, default 100) → throw 429 response

---

### `logUsage({ userId, db, endpoint })`

Logs a successful LLM call. Called AFTER successful LLM response.

**Parameters**:
- `userId: string` — Supabase user ID
- `db: UserDb` — RLS-scoped database transaction wrapper
- `endpoint: string` — API route path (e.g. `/api/recipes/agent-proposal`)

**Returns**: `void`

**Behavior**:
1. Insert row into `llm_usage_log` with `user_id`, `endpoint`
2. `created_at` auto-populated by `defaultNow()`

---

## Error Response

### 429 Rate Limit Exceeded

```json
{
  "error": "Daily LLM usage limit reached. Resets at midnight UTC."
}
```

**Headers**: Standard 429 response. No `Retry-After` header (reset is at UTC midnight).

---

## Integration Pattern

Each of the 8 LLM routes adds exactly 2 lines:

```typescript
export const POST = withAuth(async ({ userId, db, request }) => {
  await checkUsageLimit({ userId, db })           // ADD: before LLM call
  // ... existing LLM processing ...
  await logUsage({ userId, db, endpoint: '/api/...' })  // ADD: after success
  return NextResponse.json(result)
})
```

## Affected Endpoints

| Endpoint | Current Wrapper | Migration Needed |
|----------|-----------------|------------------|
| `POST /api/inventory/agent-proposal` | `withAuth` | No |
| `POST /api/onboarding/process-text` | `withUser` | Yes → `withAuth` |
| `POST /api/onboarding/process-voice` | `withUser` | Yes → `withAuth` |
| `POST /api/onboarding/process-recipe` | `withUser` | Yes → `withAuth` |
| `POST /api/onboarding/story/process-input` | `withUser` | Yes → `withAuth` |
| `POST /api/recipes/agent-proposal` | `withAuth` | No |
| `POST /api/recipes/process-text` | `withUser` | Yes → `withAuth` |
| `POST /api/recipes/process-voice` | `withUser` | Yes → `withAuth` |
