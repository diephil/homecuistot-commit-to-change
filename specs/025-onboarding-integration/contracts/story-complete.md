# Contract: POST /api/onboarding/story/complete

**Change type**: Request schema extension

## Request (MODIFIED)

### Before
```json
{
  "ingredients": ["pasta", "bacon", "egg"],
  "pantryStaples": ["salt", "olive oil"],
  "recipes": [
    {
      "name": "Sarah's Pasta Carbonara",
      "description": "...",
      "ingredients": [
        { "name": "Pasta", "type": "anchor" }
      ]
    }
  ]
}
```

### After
```json
{
  "ingredients": [
    { "name": "pasta", "quantityLevel": 2 },
    { "name": "bacon", "quantityLevel": 0 },
    { "name": "egg", "quantityLevel": 1 }
  ],
  "pantryStaples": [
    { "name": "salt", "quantityLevel": 3 },
    { "name": "olive oil", "quantityLevel": 3 }
  ],
  "recipes": [
    {
      "name": "Sarah's Pasta Carbonara",
      "description": "...",
      "ingredients": [
        { "name": "Pasta", "type": "anchor" }
      ]
    }
  ]
}
```

## Response (unchanged)

```json
{
  "success": true,
  "isNewUser": true,
  "inventoryCreated": 7,
  "recipesCreated": 1,
  "unrecognizedIngredients": 0,
  "unrecognizedRecipeIngredients": 0
}
```

## Persistence Behavior

- Each ingredient is inserted with its provided `quantityLevel` (not hardcoded 3)
- Pantry staples are inserted with `isPantryStaple: true` and their provided `quantityLevel`
- Recipe ingredients: `ensureRecipeIngredientsAtQuantity` still sets missing ingredients at `quantityLevel: 1`
- Only brand-new users (isNewUser=true) get data persisted; returning users get a no-op
