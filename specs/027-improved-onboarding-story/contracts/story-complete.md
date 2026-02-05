# Contract: POST /api/onboarding/story/complete

## Change Summary

No contract changes. The payload already supports a `recipes` array. The only change is that the frontend now sends multiple recipes instead of a single-element array.

## Request Body (unchanged)

```json
{
  "ingredients": [
    { "name": "Pasta", "quantityLevel": 3 },
    { "name": "Bacon", "quantityLevel": 1 }
  ],
  "pantryStaples": [
    { "name": "Salt", "quantityLevel": 3 },
    { "name": "Olive oil", "quantityLevel": 3 }
  ],
  "recipes": [
    {
      "name": "Sarah's Pasta Carbonara",
      "description": "...",
      "ingredients": [
        { "name": "Pasta", "type": "anchor" },
        { "name": "Egg", "type": "anchor" }
      ]
    },
    {
      "name": "User's Bolognese",
      "description": "...",
      "ingredients": [
        { "name": "Ground beef", "type": "anchor" },
        { "name": "Tomato", "type": "anchor" }
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
  "inventoryCreated": 9,
  "recipesCreated": 2,
  "unrecognizedIngredients": 0,
  "unrecognizedRecipeIngredients": 0
}
```

## Behavioral Note

`prefillDemoData()` already iterates the `recipes` array and creates one `user_recipes` row + N `recipe_ingredients` rows per recipe. No backend changes needed.
