# Data Model: Promote Unrecognized Items to First-Class Ingredients

**Date**: 2026-02-07

## Entity Changes

### unrecognized_items (modified)

| Field | Type | Nullable | Default | Change |
|-------|------|----------|---------|--------|
| id | uuid | NO | random | existing |
| user_id | uuid | NO | - | existing |
| raw_text | text | NO | - | existing |
| context | text | YES | - | existing |
| **category** | **text** | **NO** | **'non_classified'** | **NEW** |
| resolved_at | timestamptz | YES | - | existing |
| created_at | timestamptz | NO | now() | existing |

**Migration**: Add column with default — no backfill needed (default covers existing rows).

### user_inventory (unchanged)

Already has XOR columns + constraints:
- `ingredient_id` (nullable FK to ingredients)
- `unrecognized_item_id` (nullable FK to unrecognized_items)
- XOR check: `(ingredient_id IS NOT NULL) != (unrecognized_item_id IS NOT NULL)`
- Partial unique indexes for both paths

### recipe_ingredients (unchanged)

Already has XOR columns + constraints:
- `ingredient_id` (nullable FK to ingredients)
- `unrecognized_item_id` (nullable FK to unrecognized_items)
- XOR check: `(ingredient_id IS NOT NULL) != (unrecognized_item_id IS NOT NULL)`
- Partial unique indexes for both paths

## Type Changes

### ProposedRecipeIngredient (modified)

```typescript
interface ProposedRecipeIngredient {
  ingredientId?: string;
  unrecognizedItemId?: string;  // NEW — set when matched to unrecognized item
  name: string;
  isRequired: boolean;
}
```

### MatchedRecipeIngredient (modified)

```typescript
interface MatchedRecipeIngredient {
  ingredientId: string;
  unrecognizedItemId?: string;  // NEW — set when source is unrecognized
  name: string;
  isRequired: boolean;
}
```

### InventoryDisplayItem (modified)

```typescript
interface InventoryDisplayItem {
  id: string;
  ingredientId: string;         // empty string for unrecognized items
  unrecognizedItemId?: string;  // NEW — set for unrecognized items
  name: string;
  category: string;
  quantityLevel: QuantityLevel;
  isPantryStaple: boolean;
  updatedAt: Date;
}
```

### IngredientWithAvailability (modified)

```typescript
interface IngredientWithAvailability {
  id: string;
  unrecognizedItemId?: string;  // NEW
  name: string;
  type: IngredientType;
  inInventory: boolean;
  currentQuantity: QuantityLevel;
  isPantryStaple: boolean;
}
```

### IngredientDiff (modified)

```typescript
interface IngredientDiff {
  ingredientId: string;
  unrecognizedItemId?: string;  // NEW
  name: string;
  currentQuantity: QuantityLevel;
  proposedQuantity: QuantityLevel;
  isPantryStaple: boolean;
  isMissing?: boolean;
}
```

### MarkCookedPayload (modified)

```typescript
interface MarkCookedPayload {
  recipeId: string;
  recipeName: string;
  ingredientUpdates: {
    ingredientId: string;
    unrecognizedItemId?: string;  // NEW
    newQuantity: QuantityLevel;
  }[];
}
```

## Query Pattern Changes

### Inventory POST (upsert)

Two branches based on which ID is provided:

```
Branch A (ingredientId): existing behavior
  → onConflictDoUpdate target: [userId, ingredientId]
  → targetWhere: ingredientId IS NOT NULL

Branch B (unrecognizedItemId): NEW
  → onConflictDoUpdate target: [userId, unrecognizedItemId]
  → targetWhere: unrecognizedItemId IS NOT NULL
```

### Recipe queries (with clause)

Add `unrecognizedItem: true` to all `with` clauses that currently only have `ingredient: true`:

- `getRecipes()` in `recipes.ts`
- `getRecipesWithAvailability()` in `cooking-log.ts`

### Agent tool queries

After `ingredients` table lookup, add:
```sql
SELECT id, raw_text FROM unrecognized_items
WHERE user_id = $userId
AND LOWER(raw_text) IN ($names...)
```
