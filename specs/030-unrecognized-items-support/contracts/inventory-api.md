# API Contract: Inventory (Modified)

## POST /api/inventory

**Change**: Accept `unrecognizedItemId` as alternative to `ingredientId`.

### Request Body (modified)

```json
{
  "ingredientId": "uuid | undefined",
  "unrecognizedItemId": "uuid | undefined",
  "quantityLevel": 0-3
}
```

**Validation**: Exactly one of `ingredientId` or `unrecognizedItemId` must be provided.

### Response (unchanged)

```json
{
  "success": true,
  "item": { /* user_inventory row */ }
}
```

### Error Cases

- 400: Neither ID provided
- 400: Both IDs provided
- 400: Invalid quantity level
- 500: Database error

---

## GET /api/inventory (unchanged)

Already returns both `ingredientId` and `unrecognizedItemId` fields.

## PATCH /api/inventory/:id/toggle-staple (unchanged)

Uses inventory row `id` — works for both recognized and unrecognized items.

## DELETE /api/inventory/:id (unchanged)

Uses inventory row `id` — works for both recognized and unrecognized items.
