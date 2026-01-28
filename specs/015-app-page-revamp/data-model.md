# Data Model: App Page Revamp

**Feature**: 015-app-page-revamp | **Date**: 2026-01-28

## Existing Schema (No Changes Required)

### cooking_log
Already exists in `src/db/schema/cooking-log.ts`:

| Field | Type | Constraints |
|-------|------|-------------|
| id | uuid | PK, default random |
| userId | uuid | NOT NULL |
| recipeId | uuid | FK → userRecipes (nullable, ON DELETE SET NULL) |
| recipeName | text | NOT NULL (snapshot for deleted recipes) |
| cookedAt | timestamp with tz | NOT NULL, default now() |

**Indexes**: `idx_cooking_log_user`, `idx_cooking_log_user_date` (userId, cookedAt DESC)

### user_inventory
Already exists in `src/db/schema/user-inventory.ts`:

| Field | Type | Constraints |
|-------|------|-------------|
| id | uuid | PK, default random |
| userId | uuid | NOT NULL |
| ingredientId | uuid | FK → ingredients |
| quantityLevel | smallint | NOT NULL, CHECK 0-3 |
| isPantryStaple | boolean | NOT NULL, default false |
| updatedAt | timestamp with tz | NOT NULL, default now() |

**Unique**: (userId, ingredientId)

### recipe_ingredients
Already exists in `src/db/schema/user-recipes.ts`:

| Field | Type | Constraints |
|-------|------|-------------|
| id | uuid | PK |
| recipeId | uuid | FK → userRecipes (ON DELETE CASCADE) |
| ingredientId | uuid | FK → ingredients (ON DELETE RESTRICT) |
| ingredientType | enum | 'anchor' \| 'optional' \| 'assumed' |
| createdAt | timestamp with tz | NOT NULL |

---

## Derived Types (TypeScript)

### RecipeWithAvailability
Extends existing recipe type with availability metadata:

```typescript
interface RecipeWithAvailability {
  id: string;
  name: string;
  description: string | null;
  ingredients: {
    id: string;           // ingredientId
    name: string;         // ingredient name
    type: IngredientType; // 'anchor' | 'optional' | 'assumed'
    inInventory: boolean; // user has quantity > 0 or isPantryStaple
    currentQuantity: QuantityLevel; // 0-3
  }[];
  // Computed
  missingAnchorCount: number;
  missingAnchorNames: string[];
  availability: 'available' | 'almost-available' | 'unavailable';
}
```

### CookingLogEntry
For display in Cooking History table:

```typescript
interface CookingLogEntry {
  id: string;
  recipeId: string | null; // null if recipe deleted
  recipeName: string;
  cookedAt: Date;
}
```

### MarkCookedPayload
Request body for POST `/api/cooking-log`:

```typescript
interface MarkCookedPayload {
  recipeId: string;
  recipeName: string;
  ingredientUpdates: {
    ingredientId: string;
    newQuantity: QuantityLevel; // 0-3
  }[];
}
```

### IngredientDiff
For modal display:

```typescript
interface IngredientDiff {
  ingredientId: string;
  name: string;
  currentQuantity: QuantityLevel;
  proposedQuantity: QuantityLevel; // default: max(0, current - 1)
}
```

---

## State Transitions

### Recipe Availability States

```
Recipe created
    ↓
[Check anchor ingredients against inventory]
    ↓
┌─────────────────────────────────────────────┐
│ All anchors in stock (qty > 0 or staple)?   │
│   YES → "available"                         │
│   NO  → count missing anchors               │
│         1-2 missing → "almost-available"    │
│         3+ missing  → "unavailable"         │
└─────────────────────────────────────────────┘
```

### Mark as Cooked Flow

```
User clicks "Mark as Cooked"
    ↓
Modal opens (confirmation stage)
    ↓
User adjusts ingredient quantities (optional)
    ↓
User clicks "Save"
    ↓
API: Create cooking_log entry + batch update inventory
    ↓
Modal closes, page revalidates
    ↓
Recipe may move to "almost-available" if ingredients depleted
```

---

## Queries

### Get Recipes with Availability

```typescript
// Pseudocode - actual implementation in server action
const recipes = await getRecipes(); // existing function
const inventory = await getUserInventory();

const inventoryMap = new Map(inventory.map(i => [i.ingredientId, i]));

const recipesWithAvailability = recipes.map(recipe => {
  const ingredients = recipe.ingredients.map(ing => {
    const inv = inventoryMap.get(ing.ingredientId);
    return {
      ...ing,
      inInventory: inv ? (inv.quantityLevel > 0 || inv.isPantryStaple) : false,
      currentQuantity: inv?.quantityLevel ?? 0,
    };
  });

  const anchorIngredients = ingredients.filter(i => i.type === 'anchor');
  const missingAnchors = anchorIngredients.filter(i => !i.inInventory);

  return {
    ...recipe,
    ingredients,
    missingAnchorCount: missingAnchors.length,
    missingAnchorNames: missingAnchors.map(i => i.name),
    availability:
      missingAnchors.length === 0 ? 'available' :
      missingAnchors.length <= 2 ? 'almost-available' : 'unavailable',
  };
});
```

### Get Cooking History (Last 10)

```typescript
const cookingHistory = await db
  .select()
  .from(cookingLog)
  .where(eq(cookingLog.userId, userId))
  .orderBy(desc(cookingLog.cookedAt))
  .limit(10);
```

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| recipeId | Must exist and belong to user | "Recipe not found" |
| ingredientUpdates[].newQuantity | 0 ≤ value ≤ 3 | "Quantity must be 0-3" |
| ingredientUpdates[].ingredientId | Must be anchor ingredient of recipe | "Invalid ingredient" |
