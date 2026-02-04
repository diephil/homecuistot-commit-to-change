# Opik API Contracts

External Opik REST API contracts used by admin backend service for span management.

## Base URL

- **Local (Open-Source)**: `http://localhost:5173/api` (via `OPIK_URL_OVERRIDE`)
- **Production (Opik Cloud)**: `https://www.comet.com/opik/api` (via `OPIK_URL_OVERRIDE`)

## Authentication

**Local (Open-Source)**: No additional headers required.

```bash
curl -X GET 'http://localhost:5173/api/v1/private/projects'
```

**Production (Opik Cloud)**: Two headers required on every request:

| Header | Value | Source |
|--------|-------|--------|
| `Comet-Workspace` | `philippe-diep` | `OPIK_WORKSPACE` env var |
| `authorization` | `<OPIK_API_KEY>` | `OPIK_API_KEY` env var |

**WARNING**: The `authorization` header value does NOT include the `Bearer ` prefix. Send the raw API key.

```bash
curl -X GET 'https://www.comet.com/opik/api/v1/private/projects' \
  -H 'Accept: application/json' \
  -H 'Comet-Workspace: philippe-diep' \
  -H 'authorization: <your-api-key>'
```

---

## POST {OPIK_URL}/v1/private/spans/search

Search for spans matching filters.

**Purpose**: Fetch the next unprocessed span containing unrecognized ingredients. Returns spans tagged `unrecognized_items` that have NOT been tagged `promotion_reviewed`.

**Request**:
- Method: `POST`
- Headers:
  - `Content-Type: application/json`
  - **Local**: No additional headers
  - **Production**: `Comet-Workspace: philippe-diep` + `authorization: <OPIK_API_KEY>` (no Bearer prefix)

**Request body**:
```json
{
  "project_name": "<OPIK_PROJECT_NAME>",
  "filters": [
    {
      "field": "tags",
      "operator": "contains",
      "value": "unrecognized_items"
    },
    {
      "field": "tags",
      "operator": "not_contains",
      "value": "promotion_reviewed"
    }
  ],
  "limit": 1,
  "sort_by": [
    {
      "field": "created_at",
      "direction": "desc"
    }
  ]
}
```

**Field descriptions**:
- `project_name`: Opik project name (from `OPIK_PROJECT_NAME` env)
- `filters`: Array of filter conditions (AND logic)
  - `field`: Span attribute to filter on (use `tags` for tag-based filtering)
  - `operator`: Filter operator
    - `contains`: Tag exists in span's tag list
    - `not_contains`: Tag does NOT exist in span's tag list
  - `value`: Tag name to match
- `limit`: Max spans to return (use `1` to fetch one at a time)
- `sort_by`: Sort order (descending created_at = most recent first, per spec)

**Response 200 - Spans found**:
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "trace_id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "span_name",
      "tags": [
        "unrecognized_items",
        "user:abc123def456"
      ],
      "metadata": {
        "totalUnrecognized": 5,
        "unrecognized": [
          "truffle oil",
          "truffle oil",
          "smoked paprika",
          "pomegranate molasses",
          "pomegranate molasses"
        ]
      },
      "created_at": "2025-02-04T10:30:00Z",
      "updated_at": "2025-02-04T10:30:00Z"
    }
  ],
  "total": 1
}
```

**Field descriptions** (minimal fields shown, Opik returns more):
- `id`: Span UUID (needed for PATCH operations)
- `trace_id`: Trace UUID (needed for PATCH operations)
- `tags`: Array of span tags (preserving this is critical for PATCH)
- `metadata.totalUnrecognized`: Original count of unrecognized items detected
- `metadata.unrecognized`: Array of ingredient names (may have duplicates, may include items already in DB)

**Response 200 - No spans found**:
```json
{
  "data": [],
  "total": 0
}
```

**Response 400 - Bad request**:
```json
{
  "error": "Invalid filter operator: 'invalid_op'"
}
```

**Response 401 - Unauthorized** (production):
```json
{
  "error": "Unauthorized"
}
```

**Response 500 - Server error**:
```json
{
  "error": "Internal server error"
}
```

---

## GET {OPIK_URL}/v1/private/spans/{id}

Get a span by ID.

**Purpose**: Re-fetch a span's current state immediately before updating its tags. This ensures we have the latest tags (which may have changed since the initial search) and prevents data loss during PATCH.

**Request**:
- Method: `GET`
- Path param:
  - `id`: Span UUID
- Headers:
  - **Local**: No additional headers
  - **Production**:
    - `Comet-Workspace: philippe-diep` + `authorization: <OPIK_API_KEY>` (no Bearer prefix)

**Response 200**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "trace_id": "660e8400-e29b-41d4-a716-446655440001",
  "name": "create_recipes",
  "tags": ["unrecognized_items", "user:abc123def456"],
  "metadata": { "totalUnrecognized": 2, "unrecognized": ["cornichon", "pickled onion"] },
  "start_time": "2025-02-04T10:30:00Z",
  "end_time": "2025-02-04T10:30:05Z"
}
```

**Response 404**: Span not found (may have been deleted).

---

## PATCH {OPIK_URL}/v1/private/spans/{id}

Update span tags.

**Purpose**: Mark a span as reviewed by adding the `promotion_reviewed` tag. Tags array replaces existing tags entirely, so the current tags must be fetched first via GET.

**Required flow before PATCH**:
1. `GET /v1/private/spans/{id}` → get current `tags` and `trace_id`
2. Append `promotion_reviewed` to the current tags array
3. `PATCH /v1/private/spans/{id}` with the merged tags

**Request**:
- Method: `PATCH`
- Path param:
  - `id`: Span UUID
- Headers:
  - `Content-Type: application/json`
  - **Local**: No additional headers
  - **Production**:
    - `Comet-Workspace: philippe-diep` + `authorization: <OPIK_API_KEY>` (no Bearer prefix)

**Request body**:
```json
{
  "trace_id": "660e8400-e29b-41d4-a716-446655440001",
  "tags": [
    "unrecognized_items",
    "user:abc123def456",
    "promotion_reviewed"
  ]
}
```

**Field descriptions**:
- `trace_id`: From the GET response (freshly fetched)
- `tags`: Complete array of tags (replaces all existing tags)
  - **CRITICAL**: Must be built from the GET response's current tags + `promotion_reviewed`
  - Never rely on stale tags from the initial search — always re-fetch first

**Important**: Tags are replaced, not merged. The GET-then-PATCH pattern prevents losing tags that were added between the initial search and the review completion.

**Response 204 - Success**:
No response body. HTTP 204 indicates successful update.

**Response 400 - Bad request**:
```json
{
  "error": "Missing required field: 'trace_id'"
}
```

**Response 401 - Unauthorized** (production):
```json
{
  "error": "Unauthorized"
}
```

**Response 404 - Not found**:
```json
{
  "error": "Span not found"
}
```

**Response 500 - Server error**:
```json
{
  "error": "Internal server error"
}
```

---

## Filter Operators Reference

Common operators for spans/search:

| Operator | Meaning | Example |
|----------|---------|---------|
| `contains` | Field contains value | `tags contains "unrecognized_items"` |
| `not_contains` | Field does NOT contain value | `tags not_contains "promotion_reviewed"` |
| `equals` | Field equals value | `name equals "my_span"` |
| `not_equals` | Field does NOT equal value | `status not_equals "error"` |
| `in` | Field value in list | `status in ["completed", "pending"]` |
| `gt` | Greater than (numeric/date) | `created_at gt "2025-01-01"` |
| `lt` | Less than (numeric/date) | `created_at lt "2025-02-04"` |

---

## Tag Naming Conventions

Tags used in this feature follow conventions:

| Tag | Purpose | Example |
|-----|---------|---------|
| `unrecognized_items` | Span contains unrecognized ingredients | Applied when extraction detects unknowns |
| `promotion_reviewed` | Span has been admin-reviewed | Applied after admin processes the span |
| `user:<uuid>` | User who triggered the span | `user:abc123def456` |

---

## Rate Limiting & Retry Strategy

**Local development**: No rate limits.

**Production**:
- No documented rate limits in Opik public API
- Implement exponential backoff on `429` or `5xx` responses
- Recommended: max 3 retries with 1s, 2s, 4s delays

**Timeout**: Use 10s timeout for all requests.

---

## Error Handling Summary

| Status | Cause | Action |
|--------|-------|--------|
| `204` | Success | Continue processing |
| `400` | Malformed request | Log error, don't retry |
| `401` | Auth failed | Check headers/credentials |
| `404` | Span not found | Span may have been deleted, skip |
| `429` | Rate limited | Implement backoff, retry |
| `500-599` | Server error | Log error, retry with backoff |

---

## Local Development Testing

Start local Opik:
```bash
make opstart  # Opik UI: http://localhost:5173
```

Search endpoint (local):
```bash
curl -X POST http://localhost:5173/api/v1/private/spans/search \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "homecuistot",
    "filters": [
      {"field": "tags", "operator": "contains", "value": "unrecognized_items"},
      {"field": "tags", "operator": "not_contains", "value": "promotion_reviewed"}
    ],
    "limit": 1
  }'
```

Patch endpoint (local):
```bash
curl -X PATCH http://localhost:5173/api/v1/private/spans/SPAN_UUID \
  -H "Content-Type: application/json" \
  -d '{
    "trace_id": "TRACE_UUID",
    "tags": ["unrecognized_items", "user:abc123", "promotion_reviewed"]
  }'
```
