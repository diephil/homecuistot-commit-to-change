# API Contract: Recipe (Modified)

## POST /api/recipes/apply-proposal

**Change**: `ProposedRecipeIngredient` now carries optional `unrecognizedItemId`. Valid ingredients = has `ingredientId` OR `unrecognizedItemId`.

### Request Body (unchanged shape, modified semantics)

```json
{
  "recipes": [
    {
      "operation": "create",
      "title": "string",
      "description": "string",
      "ingredients": [
        {
          "ingredientId": "uuid | undefined",
          "unrecognizedItemId": "uuid | undefined",
          "name": "string",
          "isRequired": true
        }
      ],
      "matched": [...],
      "unrecognized": [...]
    }
  ]
}
```

### Behavior Change

**handleCreate**: `validIngredients = ingredients.filter(ing => ing.ingredientId || ing.unrecognizedItemId)`

When inserting `recipe_ingredients`:
- If `ingredientId` present → set `ingredientId` column
- If `unrecognizedItemId` present → set `unrecognizedItemId` column
- XOR constraint enforced at DB level

**handleUpdate**: Same pattern — valid = has either ID.

---

## Server Actions (recipes.ts)

### createRecipe() — Modified

```typescript
params.ingredients: Array<{
  ingredientId?: string;
  unrecognizedItemId?: string;
  ingredientType: IngredientType;
}>
```

### updateRecipe() — Modified

Same ingredient param shape as `createRecipe`.

### getRecipes() — Modified

Adds `unrecognizedItem: true` to the `with` clause for `recipeIngredients`.

### validateIngredients() — Modified

After catalog lookup, queries `unrecognized_items` for remaining unmatched names (scoped to current user).

**Return type modified**:
```typescript
{
  matched: Array<{ id: string; name: string }>;
  matchedUnrecognized: Array<{ id: string; rawText: string }>;
  unrecognized: string[];
}
```
