# API Contract: Cooking Log

**Feature**: 015-app-page-revamp | **Date**: 2026-01-28

## POST /api/cooking-log

Creates a cooking log entry and updates ingredient quantities in a single transaction.

### Request

**Headers**:
- `Content-Type: application/json`
- `Cookie: sb-*` (Supabase auth session)

**Body**:
```typescript
{
  recipeId: string;      // UUID of the recipe
  recipeName: string;    // Snapshot of recipe name
  ingredientUpdates: {
    ingredientId: string;    // UUID of ingredient
    newQuantity: 0 | 1 | 2 | 3;  // New quantity level
  }[];
}
```

### Response

**Success (200)**:
```typescript
{
  success: true;
  cookingLogId: string;  // UUID of created log entry
  updatedAt: string;     // ISO timestamp
}
```

**Validation Error (400)**:
```typescript
{
  success: false;
  error: string;  // "Quantity must be 0-3" | "Invalid ingredient"
}
```

**Unauthorized (401)**:
```typescript
{
  success: false;
  error: "Unauthorized"
}
```

**Not Found (404)**:
```typescript
{
  success: false;
  error: "Recipe not found"
}
```

**Server Error (500)**:
```typescript
{
  success: false;
  error: "Failed to log cooking"
}
```

### Transaction Steps

1. Verify user authentication via Supabase session
2. Verify recipe exists and belongs to user
3. Validate all ingredientIds are anchor ingredients of the recipe
4. Validate all newQuantity values are 0-3
5. Begin transaction:
   a. Insert cooking_log entry
   b. Upsert user_inventory for each ingredient update
6. Commit transaction
7. Revalidate `/app` path for ISR

### Example

**Request**:
```bash
curl -X POST /api/cooking-log \
  -H "Content-Type: application/json" \
  -d '{
    "recipeId": "123e4567-e89b-12d3-a456-426614174000",
    "recipeName": "Chicken and Rice",
    "ingredientUpdates": [
      { "ingredientId": "abc123", "newQuantity": 1 },
      { "ingredientId": "def456", "newQuantity": 0 }
    ]
  }'
```

**Response**:
```json
{
  "success": true,
  "cookingLogId": "789ghi12-e89b-12d3-a456-426614174001",
  "updatedAt": "2026-01-28T14:30:00.000Z"
}
```

---

## GET /api/cooking-log (Optional - Not in MVP)

Reserved for future: List cooking history with pagination.

---

## Server Actions (Alternative)

For simpler implementation, can use server actions instead of API route:

### markRecipeAsCooked

```typescript
'use server'

export async function markRecipeAsCooked(params: {
  recipeId: string;
  recipeName: string;
  ingredientUpdates: { ingredientId: string; newQuantity: QuantityLevel }[];
}): Promise<{ success: boolean; error?: string }> {
  // Same transaction logic as API route
}
```

**Recommendation**: Use server action for MVP (simpler, no CORS, automatic serialization). API route only if external clients needed.
