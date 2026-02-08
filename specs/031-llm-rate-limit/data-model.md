# Data Model: LLM Rate Limiting

## Entity: LLM Usage Log Entry

**Table**: `llm_usage_log`
**Type**: Append-only event log (no updates or deletes in normal operation)

### Fields

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | uuid | PK, auto-generated | `defaultRandom()` |
| `user_id` | uuid | NOT NULL | References auth.users (no FK constraint — matches `cooking_log` pattern) |
| `endpoint` | text | NOT NULL | API route path, e.g. `/api/recipes/agent-proposal` |
| `created_at` | timestamp with timezone | NOT NULL, default now | `defaultNow()` |

### Indexes

| Name | Columns | Purpose |
|------|---------|---------|
| `idx_llm_usage_user_date` | `(user_id, created_at)` | Enables fast daily count query: `COUNT(*) WHERE user_id = ? AND created_at >= today_utc`. Composite index supports index-only scan. |

### RLS Policies

| Policy | Operation | Rule |
|--------|-----------|------|
| Users can view their own usage | SELECT | `auth.uid() = user_id` |
| Users can insert their own usage | INSERT | `auth.uid() = user_id` |

No UPDATE or DELETE policies — table is append-only.

### Relationships

- **User → Usage Log**: One-to-many. One user has many usage log entries.
- No foreign key constraint on `user_id` (matches `cooking_log` pattern — avoids FK overhead, user always exists via auth).

### Query Patterns

**Daily count check**:
```
SELECT COUNT(*) FROM llm_usage_log
WHERE user_id = :userId
AND created_at >= :todayUtcMidnight
```

**Log new usage**:
```
INSERT INTO llm_usage_log (user_id, endpoint)
VALUES (:userId, :endpoint)
```

### Volume Estimates

- ~100 rows/user/day max (at limit)
- Active users: ~100-1000 → ~10K-100K rows/day
- 30-day accumulation: ~300K-3M rows
- Cleanup: optional, out of scope (DELETE WHERE created_at < 30 days ago)
