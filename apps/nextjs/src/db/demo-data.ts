// Demo data constants for "Start Demo" feature
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
      { name: 'egg', type: 'anchor' as const },
      { name: 'milk', type: 'anchor' as const },
      { name: 'butter', type: 'anchor' as const },
      { name: 'salt', type: 'optional' as const },
      { name: 'black pepper', type: 'optional' as const },
    ],
  },
  {
    name: 'Pasta Carbonara',
    description: 'Classic Italian pasta dish with creamy egg sauce, bacon, and parmesan.',
    ingredients: [
      { name: 'pasta', type: 'anchor' as const },
      { name: 'egg', type: 'anchor' as const },
      { name: 'bacon', type: 'anchor' as const },
      { name: 'parmesan', type: 'anchor' as const },
      { name: 'salt', type: 'optional' as const },
      { name: 'black pepper', type: 'optional' as const },
    ],
  },
  {
    name: 'Egg Fried Rice',
    description: 'Delicious and savory fried rice with fluffy egg, vegetables, and soy sauce.',
    ingredients: [
      { name: 'rice', type: 'anchor' as const },
      { name: 'egg', type: 'anchor' as const },
      { name: 'soy sauce', type: 'anchor' as const },
      { name: 'vegetable', type: 'anchor' as const },
      { name: 'salt', type: 'optional' as const },
    ],
  },
  {
    name: 'Mushroom Omelette',
    description: 'Fluffy omelette filled with savory and earthy sauteed mushroom.',
    ingredients: [
      { name: 'egg', type: 'anchor' as const },
      { name: 'mushroom', type: 'anchor' as const },
      { name: 'butter', type: 'optional' as const },
      { name: 'salt', type: 'optional' as const },
      { name: 'black pepper', type: 'optional' as const },
    ],
  },
  {
    name: 'Spaghetti Aglio e Olio',
    description: 'Simple yet flavorful spaghetti with garlic, olive oil, chili flakes.',
    ingredients: [
      { name: 'spaghetti', type: 'anchor' as const },
      { name: 'garlic', type: 'anchor' as const },
      { name: 'olive oil', type: 'anchor' as const },
      { name: 'salt', type: 'optional' as const },
      { name: 'black pepper', type: 'optional' as const },
    ],
  },
  {
    name: 'Caesar Salad',
    description: 'Classic salad with romaine lettuce, croutons, parmesan, and Caesar dressing.',
    ingredients: [
      { name: 'romaine lettuce', type: 'anchor' as const },
      { name: 'crouton', type: 'anchor' as const },
      { name: 'parmesan', type: 'anchor' as const },
      { name: 'salt', type: 'optional' as const },
      { name: 'black pepper', type: 'optional' as const },
    ],
  },
] as const

// Derived types for type safety
export type DemoInventoryItem = (typeof DEMO_INVENTORY)[number]
export type DemoRecipe = (typeof DEMO_RECIPES)[number]
