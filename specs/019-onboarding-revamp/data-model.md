# Data Model: Onboarding Steps 2 & 3 Revamp

**Branch**: `019-onboarding-revamp` | **Date**: 2026-01-31

## Entities

### Existing Entities (No Schema Changes)

#### ingredients
- **id**: UUID (PK)
- **name**: text (unique, 5931 records)
- **category**: IngredientCategory enum (30 categories)
- **createdAt**: timestamp

#### user_inventory
- **id**: UUID (PK)
- **userId**: UUID
- **ingredientId**: UUID (FK, nullable)
- **unrecognizedItemId**: UUID (FK, nullable)
- **quantityLevel**: 0-3 (default 3)
- **isPantryStaple**: boolean
- **updatedAt**: timestamp
- XOR constraint: exactly one of ingredientId/unrecognizedItemId

#### unrecognized_items
- **id**: UUID (PK)
- **userId**: UUID
- **rawText**: text
- **context**: text (nullable, e.g., "ingredient")
- **resolvedAt**: timestamp (nullable)
- **createdAt**: timestamp

#### user_recipes
- **id**: UUID (PK)
- **name**: text
- **description**: text (nullable)
- **userId**: UUID
- **createdAt**: timestamp
- **updatedAt**: timestamp

#### recipe_ingredients
- **id**: UUID (PK)
- **recipeId**: UUID (FK, cascade delete)
- **ingredientId**: UUID (FK, nullable)
- **unrecognizedItemId**: UUID (FK, nullable)
- **ingredientType**: 'anchor' | 'optional' | 'assumed'
- **createdAt**: timestamp
- XOR constraint: exactly one of ingredientId/unrecognizedItemId

### New Static Types (TypeScript Only)

#### StaticIngredient
```typescript
interface StaticIngredient {
  name: string;  // singular form, must exist in ingredients table
}
```

#### StaticDishIngredient
```typescript
interface StaticDishIngredient {
  name: string;  // singular form
  type: 'anchor' | 'optional';
}
```

#### StaticDish
```typescript
interface StaticDish {
  title: string;
  description: string;
  ingredients: StaticDishIngredient[];
}
```

#### CookingSkill
```typescript
type CookingSkill = 'basic' | 'advanced';
```

### New Service Types

#### IngredientMatchResult
```typescript
interface IngredientMatchResult {
  ingredients: Array<{ id: string; name: string }>;
  unrecognizedItems: Array<{ id: string; rawText: string }>;
  unrecognizedItemsToCreate: string[];
}
```

#### IngredientExtractionResponse
```typescript
// LLM response schema
const IngredientExtractionSchema = z.object({
  ingredients_to_add: z.array(z.string()),
  ingredients_to_remove: z.array(z.string()),
});

type IngredientExtractionResponse = z.infer<typeof IngredientExtractionSchema>;
```

## Static Data Definitions

### COMMON_INGREDIENTS (17 items)
```typescript
const COMMON_INGREDIENTS: StaticIngredient[] = [
  { name: 'pasta' },
  { name: 'rice' },
  { name: 'salt' },
  { name: 'egg' },
  { name: 'garlic' },
  { name: 'bread' },
  { name: 'tomato' },
  { name: 'honey' },
  { name: 'noodle' },
  { name: 'bacon' },
  { name: 'milk' },
  { name: 'cheese' },
  { name: 'chicken' },
  { name: 'cream' },
  { name: 'onion' },
  { name: 'olive oil' },
  { name: 'butter' },
];
```

### BASIC_RECIPES (8 items)
```typescript
const BASIC_RECIPES: StaticDish[] = [
  {
    title: 'Scrambled Egg',
    description: 'Fluffy eggs cooked with butter',
    ingredients: [
      { name: 'egg', type: 'anchor' },
      { name: 'butter', type: 'anchor' },
      { name: 'salt', type: 'optional' },
    ],
  },
  {
    title: 'Pasta Carbonara',
    description: 'Creamy pasta with bacon and egg',
    ingredients: [
      { name: 'pasta', type: 'anchor' },
      { name: 'bacon', type: 'anchor' },
      { name: 'egg', type: 'anchor' },
      { name: 'cheese', type: 'optional' },
    ],
  },
  {
    title: 'Pancake',
    description: 'Fluffy breakfast pancakes',
    ingredients: [
      { name: 'flour', type: 'anchor' },
      { name: 'egg', type: 'anchor' },
      { name: 'milk', type: 'anchor' },
      { name: 'sugar', type: 'optional' },
    ],
  },
  {
    title: 'Mushroom Omelette',
    description: 'Eggs with sauteed mushrooms',
    ingredients: [
      { name: 'egg', type: 'anchor' },
      { name: 'mushroom', type: 'anchor' },
      { name: 'butter', type: 'optional' },
    ],
  },
  {
    title: 'Spaghetti Aglio e Olio',
    description: 'Pasta with garlic and olive oil',
    ingredients: [
      { name: 'pasta', type: 'anchor' },
      { name: 'garlic', type: 'anchor' },
      { name: 'olive oil', type: 'anchor' },
      { name: 'chili flake', type: 'optional' },
    ],
  },
  {
    title: 'Grilled Chicken and Rice',
    description: 'Simple grilled chicken with rice',
    ingredients: [
      { name: 'chicken', type: 'anchor' },
      { name: 'rice', type: 'anchor' },
      { name: 'salt', type: 'optional' },
    ],
  },
  {
    title: 'Roasted Potato',
    description: 'Crispy oven-roasted potatoes',
    ingredients: [
      { name: 'potato', type: 'anchor' },
      { name: 'olive oil', type: 'anchor' },
      { name: 'rosemary', type: 'optional' },
    ],
  },
  {
    title: 'Roasted Vegetable',
    description: 'Mixed vegetables roasted to perfection',
    ingredients: [
      { name: 'zucchini', type: 'anchor' },
      { name: 'bell pepper', type: 'anchor' },
      { name: 'olive oil', type: 'anchor' },
      { name: 'garlic', type: 'optional' },
    ],
  },
];
```

### ADVANCED_RECIPES (8 additional items)
```typescript
const ADVANCED_RECIPES: StaticDish[] = [
  {
    title: 'Teriyaki Chicken',
    description: 'Sweet and savory glazed chicken',
    ingredients: [
      { name: 'chicken', type: 'anchor' },
      { name: 'soy sauce', type: 'anchor' },
      { name: 'honey', type: 'anchor' },
      { name: 'ginger', type: 'optional' },
    ],
  },
  {
    title: 'Caesar Salad',
    description: 'Classic salad with creamy dressing',
    ingredients: [
      { name: 'lettuce', type: 'anchor' },
      { name: 'cheese', type: 'anchor' },
      { name: 'crouton', type: 'optional' },
      { name: 'anchovy', type: 'optional' },
    ],
  },
  {
    title: 'Cheese Quesadilla',
    description: 'Crispy tortilla with melted cheese',
    ingredients: [
      { name: 'tortilla', type: 'anchor' },
      { name: 'cheese', type: 'anchor' },
      { name: 'bell pepper', type: 'optional' },
    ],
  },
  {
    title: 'Miso Soup',
    description: 'Traditional Japanese soup',
    ingredients: [
      { name: 'miso paste', type: 'anchor' },
      { name: 'tofu', type: 'anchor' },
      { name: 'seaweed', type: 'optional' },
      { name: 'green onion', type: 'optional' },
    ],
  },
  {
    title: 'Cheeseburger',
    description: 'Classic beef burger with cheese',
    ingredients: [
      { name: 'ground beef', type: 'anchor' },
      { name: 'cheese', type: 'anchor' },
      { name: 'bread', type: 'anchor' },
      { name: 'lettuce', type: 'optional' },
    ],
  },
  {
    title: 'Moussaka',
    description: 'Greek layered eggplant casserole',
    ingredients: [
      { name: 'eggplant', type: 'anchor' },
      { name: 'ground beef', type: 'anchor' },
      { name: 'tomato', type: 'anchor' },
      { name: 'bechamel sauce', type: 'optional' },
    ],
  },
  {
    title: 'Grilled Salmon and Lemon',
    description: 'Salmon with fresh lemon',
    ingredients: [
      { name: 'salmon', type: 'anchor' },
      { name: 'lemon', type: 'anchor' },
      { name: 'olive oil', type: 'optional' },
      { name: 'dill', type: 'optional' },
    ],
  },
  {
    title: 'Veal Blanquette',
    description: 'French creamy veal stew',
    ingredients: [
      { name: 'veal', type: 'anchor' },
      { name: 'cream', type: 'anchor' },
      { name: 'carrot', type: 'anchor' },
      { name: 'mushroom', type: 'optional' },
    ],
  },
];
```

## State Transitions

### Onboarding Flow State

```
Step 1 (Welcome)
    ↓ click "Get Started"
Step 2 (Skill + Ingredients)
    ├── skill: null → 'basic' | 'advanced'
    ├── ingredientsSection: hidden → visible (when skill selected)
    └── selectedIngredients: [] → [...names]
    ↓ click "Next Step" (requires skill + 1+ ingredients)
Step 3 (Add More)
    ├── displayedIngredients: [...step2 selections]
    ├── voice/text input → LLM → add/remove
    └── Complete Setup enabled (requires 1+ ingredients)
    ↓ click "Complete Setup"
Step 4 (Completion)
    └── Loading/preparation shown during persist
```

## Validation Rules

### From Spec

- **FR-006**: Exactly 16 common ingredients displayed
- **FR-007**: "Next Step" enabled only with 1+ ingredient selected
- **FR-013**: "Complete Setup" enabled only with 1+ ingredient in list
- **FR-024**: LLM normalizes ingredient names to singular form
- **FR-029**: Prioritize ingredients table match over unrecognized_items
- **FR-031**: Recognized ingredients → user_inventory with quantity_level=3
- **FR-034/035**: Basic skill = 8 recipes; Advanced = 16 recipes
