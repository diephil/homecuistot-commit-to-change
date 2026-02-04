# Admin API Contracts

Internal Next.js API routes for admin ingredient promotion workflow.

## Authentication

All endpoints require admin authorization:
1. Verify user session exists
2. Check `user.id` against `ADMIN_USER_IDS` env var (comma-separated)
3. Return `401 Unauthorized` if not admin

---

## GET /api/admin/spans/next

Fetch the next unprocessed Opik span containing unrecognized ingredients.

**Purpose**: Backend queries Opik for spans tagged `unrecognized_items` but not `promotion_reviewed`, extracts and deduplicates ingredient names from metadata, annotates each item with its DB existence status, returns full list. No silent auto-review — always returns the span for admin review.

**Request**:
- Method: `GET`
- Headers: None required (session auto-included)
- Query params: None
- Body: None

**Response 200 - Span found**:
```json
{
  "spanId": "550e8400-e29b-41d4-a716-446655440000",
  "traceId": "660e8400-e29b-41d4-a716-446655440001",
  "items": [
    { "name": "truffle oil", "existsInDb": false },
    { "name": "smoked paprika", "existsInDb": true },
    { "name": "pomegranate molasses", "existsInDb": false }
  ],
  "totalInSpan": 5
}
```

**Field descriptions**:
- `spanId`: Opik span UUID (needed for promote/mark-reviewed operations)
- `traceId`: Opik trace UUID (informational; backend re-fetches span before PATCH)
- `items`: Deduplicated unrecognized ingredient names with DB status (lowercase). Items where `existsInDb: true` are shown read-only in the UI; items where `existsInDb: false` are new and can be promoted or dismissed.
- `totalInSpan`: Original count from span metadata.totalUnrecognized (informational)

**Backend behavior**:
- Deduplicates items (case-insensitive) from span metadata
- Checks each item against DB and annotates with `existsInDb` boolean
- **Never** silently auto-reviews spans — always returns the span even if all items exist in DB
- Skips spans with malformed/empty metadata (auto-tags these as reviewed, fetches next)

**Response 200 - No spans remaining**:
```json
{
  "spanId": null,
  "traceId": null,
  "items": [],
  "totalInSpan": 0
}
```

**Response 401 - Unauthorized**:
```json
{
  "error": "Unauthorized"
}
```

**Response 500 - Server error**:
```json
{
  "error": "Failed to fetch spans"
}
```

---

## POST /api/admin/ingredients/promote

Promote selected ingredients into the DB and tag the span as reviewed.

**Purpose**: Backend inserts promoted ingredients (lowercased) into `ingredients` table with assigned category, then re-fetches the span's current state from Opik (GET by ID) and patches it to add `promotion_reviewed` tag.

**Request**:
- Method: `POST`
- Headers: `Content-Type: application/json`
- Body:

```json
{
  "spanId": "550e8400-e29b-41d4-a716-446655440000",
  "promotions": [
    {
      "name": "truffle oil",
      "category": "oils_and_fats"
    },
    {
      "name": "smoked paprika",
      "category": "aroma"
    },
    {
      "name": "pomegranate molasses",
      "category": "compound_ingredients"
    }
  ]
}
```

**Field descriptions**:
- `spanId`: From previous `/api/admin/spans/next` response
- `promotions`: Array of ingredients to insert
  - `name`: Ingredient display name (will be lowercased in DB)
  - `category`: One of 30 ingredient categories (see schema reference)

**Backend flow**:
1. Insert ingredients into DB
2. `GET /v1/private/spans/{spanId}` — re-fetch current span state (tags, trace_id)
3. `PATCH /v1/private/spans/{spanId}` — append `promotion_reviewed` to current tags

**Response 200 - Success**:
```json
{
  "promoted": 3,
  "skipped": 0,
  "spanTagged": true
}
```

**Field descriptions**:
- `promoted`: Count of successfully inserted new ingredients
- `skipped`: Count of ingredients that already existed in DB (deduplication)
- `spanTagged`: Whether Opik span was successfully patched with `promotion_reviewed` tag

**Response 400 - Invalid request**:
```json
{
  "error": "Invalid request body",
  "details": "promotions[0].category: 'invalid_category' not in allowed categories"
}
```

**Response 401 - Unauthorized**:
```json
{
  "error": "Unauthorized"
}
```

**Response 500 - Server error**:
```json
{
  "error": "Failed to promote ingredients"
}
```

---

## POST /api/admin/spans/mark-reviewed

Mark a span as reviewed without promoting any ingredients.

**Purpose**: Used when admin dismisses all items in a span as duplicates/invalid. Backend re-fetches the span's current state from Opik (GET by ID) then patches to add `promotion_reviewed` tag.

**Request**:
- Method: `POST`
- Headers: `Content-Type: application/json`
- Body:

```json
{
  "spanId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Field descriptions**:
- `spanId`: From `/api/admin/spans/next` response

**Backend flow**:
1. `GET /v1/private/spans/{spanId}` — re-fetch current span state (tags, trace_id)
2. `PATCH /v1/private/spans/{spanId}` — append `promotion_reviewed` to current tags

**Response 200 - Success**:
```json
{
  "spanTagged": true
}
```

**Response 401 - Unauthorized**:
```json
{
  "error": "Unauthorized"
}
```

**Response 500 - Server error**:
```json
{
  "error": "Failed to mark span as reviewed"
}
```

---

## Ingredient Categories Reference

Valid categories for promotion (from schema):
- `non_classified`
- `e100_e199` (food additives)
- `ferments`
- `dairy`
- `cheeses`
- `salt`
- `meat`
- `starch`
- `oils_and_fats`
- `alcohol`
- `aroma`
- `cereal`
- `cocoa`
- `water`
- `fruit`
- `vegetables`
- `beans`
- `nuts`
- `seed`
- `plants`
- `mushroom`
- `fish`
- `molluscs`
- `crustaceans`
- `bee_ingredients`
- `synthesized`
- `poultry`
- `eggs`
- `parts`
- `compound_ingredients`

---

## Error Handling

**Admin check failures**: Return `401` immediately. Do not proceed with database operations.

**Opik connectivity failures**: Return `500`. Log error details for debugging.

**Database constraint violations**: Return `500`. Include constraint violation in error message.

**Invalid category in request**: Return `400` with specific category validation error.
