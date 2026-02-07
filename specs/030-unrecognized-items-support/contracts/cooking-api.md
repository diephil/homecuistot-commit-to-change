# API Contract: Cooking (Modified)

## Server Action: markRecipeAsCooked()

**Change**: `ingredientUpdates` entries can carry `unrecognizedItemId`.

### Params (modified)

```typescript
{
  recipeId: string;
  recipeName: string;
  ingredientUpdates: {
    ingredientId: string;
    unrecognizedItemId?: string;
    newQuantity: QuantityLevel;
  }[];
}
```

### Behavior Change

When processing each update:
- If `update.unrecognizedItemId` present → match by `eq(userInventory.unrecognizedItemId, update.unrecognizedItemId)`
- Else → match by `eq(userInventory.ingredientId, update.ingredientId)` (existing behavior)

---

## Server Action: getRecipesWithAvailability()

**Change**: Includes unrecognized items in availability computation.

### Modified Query

```typescript
with: {
  recipeIngredients: {
    with: {
      ingredient: true,
      unrecognizedItem: true  // NEW
    }
  }
}
```

### Modified Inventory Fetch

```typescript
select: {
  ingredientId,
  unrecognizedItemId,  // NEW
  quantityLevel,
  isPantryStaple
}
```

### Modified Availability Logic

Two inventory maps:
- `inventoryMap`: keyed by `ingredientId`
- `unrecognizedInventoryMap`: keyed by `unrecognizedItemId` (NEW)

Include recipe ingredients with `unrecognizedItemId` in availability calculation using `unrecognizedInventoryMap`.
