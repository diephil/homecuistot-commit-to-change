# Data Model: Admin Unrecognized Ingredient Promotion

## Overview

This feature promotes unrecognized ingredients discovered during user interactions into the persistent ingredients database. It operates on existing entities without requiring schema migrations.

**No schema changes.** Uses:
- Existing `ingredients` table (PostgreSQL via Drizzle ORM)
- Opik spans external service (REST API for span queries and tag updates)

---

## Existing Entities

### 1. Ingredient (Database Table: `ingredients`)

Persistent ingredient catalog. When unrecognized items are promoted, new rows are inserted here.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | `UUID` | Primary key, auto-generated | System identifier |
| `name` | `text` | `NOT NULL`, `UNIQUE`, stored lowercase | Normalized for consistent matching |
| `category` | `text` (IngredientCategory enum) | `NOT NULL`, one of 30 categories | Semantic classification |
| `createdAt` | `timestamp with time zone` | `NOT NULL`, default `NOW()` | Insertion timestamp |

**Valid Categories (30 total):**

```
meat, cereal, fish, molluscs, crustaceans, bee_ingredients, synthesized,
poultry, eggs, dairy, fruit, vegetables, beans, nuts, seed, plants,
mushroom, cheeses, oils_and_fats, non_classified, e100_e199, ferments,
salt, starch, alcohol, aroma, cocoa, water, parts, compound_ingredients
```

**Schema Location:** `apps/nextjs/src/db/schema/`

---

### 2. Opik Span (External Service: Opik REST API)

Immutable record of LLM interactions. Contains unrecognized ingredient data discovered during recipe creation/updates.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `UUID` | Span identifier from Opik |
| `trace_id` | `UUID` | Parent trace identifier for correlation |
| `name` | `string` | Span operation name (e.g., `create_recipes`, `update_recipes`) |
| `tags` | `string[]` | Flexible tags array. Relevant: `unrecognized_items`, `promotion_reviewed`, `user:<uuid>` |
| `metadata` | `object` | Contains `{ totalUnrecognized: number, unrecognized: string[] }` |

**Access Pattern:** Query via Opik REST API, filter by `tags` to find spans with `unrecognized_items` but NOT `promotion_reviewed`.

---

## Data Flow

### Workflow 1: Fetch Next Unprocessed Span

**Trigger:** Admin clicks "Load Next" on promotion page

**Process:**

```
1. Backend queries Opik API:
   - Filter: tags contains "unrecognized_items"
   - Filter: tags does NOT contain "promotion_reviewed"
   - Limit: 1 span (most recent first)

2. Backend processes response:
   - Extract: spanId, traceId
   - Extract: unrecognized items from metadata.unrecognized[]
   - Deduplicate unrecognized items
   - Filter: remove items already in ingredients table (by name, lowercase)

3. Return to Frontend:
   {
     spanId: string (UUID)
     traceId: string (UUID)
     items: string[]  // filtered, deduplicated
     totalInSpan: number
   }
```

**Opik API Details:**

- **Endpoint:** `GET /api/spans/search`
- **Query Parameters:** `filter=tags:"unrecognized_items"`, `sort_by=created_at DESC`
- **Response:** Array of span objects (use first result)

---

### Workflow 2: Promote Ingredients

**Trigger:** Admin selects items + categories, clicks "Promote"

**Frontend sends:**

```json
{
  "spanId": "uuid-string",
  "promotions": [
    { "name": "free-range chicken", "category": "poultry" },
    { "name": "extra virgin olive oil", "category": "oils_and_fats" }
  ]
}
```

**Backend process:**

```
1. Validate input:
   - spanId: required (UUID format)
   - promotions: required (non-empty array)
   - Each promotion:
     - name: non-empty, will be trimmed + lowercased
     - category: one of 30 valid IngredientCategory values

2. Insert ingredients into DB:
   FOR EACH promotion:
     INSERT INTO ingredients (id, name, category, createdAt)
     VALUES (
       uuid_generate_v4(),
       LOWER(TRIM(promotion.name)),
       promotion.category,
       NOW()
     )
     ON CONFLICT (name) DO NOTHING  // ignore duplicates

3. Re-fetch span current state:
   GET /v1/private/spans/{spanId}
   → get current tags[] and trace_id

4. Update Opik span tags:
   newTags = [...currentTags, "promotion_reviewed"]
   PATCH /v1/private/spans/{spanId}
   {
     "trace_id": currentTraceId,
     "tags": newTags
   }

5. Return success response:
   {
     promoted: number,
     skipped: number,
     spanTagged: boolean
   }
```

**Database Insert Pattern:**

```typescript
// Pseudocode (actual implementation uses Drizzle ORM)
await db
  .insert(ingredients)
  .values(
    promotions.map(p => ({
      id: crypto.randomUUID(),
      name: p.name.trim().toLowerCase(),
      category: p.category,
      createdAt: new Date(),
    }))
  )
  .onConflictDoNothing();
```

---

### Workflow 3: Mark Span Reviewed (Dismiss All)

**Trigger:** Admin clicks "Dismiss All" without promoting any items

**Frontend sends:**

```json
{
  "spanId": "uuid-string"
}
```

**Backend process:**

```
1. Validate input:
   - spanId: required (UUID format)

2. Re-fetch span current state:
   GET /v1/private/spans/{spanId}
   → get current tags[] and trace_id

3. Update Opik span tags:
   newTags = [...currentTags, "promotion_reviewed"]
   PATCH /v1/private/spans/{spanId}
   {
     "trace_id": currentTraceId,
     "tags": newTags
   }

4. Return success response:
   {
     spanTagged: boolean
   }
```

---

## State Transitions

### Opik Span Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│ [UNPROCESSED]                                               │
│ - tags: ["unrecognized_items", "user:<uuid>"]              │
│ - metadata.unrecognized: ["item1", "item2", ...]           │
│ - Admin has NOT reviewed this span                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
         (admin promotes items OR dismisses all)
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ [REVIEWED]                                                  │
│ - tags: ["unrecognized_items", "promotion_reviewed", ...]  │
│ - metadata.unrecognized: [same, unchanged]                 │
│ - Admin HAS reviewed this span                              │
└─────────────────────────────────────────────────────────────┘
```

**Transition Triggers:**
- `Promote Ingredients` workflow (step 3)
- `Dismiss All` workflow (step 2)

---

### Ingredient Name Lifecycle

```
┌──────────────────────────────────┐
│ [UNRECOGNIZED]                   │
│ - Not in ingredients table       │
│ - Only in Opik span metadata     │
│ - Pending admin review           │
└──────────────────────────────────┘
              ↓
    (admin promotes to DB)
              ↓
┌──────────────────────────────────┐
│ [RECOGNIZED]                     │
│ - In ingredients table           │
│ - name: lowercase, trimmed       │
│ - category: assigned             │
│ - createdAt: timestamp           │
└──────────────────────────────────┘
```

**Transition Trigger:** `Promote Ingredients` workflow (step 2)

---

## Validation Rules

### Ingredient Name

- **Trimming:** Remove leading/trailing whitespace before insert
- **Casing:** Convert to lowercase before insert (normalized for consistency)
- **Uniqueness:** Enforced by `ingredients.name UNIQUE` constraint
  - Duplicate inserts silently ignored via `ON CONFLICT DO NOTHING`
  - Query existing ingredients with `LOWER(name)` to match

### Category

- **Enum Constraint:** Must be one of 30 valid `IngredientCategory` values
- **Validation:** Enforce at API boundary (Zod schema) before DB insert
- **No NULL:** Required field, enforced by `NOT NULL` constraint

### Opik Span Reference

- **spanId:** UUID format, required for Opik PATCH API call
- **traceId:** UUID format, required for audit trail and correlation
- **existingTags:** Non-empty array, required to preserve context when updating
- **Tag Preservation:** When adding `promotion_reviewed`, preserve all existing tags
  - **BAD:** `newTags = ["promotion_reviewed"]`
  - **GOOD:** `newTags = existingTags.concat("promotion_reviewed")`

### Input Boundaries

- **Promotions array:** Non-empty (at least 1 item to promote)
- **Name field:** Non-empty after trim
- **Category field:** Non-null, valid enum value

---

## Error Handling

### Constraint Violations

| Error | Cause | Handling |
|-------|-------|----------|
| Duplicate name | Ingredient already exists in DB | Silently ignore (`ON CONFLICT DO NOTHING`) |
| Invalid category | Category not in 30-item enum | Reject with validation error (HTTP 400) |
| Missing field | Required field null/undefined | Reject with validation error (HTTP 400) |

### Opik API Failures

| Error | Cause | Handling |
|-------|-------|----------|
| Span not found | spanId doesn't exist in Opik | Return error (HTTP 404) |
| PATCH failed | Opik service unavailable | Return error (HTTP 5xx) |
| Malformed tags | existingTags not array or invalid | Reject before API call (HTTP 400) |

---

## No Schema Migrations Required

This feature:
- ✅ Uses existing `ingredients` table structure
- ✅ No new tables created
- ✅ No columns added or modified
- ✅ No indexes added
- ✅ No constraint changes

The `ingredients` table already supports all operations needed:
- Insert new rows with `id`, `name`, `category`, `createdAt`
- UNIQUE constraint on `name` prevents duplicates
- Category enum type supports all 30 valid values

---

## Database Connection

**ORM:** Drizzle ORM 0.45.1

**Config Location:** `apps/nextjs/drizzle.config.ts`

**Schema Location:** `apps/nextjs/src/db/schema/`

**Server Client:**

```typescript
import { createClient } from "@/utils/supabase/server";

const db = createClient();
// Use Drizzle ORM for queries
```

---

## Opik API Integration

**Base URL:** `http://localhost:5173/api` (dev), configurable via `OPIK_URL_OVERRIDE`

**Endpoints Used:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/spans/search` | Query unprocessed spans |
| `PATCH` | `/api/spans/{spanId}` | Update span tags |

**Authentication:** Internal service calls (no auth required for local dev)

---

## Summary

| Aspect | Detail |
|--------|--------|
| **Tables Changed** | 0 (uses existing `ingredients`) |
| **New Columns** | 0 |
| **New Indexes** | 0 |
| **External Service** | Opik (REST API for spans) |
| **Data Insert Pattern** | Batch INSERT with `ON CONFLICT DO NOTHING` |
| **Data Retrieval Pattern** | Query Opik API, filter by tags, deduplicate |
| **State Management** | Opik span tags (`unrecognized_items`, `promotion_reviewed`) |
| **Validation Scope** | Input validation (category enum, required fields) |
| **Concurrency Model** | Last-write-wins (tag appends are idempotent) |
