# Data Model: Base Pages UI Foundation

**Date**: 2026-01-20
**Context**: Mock data type definitions for visual-only UI (no persistence)

---

## Mock Data Types

### Dish

Represents a selectable dish during onboarding.

```typescript
const MOCK_DISHES = [
  { id: '1', name: 'Pasta Carbonara', isSelected: true },
  { id: '2', name: 'Chicken Stir Fry', isSelected: false },
  { id: '3', name: 'Vegetable Soup', isSelected: true },
  { id: '4', name: 'Grilled Cheese Sandwich', isSelected: false },
  { id: '5', name: 'Scrambled Eggs', isSelected: true },
  { id: '6', name: 'Fried Rice', isSelected: false },
  { id: '7', name: 'Tomato Salad', isSelected: true },
] as const;

type Dish = typeof MOCK_DISHES[number];
// Inferred: { readonly id: string; readonly name: string; readonly isSelected: boolean }
```

**Fields**:
- `id`: Unique identifier (string)
- `name`: Display name for the dish
- `isSelected`: Visual highlight state for onboarding preview (not functional)

**Quantity**: 5-10 items (spec requirement)

---

### Ingredient

Represents an ingredient in fridge or pantry.

```typescript
type IngredientCategory = 'fridge' | 'pantry';
type QuantityLevel = 0 | 1 | 2 | 3;

const MOCK_FRIDGE_INGREDIENTS = [
  { id: '1', name: 'Tomatoes', category: 'fridge' as const, quantityLevel: 3 as QuantityLevel },
  { id: '2', name: 'Eggs', category: 'fridge' as const, quantityLevel: 1 as QuantityLevel },
  { id: '3', name: 'Milk', category: 'fridge' as const, quantityLevel: 2 as QuantityLevel },
  { id: '4', name: 'Cheese', category: 'fridge' as const, quantityLevel: 3 as QuantityLevel },
  { id: '5', name: 'Lettuce', category: 'fridge' as const, quantityLevel: 0 as QuantityLevel },
  { id: '6', name: 'Chicken Breast', category: 'fridge' as const, quantityLevel: 2 as QuantityLevel },
  { id: '7', name: 'Bell Peppers', category: 'fridge' as const, quantityLevel: 1 as QuantityLevel },
] as const;

const MOCK_PANTRY_INGREDIENTS = [
  { id: '8', name: 'Pasta', category: 'pantry' as const, quantityLevel: 3 as QuantityLevel },
  { id: '9', name: 'Rice', category: 'pantry' as const, quantityLevel: 2 as QuantityLevel },
  { id: '10', name: 'Flour', category: 'pantry' as const, quantityLevel: 1 as QuantityLevel },
  { id: '11', name: 'Sugar', category: 'pantry' as const, quantityLevel: 3 as QuantityLevel },
  { id: '12', name: 'Salt', category: 'pantry' as const, quantityLevel: 3 as QuantityLevel },
  { id: '13', name: 'Olive Oil', category: 'pantry' as const, quantityLevel: 2 as QuantityLevel },
  { id: '14', name: 'Soy Sauce', category: 'pantry' as const, quantityLevel: 1 as QuantityLevel },
] as const;

type Ingredient = typeof MOCK_FRIDGE_INGREDIENTS[number] | typeof MOCK_PANTRY_INGREDIENTS[number];
```

**Fields**:
- `id`: Unique identifier (string)
- `name`: Ingredient name (subject to truncation if long, FR-020)
- `category`: 'fridge' or 'pantry' (for grouping)
- `quantityLevel`: 0 (none), 1 (low), 2 (medium), 3 (full) - visual indicator only

**Quantity**: 5-10 items per category (14 total across fridge + pantry)

---

### Recipe

Represents a recipe with ingredients and availability status.

```typescript
const MOCK_RECIPES = [
  {
    id: '1',
    title: 'Pasta Carbonara',
    description: 'Classic Italian pasta with eggs, cheese, and bacon.',
    ingredients: ['Pasta', 'Eggs', 'Cheese', 'Salt'],
    isAvailable: true, // All ingredients present
  },
  {
    id: '2',
    title: 'Chicken Stir Fry',
    description: 'Quick and healthy stir fry with vegetables.',
    ingredients: ['Chicken Breast', 'Bell Peppers', 'Soy Sauce', 'Rice'],
    isAvailable: true,
  },
  {
    id: '3',
    title: 'Vegetable Soup',
    description: 'Warm and comforting soup with fresh vegetables.',
    ingredients: ['Tomatoes', 'Lettuce', 'Salt', 'Olive Oil'],
    isAvailable: false, // Missing 1-2 ingredients
  },
  {
    id: '4',
    title: 'Grilled Cheese Sandwich',
    description: 'Crispy bread with melted cheese.',
    ingredients: ['Cheese', 'Bread', 'Butter'],
    isAvailable: false, // Missing bread, butter
  },
  {
    id: '5',
    title: 'Scrambled Eggs',
    description: 'Fluffy scrambled eggs with a pinch of salt.',
    ingredients: ['Eggs', 'Milk', 'Salt'],
    isAvailable: true,
  },
  {
    id: '6',
    title: 'Fried Rice',
    description: 'Flavorful rice with vegetables and soy sauce.',
    ingredients: ['Rice', 'Eggs', 'Soy Sauce', 'Bell Peppers'],
    isAvailable: true,
  },
  {
    id: '7',
    title: 'Tomato Salad',
    description: 'Fresh salad with tomatoes, lettuce, and olive oil.',
    ingredients: ['Tomatoes', 'Lettuce', 'Olive Oil'],
    isAvailable: true,
  },
  {
    id: '8',
    title: 'Pancakes',
    description: 'Fluffy pancakes with sugar and syrup.',
    ingredients: ['Flour', 'Eggs', 'Milk', 'Sugar', 'Syrup'],
    isAvailable: false, // Missing syrup
  },
] as const;

type Recipe = typeof MOCK_RECIPES[number];
```

**Fields**:
- `id`: Unique identifier (string)
- `title`: Recipe name (subject to truncation if long, FR-020)
- `description`: Brief description (displayed in card, FR-017)
- `ingredients`: Array of ingredient names (string[])
- `isAvailable`: Boolean indicating if all ingredients are in inventory (determines suggestion page section)

**Quantity**: 8 recipes (5-10 range, mix of available/almost-available for visual testing)

---

## Mock Data Usage Patterns

### Page-Level Constants

All mock data declared at top of page.tsx files:

```typescript
// apps/nextjs/src/app/(protected)/suggestions/page.tsx

const MOCK_RECIPES = [ /* ... */ ] as const;

export default function SuggestionsPage() {
  const availableRecipes = MOCK_RECIPES.filter(r => r.isAvailable);
  const almostAvailableRecipes = MOCK_RECIPES.filter(r => !r.isAvailable);

  return (
    <div>
      <section>{/* Available recipes */}</section>
      <section>{/* Almost available recipes */}</section>
    </div>
  );
}
```

### Type Safety via Const Assertions

```typescript
// Inferred type from const assertion
type QuantityLevel = typeof MOCK_FRIDGE_INGREDIENTS[number]['quantityLevel'];
// Result: 0 | 1 | 2 | 3 (literal union, not number)

// Component props derive from mock data
interface IngredientListProps {
  ingredients: readonly typeof MOCK_FRIDGE_INGREDIENTS;
}
```

### Empty State Handling

```typescript
// Empty state example
const MOCK_EMPTY_RECIPES = [] as const;

{MOCK_EMPTY_RECIPES.length === 0 && (
  <div className="flex flex-col items-center gap-2">
    <EmptyPlateIcon className="w-12 h-12" />
    <p className="text-sm">No recipes yet</p>
  </div>
)}
```

---

## Data Relationships

```text
Dish ──(displayed in)──> Onboarding Step 2
Ingredient ──(displayed in)──> Onboarding Steps 2 & 3, Inventory Page
Recipe ──(references)──> Ingredient (by name)
Recipe.isAvailable ──(determines section)──> Suggestions Page (available vs almost-available)
```

**Note**: No actual relationships enforced (mock data only, no foreign keys, no normalization needed).

---

## Validation Rules

None required (mock data only, no user inputs, no database operations). Visual-only implementation per spec constraints.
