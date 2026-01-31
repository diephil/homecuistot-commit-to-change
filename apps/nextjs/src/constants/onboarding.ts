import type { SuggestedItems, StaticIngredient, StaticDish } from '@/types/onboarding';

/**
 * T003: Suggested items constants for onboarding badge selection
 * Spec: specs/004-onboarding-flow/data-model.md lines 124-151
 *
 * Dishes selected for clarity - each has clear, unambiguous ingredient lists
 */

export const SUGGESTED_ITEMS: SuggestedItems = {
  dishes: [
    { id: 'dish-1', name: 'Scrambled Eggs' },
    { id: 'dish-2', name: 'Pasta Carbonara' },
    { id: 'dish-3', name: 'Grilled Cheese Sandwich' },
    { id: 'dish-4', name: 'French Toast' },
    { id: 'dish-5', name: 'Egg Fried Rice' },
    { id: 'dish-6', name: 'Miso Soup' },
    { id: 'dish-7', name: 'Caprese Salad' },
    { id: 'dish-8', name: 'Pancakes' },
    { id: 'dish-9', name: 'Cheese Quesadilla' },
    { id: 'dish-10', name: 'Mushroom Omelette' },
    { id: 'dish-11', name: 'Spaghetti Aglio e Olio' },
    { id: 'dish-12', name: 'Caesar Salad' },
    { id: 'dish-13', name: 'Peanut Butter Toast' },
    { id: 'dish-14', name: 'Teriyaki Chicken' },
    { id: 'dish-15', name: 'Tomato Basil Pasta' },
  ],
  fridgeItems: [
    { id: 'fridge-1', name: 'Egg' },
    { id: 'fridge-2', name: 'Milk' },
    { id: 'fridge-3', name: 'Tomato' },
    { id: 'fridge-4', name: 'Cheese' },
    { id: 'fridge-5', name: 'Lettuce' },
    { id: 'fridge-6', name: 'Chicken Breast' },
    { id: 'fridge-7', name: 'Bell Pepper' },
    { id: 'fridge-8', name: 'Carrot' },
    { id: 'fridge-9', name: 'Onion' },
    { id: 'fridge-10', name: 'Butter' },
    { id: 'fridge-11', name: 'Yogurt' },
    { id: 'fridge-12', name: 'Bacon' },
    { id: 'fridge-13', name: 'Broccoli' },
    { id: 'fridge-14', name: 'Cucumber' },
    { id: 'fridge-15', name: 'Ground Beef' },
    { id: 'fridge-16', name: 'Sausage' },
    { id: 'fridge-17', name: 'Mushroom' },
    { id: 'fridge-18', name: 'Spinach' },
    { id: 'fridge-19', name: 'Cream' },
    { id: 'fridge-20', name: 'Tofu' },
  ],
  pantryItems: [
    { id: 'pantry-1', name: 'Pasta' },
    { id: 'pantry-2', name: 'Rice' },
    { id: 'pantry-3', name: 'Flour' },
    { id: 'pantry-4', name: 'Sugar' },
    { id: 'pantry-5', name: 'Salt' },
    { id: 'pantry-6', name: 'Olive Oil' },
    { id: 'pantry-7', name: 'Soy Sauce' },
    { id: 'pantry-8', name: 'Black Pepper' },
    { id: 'pantry-9', name: 'Garlic' },
    { id: 'pantry-10', name: 'Bread' },
    { id: 'pantry-11', name: 'Tomato' },
    { id: 'pantry-12', name: 'Chicken Stock' },
    { id: 'pantry-13', name: 'Peanut Butter' },
    { id: 'pantry-14', name: 'Honey' },
    { id: 'pantry-15', name: 'Oat' },
    { id: 'pantry-16', name: 'Baking Powder' },
    { id: 'pantry-17', name: 'Vinegar' },
    { id: 'pantry-18', name: 'Bean' },
    { id: 'pantry-19', name: 'Lentil' },
    { id: 'pantry-20', name: 'Noodle' },
  ],
};

// =============================================================================
// T002-T004: New constants for 019-onboarding-revamp
// =============================================================================

/**
 * T002: Common ingredients for step 2 multi-select (16 items)
 * All names in singular form, verified to exist in ingredients table
 */
export const COMMON_INGREDIENTS: StaticIngredient[] = [
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
];

/**
 * T003: Basic recipes for users with basic cooking skill (8 dishes)
 * Each ingredient marked as anchor (required) or optional
 */
export const BASIC_RECIPES: StaticDish[] = [
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

/**
 * T004: Advanced recipes for users with advanced cooking skill (8 additional dishes)
 * Combined with BASIC_RECIPES for 16 total recipes
 */
export const ADVANCED_RECIPES: StaticDish[] = [
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
