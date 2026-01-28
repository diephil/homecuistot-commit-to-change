# Data Model: Demo Data Reset

**Feature**: 017-demo-data-reset | **Date**: 2026-01-28

## Overview

Demo data consists of:
- 21 inventory items (9 available + 12 pantry staples)
- 6 recipes with ~25 total ingredient associations

## Demo Inventory Data

### Available Ingredients (isPantryStaple: false)

| name         | quantityLevel | isPantryStaple |
|--------------|---------------|----------------|
| bread        | 3             | false          |
| butter       | 3             | false          |
| egg          | 3             | false          |
| eggs         | 3             | false          |
| garlic       | 1             | false          |
| milk         | 3             | false          |
| onions       | 2             | false          |
| peanut butter| 3             | false          |
| spaghetti    | 2             | false          |

### Pantry Staples (isPantryStaple: true)

| name          | quantityLevel | isPantryStaple |
|---------------|---------------|----------------|
| baking powder | 3             | true           |
| beans         | 3             | true           |
| black pepper  | 3             | true           |
| flour         | 3             | true           |
| honey         | 3             | true           |
| noodles       | 3             | true           |
| olive oil     | 3             | true           |
| pasta         | 3             | true           |
| rice          | 3             | true           |
| salt          | 3             | true           |
| soy sauce     | 3             | true           |
| sugar         | 3             | true           |

## Demo Recipes Data

| name                   | description                                                                  |
|------------------------|------------------------------------------------------------------------------|
| Scrambled Eggs         | Simple and fluffy eggs cooked in a pan, perfect for breakfast.               |
| Pasta Carbonara        | Classic Italian pasta dish with creamy egg sauce, bacon, and parmesan.       |
| Egg Fried Rice         | Delicious and savory fried rice with fluffy egg, vegetables, and soy sauce.  |
| Mushroom Omelette      | Fluffy omelette filled with savory and earthy sauteed mushroom.              |
| Spaghetti Aglio e Olio | Simple yet flavorful spaghetti with garlic, olive oil, chili flakes.         |
| Caesar Salad           | Classic salad with romaine lettuce, croutons, parmesan, and Caesar dressing. |

## Recipe Ingredients Mapping

### Scrambled Eggs
| ingredientName | ingredientType |
|----------------|----------------|
| egg            | anchor         |
| milk           | anchor         |
| butter         | anchor         |
| salt           | optional       |
| black pepper   | optional       |

### Pasta Carbonara
| ingredientName | ingredientType |
|----------------|----------------|
| pasta          | anchor         |
| egg            | anchor         |
| bacon          | anchor         |
| parmesan       | anchor         |
| salt           | optional       |
| black pepper   | optional       |

### Egg Fried Rice
| ingredientName | ingredientType |
|----------------|----------------|
| rice           | anchor         |
| egg            | anchor         |
| soy sauce      | anchor         |
| vegetable      | anchor         |
| salt           | optional       |

### Mushroom Omelette
| ingredientName | ingredientType |
|----------------|----------------|
| egg            | anchor         |
| mushroom       | anchor         |
| butter         | optional       |
| salt           | optional       |
| black pepper   | optional       |

### Spaghetti Aglio e Olio
| ingredientName | ingredientType |
|----------------|----------------|
| spaghetti      | anchor         |
| garlic         | anchor         |
| olive oil      | anchor         |
| salt           | optional       |
| black pepper   | optional       |

### Caesar Salad
| ingredientName | ingredientType |
|----------------|----------------|
| romaine lettuce| anchor         |
| crouton        | anchor         |
| parmesan       | anchor         |
| salt           | optional       |
| black pepper   | optional       |

## TypeScript Data Structure

```typescript
// apps/nextjs/src/db/demo-data.ts

export const DEMO_INVENTORY = [
  // Available ingredients
  { name: 'bread', quantityLevel: 3, isPantryStaple: false },
  { name: 'butter', quantityLevel: 3, isPantryStaple: false },
  { name: 'egg', quantityLevel: 3, isPantryStaple: false },
  { name: 'eggs', quantityLevel: 3, isPantryStaple: false },
  { name: 'garlic', quantityLevel: 1, isPantryStaple: false },
  { name: 'milk', quantityLevel: 3, isPantryStaple: false },
  { name: 'onions', quantityLevel: 2, isPantryStaple: false },
  { name: 'peanut butter', quantityLevel: 3, isPantryStaple: false },
  { name: 'spaghetti', quantityLevel: 2, isPantryStaple: false },
  // Pantry staples
  { name: 'baking powder', quantityLevel: 3, isPantryStaple: true },
  { name: 'beans', quantityLevel: 3, isPantryStaple: true },
  { name: 'black pepper', quantityLevel: 3, isPantryStaple: true },
  { name: 'flour', quantityLevel: 3, isPantryStaple: true },
  { name: 'honey', quantityLevel: 3, isPantryStaple: true },
  { name: 'noodles', quantityLevel: 3, isPantryStaple: true },
  { name: 'olive oil', quantityLevel: 3, isPantryStaple: true },
  { name: 'pasta', quantityLevel: 3, isPantryStaple: true },
  { name: 'rice', quantityLevel: 3, isPantryStaple: true },
  { name: 'salt', quantityLevel: 3, isPantryStaple: true },
  { name: 'soy sauce', quantityLevel: 3, isPantryStaple: true },
  { name: 'sugar', quantityLevel: 3, isPantryStaple: true },
] as const

export const DEMO_RECIPES = [
  {
    name: 'Scrambled Eggs',
    description: 'Simple and fluffy eggs cooked in a pan, perfect for breakfast.',
    ingredients: [
      { name: 'egg', type: 'anchor' },
      { name: 'milk', type: 'anchor' },
      { name: 'butter', type: 'anchor' },
      { name: 'salt', type: 'optional' },
      { name: 'black pepper', type: 'optional' },
    ],
  },
  {
    name: 'Pasta Carbonara',
    description: 'Classic Italian pasta dish with creamy egg sauce, bacon, and parmesan.',
    ingredients: [
      { name: 'pasta', type: 'anchor' },
      { name: 'egg', type: 'anchor' },
      { name: 'bacon', type: 'anchor' },
      { name: 'parmesan', type: 'anchor' },
      { name: 'salt', type: 'optional' },
      { name: 'black pepper', type: 'optional' },
    ],
  },
  {
    name: 'Egg Fried Rice',
    description: 'Delicious and savory fried rice with fluffy egg, vegetables, and soy sauce.',
    ingredients: [
      { name: 'rice', type: 'anchor' },
      { name: 'egg', type: 'anchor' },
      { name: 'soy sauce', type: 'anchor' },
      { name: 'vegetable', type: 'anchor' },
      { name: 'salt', type: 'optional' },
    ],
  },
  {
    name: 'Mushroom Omelette',
    description: 'Fluffy omelette filled with savory and earthy sauteed mushroom.',
    ingredients: [
      { name: 'egg', type: 'anchor' },
      { name: 'mushroom', type: 'anchor' },
      { name: 'butter', type: 'optional' },
      { name: 'salt', type: 'optional' },
      { name: 'black pepper', type: 'optional' },
    ],
  },
  {
    name: 'Spaghetti Aglio e Olio',
    description: 'Simple yet flavorful spaghetti with garlic, olive oil, chili flakes.',
    ingredients: [
      { name: 'spaghetti', type: 'anchor' },
      { name: 'garlic', type: 'anchor' },
      { name: 'olive oil', type: 'anchor' },
      { name: 'salt', type: 'optional' },
      { name: 'black pepper', type: 'optional' },
    ],
  },
  {
    name: 'Caesar Salad',
    description: 'Classic salad with romaine lettuce, croutons, parmesan, and Caesar dressing.',
    ingredients: [
      { name: 'romaine lettuce', type: 'anchor' },
      { name: 'crouton', type: 'anchor' },
      { name: 'parmesan', type: 'anchor' },
      { name: 'salt', type: 'optional' },
      { name: 'black pepper', type: 'optional' },
    ],
  },
] as const

// Derived type for type safety
export type DemoInventoryItem = (typeof DEMO_INVENTORY)[number]
export type DemoRecipe = (typeof DEMO_RECIPES)[number]
```

## All Required Ingredient Names

Unique ingredient names needed in the ingredients table:

```
bacon, baking powder, beans, black pepper, bread, butter, crouton,
egg, eggs, flour, garlic, honey, milk, mushroom, noodles, olive oil,
onions, parmesan, pasta, peanut butter, rice, romaine lettuce, salt,
soy sauce, spaghetti, sugar, vegetable
```

Total: 27 unique ingredient names
