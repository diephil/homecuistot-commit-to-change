# Admin Dashboard: Unrecognized Ingredient Promotion

## Goal

Admin page to review unrecognized ingredients captured during recipe operations (via Opik LLM tracing) and promote them into the `ingredients` database table with a proper category.

## Context

When users create or update recipes, the LLM sometimes encounters ingredient names that don't match our 5,931-entry `ingredients` table. These unrecognized items are logged as **Opik spans** with specific tags and metadata. Currently, no one reviews these. This feature lets an admin process them one span at a time.

## Data Source: Opik Spans

Spans containing unrecognized items share these characteristics:

| Property            | Value                                                                              |
| ------------------- | ---------------------------------------------------------------------------------- |
| **Span names**      | `create_recipes`, `create_recipe`, `update_recipes`, `update_matching_ingredients` |
| **Tag**             | `unrecognized_items` (always present)                                              |
| **Tag**             | `user:<uuid>` (sometimes present, identifies the user)                             |
| **Metadata format** | `{ totalUnrecognized: number, unrecognized: string[] }`                            |

**Example metadata:**

```yaml
totalUnrecognized: 2
unrecognized:
  - cornichon
  - pickled onion
```

## Workflow

### 1. Fetch Next Unprocessed Span

Search Opik for spans tagged `unrecognized_items` that are **NOT** tagged `promotion_reviewed`.

**API:** `POST /api/v1/private/spans/search`

```json
{
  "project_name": "<project>",
  "filters": [
    { "field": "tags", "operator": "contains", "value": "unrecognized_items" },
    { "field": "tags", "operator": "not_contains", "value": "promotion_reviewed" }
  ],
  "limit": 1
}
```

### 2. Extract & Deduplicate Unrecognized Items

From the span's `metadata.unrecognized` array:

- Extract all ingredient names
- Deduplicate (same ingredient may appear multiple times across spans)
- Check each against the `ingredients` DB table
- Only display items **not already in the database**

### 3. Admin Review

For each unrecognized item, the admin sees:

- The ingredient name (e.g., "cornichon")
- A category dropdown with the 30 available categories (meat, dairy, vegetables, fruit, etc.)
- Option to skip/dismiss items that aren't real ingredients (e.g., "car", "msg")

### 4. Promote

When the admin clicks **Save/Promote**:

1. Insert each approved item into the `ingredients` table with the selected category
2. Tag the span as `promotion_reviewed` via Opik API so it won't appear again
3. Automatically load the next unprocessed span

**API to tag span:** `PATCH /api/v1/private/spans/{id}`

```json
{
  "trace_id": "<from span>",
  "tags": ["unrecognized_items", "user:<uuid>", "promotion_reviewed"]
}
```

### 5. Repeat

A **"Search Next Span"** button lets the admin continue processing spans sequentially until none remain.

## Existing Infrastructure

| Component                  | Location                                       | Status                                          |
| -------------------------- | ---------------------------------------------- | ----------------------------------------------- |
| Admin layout               | `apps/nextjs/src/app/(admin)/admin/layout.tsx` | Exists (header + auth)                          |
| Admin page                 | `apps/nextjs/src/app/(admin)/admin/page.tsx`   | Placeholder ("Demo In Progress")                |
| Admin API dir              | `apps/nextjs/src/app/api/admin/`               | Empty                                           |
| `ingredients` table        | `src/db/schema/ingredients.ts`                 | 5,931 rows, `{ id, name, category, createdAt }` |
| `unrecognized_items` table | `src/db/schema/unrecognized-items.ts`          | Exists (separate from Opik spans)               |
| 30 categories              | `src/db/schema/enums.ts`                       | `INGREDIENT_CATEGORIES` constant                |
| Opik                       | `infra/opik/`                                  | Running at `localhost:5173`                     |

## Ingredient Categories (for the dropdown)

`meat`, `cereal`, `fish`, `molluscs`, `crustaceans`, `bee_ingredients`, `synthesized`, `poultry`, `eggs`, `dairy`, `fruit`, `vegetables`, `beans`, `nuts`, `seed`, `plants`, `mushroom`, `cheeses`, `oils_and_fats`, `non_classified`, `e100_e199`, `ferments`, `salt`, `starch`, `alcohol`, `aroma`, `cocoa`, `water`, `parts`, `compound_ingredients`

## Unresolved Questions

- What project_name/project_id to use in span search filter?
- ~~Should dismissed/skipped items also get a different tag?~~ Resolved: `promotion_reviewed` applies whether items were promoted or skipped.
- Should the admin be able to process multiple spans at once, or strictly one-by-one?
- Should there be a relationship between promoted ingredients and the existing `unrecognized_items` DB table (mark as `resolvedAt`)?
- Auth: is the existing admin layout sufficient, or does this need additional role-based access control?
