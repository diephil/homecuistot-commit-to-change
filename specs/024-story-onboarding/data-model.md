# Data Model: Story-Based Onboarding

## No New Database Entities

This feature creates **no new tables or columns**. All demo state lives in localStorage during the flow. On completion, it writes to existing tables:
- `user_inventory` (existing)
- `user_recipes` (existing)
- `recipe_ingredients` (existing)

## Client-Side State (localStorage)

### StoryOnboardingState

Stored under key `homecuistot:story-onboarding`.

```typescript
interface StoryOnboardingState {
  currentScene: 1 | 2 | 3 | 4 | 5 | 6 | 7
  demoInventory: DemoInventoryItem[]
  demoRecipe: DemoRecipe
  voiceInputsDone: boolean // true after first successful voice extraction
}
```

### DemoInventoryItem

Client-side representation of an inventory item during the demo. Maps to `InventoryDisplayItem` for component rendering.

```typescript
interface DemoInventoryItem {
  name: string              // Must match ingredients table (case-insensitive)
  category: string          // From INGREDIENT_CATEGORIES
  quantityLevel: QuantityLevel // 0 | 1 | 2 | 3
  isPantryStaple: boolean
  isNew?: boolean           // true if added via voice in Scene 4 (for "just added" label)
}
```

### DemoRecipe

Client-side representation of the carbonara recipe.

```typescript
interface DemoRecipe {
  name: string
  description: string
  ingredients: DemoRecipeIngredient[]
}

interface DemoRecipeIngredient {
  name: string
  type: 'anchor' | 'optional'
}
```

## Data Transformations

### DemoInventoryItem → InventoryDisplayItem

For rendering with `InventorySection`:

```typescript
function toInventoryDisplayItem(item: DemoInventoryItem, index: number): InventoryDisplayItem {
  return {
    id: `demo-${index}`,           // Synthetic ID (not in DB)
    ingredientId: `demo-ing-${index}`, // Synthetic
    name: item.name,
    category: item.category,
    quantityLevel: item.quantityLevel,
    isPantryStaple: item.isPantryStaple,
    updatedAt: new Date(),
  }
}
```

### DemoInventory + DemoRecipe → RecipeWithAvailability

For rendering with `RecipeAvailabilityCard`:

```typescript
function toRecipeWithAvailability(params: {
  recipe: DemoRecipe
  inventory: DemoInventoryItem[]
}): RecipeWithAvailability {
  const { recipe, inventory } = params
  const inventoryMap = new Map(inventory.map(i => [i.name.toLowerCase(), i]))

  const ingredients: IngredientWithAvailability[] = recipe.ingredients.map((ing, idx) => {
    const inv = inventoryMap.get(ing.name.toLowerCase())
    return {
      id: `demo-ring-${idx}`,
      name: ing.name,
      type: ing.type,
      inInventory: inv ? (inv.quantityLevel > 0 || inv.isPantryStaple) : false,
      currentQuantity: inv?.quantityLevel ?? 0,
      isPantryStaple: inv?.isPantryStaple ?? false,
    }
  })

  const anchorIngredients = ingredients.filter(i => i.type === 'anchor')
  const missingAnchors = anchorIngredients.filter(i => !i.inInventory)

  return {
    id: 'demo-carbonara',
    name: recipe.name,
    description: recipe.description,
    ingredients,
    missingAnchorCount: missingAnchors.length,
    missingAnchorNames: missingAnchors.map(i => i.name),
    availability: missingAnchors.length === 0 ? 'available' : 'almost-available',
  }
}
```

## Demo Data Constants

### Sarah's Initial Inventory (Scene 2)

Source: `new-onboarding.md`. Quantity words → QuantityLevel: plenty=3, some=2, enough=2, low=1, critical=0.

| Name | Category | Quantity Word | QuantityLevel | Staple |
|------|----------|--------------|---------------|--------|
| Pasta | cereal | plenty | 3 | No |
| Bacon | meat | some | 2 | No |
| Rice | cereal | some | 2 | No |
| Butter | dairy | enough | 2 | No |
| Milk | dairy | low | 1 | No |
| Parmesan | cheeses | critical | 0 | No |
| Egg | eggs | critical | 0 | No |
| Salt | salt | 3 | 3 | Yes |
| Black pepper | aroma | 3 | 3 | Yes |
| Olive oil | oils_and_fats | 3 | 3 | Yes |

**Key**: Egg (0) and Parmesan (0) → `inInventory = false` → recipe shows as "NOT READY" with missing ingredients.

### Carbonara Recipe

| Ingredient | Type |
|-----------|------|
| Pasta | anchor |
| Bacon | anchor |
| Egg | anchor |
| Parmesan | anchor |
| Black pepper | optional |
| Salt | optional |

### Scene 4 → 5 Progression Gate

Both must be present in `demoInventory` with `quantityLevel > 0`:
- `egg` (case-insensitive match)
- `parmesan` (case-insensitive match)

### Scene 6 Decrement Logic

When "I made this" is triggered, each non-staple anchor ingredient decrements by 1 (floor at 0). Display uses quantity words from `new-onboarding.md`:

| Ingredient | Before | After | Display |
|-----------|--------|-------|---------|
| Pasta | 3 | 2 | plenty → some |
| Bacon | 2 | 1 | some → low |
| Egg | 3 | 2 | plenty → some |
| Parmesan | 3 | 2 | plenty → some |
| Black pepper | ∞ (staple) | ∞ (staple) | NOT TRACKED |
| Salt | ∞ (staple) | ∞ (staple) | NOT TRACKED |

Note: Eggs and Parmesan are at 3 (plenty) by Scene 5 because user added them via voice in Scene 4.

## Completion Payload (Client → Server)

```typescript
interface StoryCompleteRequest {
  ingredients: string[]      // Non-staple ingredient names from demo inventory
  pantryStaples: string[]    // Pantry staple names from demo inventory
  recipes: Array<{
    name: string
    description?: string
    ingredients: Array<{
      name: string
      type: 'anchor' | 'optional'
    }>
  }>
}
```

This maps to the existing `CompleteRequestSchema` pattern from `/api/onboarding/complete`, minus the `id` field on recipe ingredients (server resolves IDs via `matchIngredients`).
