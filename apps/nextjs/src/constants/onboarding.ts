import type { StaticIngredient, StaticDish } from "@/types/onboarding";

/**
 * Common ingredients - fresh/refrigerated items users usually have (10 items)
 * All names in singular form, verified to exist in ingredients table
 */
export const COMMON_INGREDIENTS: StaticIngredient[] = [
  { name: "egg" },
  { name: "tomato" },
  { name: "onion" },
  { name: "garlic" },
  { name: "butter" },
  { name: "milk" },
  { name: "cheese" },
  { name: "chicken" },
  { name: "bacon" },
  { name: "cream" },
];

/**
 * Pantry staples - dry/shelf-stable items users always have at all times (10 items)
 * All names in singular form, verified to exist in ingredients table
 * No duplicates with COMMON_INGREDIENTS
 */
export const PANTRY_STAPLES: StaticIngredient[] = [
  { name: "salt" },
  { name: "pepper" },
  { name: "olive oil" },
  { name: "sugar" },
  { name: "rice" },
  { name: "pasta" },
  { name: "flour" },
  { name: "soy sauce" },
  { name: "vinegar" },
  { name: "honey" },
];

/**
 * T003: Basic recipes for users with basic cooking skill (8 dishes)
 * Each ingredient marked as anchor (required) or optional
 */
export const BASIC_RECIPES: StaticDish[] = [
  {
    title: "Scrambled Egg",
    description: "Fluffy eggs cooked with butter",
    ingredients: [
      { name: "egg", type: "anchor" },
      { name: "butter", type: "anchor" },
      { name: "salt", type: "optional" },
    ],
  },
  {
    title: "Pasta Carbonara",
    description: "Creamy pasta with bacon and egg",
    ingredients: [
      { name: "pasta", type: "anchor" },
      { name: "bacon", type: "anchor" },
      { name: "egg", type: "anchor" },
      { name: "cheese", type: "optional" },
    ],
  },
  {
    title: "Pancake",
    description: "Fluffy breakfast pancakes",
    ingredients: [
      { name: "flour", type: "anchor" },
      { name: "egg", type: "anchor" },
      { name: "milk", type: "anchor" },
      { name: "sugar", type: "optional" },
    ],
  },
  {
    title: "Mushroom Omelette",
    description: "Eggs with sauteed mushrooms",
    ingredients: [
      { name: "egg", type: "anchor" },
      { name: "mushroom", type: "anchor" },
      { name: "butter", type: "optional" },
    ],
  },
  {
    title: "Spaghetti Aglio e Olio",
    description: "Pasta with garlic and olive oil",
    ingredients: [
      { name: "pasta", type: "anchor" },
      { name: "garlic", type: "anchor" },
      { name: "olive oil", type: "anchor" },
      { name: "chili pepper", type: "optional" },
    ],
  },
  {
    title: "Grilled Chicken and Rice",
    description: "Simple grilled chicken with rice",
    ingredients: [
      { name: "chicken", type: "anchor" },
      { name: "rice", type: "anchor" },
      { name: "salt", type: "optional" },
    ],
  },
  {
    title: "Roasted Potato",
    description: "Crispy oven-roasted potatoes",
    ingredients: [
      { name: "potato", type: "anchor" },
      { name: "olive oil", type: "anchor" },
      { name: "rosemary", type: "optional" },
    ],
  },
  {
    title: "Roasted Vegetable",
    description: "Mixed vegetables roasted to perfection",
    ingredients: [
      { name: "zucchini", type: "anchor" },
      { name: "bell pepper", type: "anchor" },
      { name: "olive oil", type: "anchor" },
      { name: "garlic", type: "optional" },
    ],
  },
];

/**
 * T004: Advanced recipes for users with advanced cooking skill (8 additional dishes)
 * Combined with BASIC_RECIPES for 16 total recipes
 */
export const ADVANCED_RECIPES: StaticDish[] = [
  {
    title: "Teriyaki Chicken",
    description: "Sweet and savory glazed chicken",
    ingredients: [
      { name: "chicken", type: "anchor" },
      { name: "soy sauce", type: "anchor" },
      { name: "honey", type: "anchor" },
      { name: "ginger", type: "optional" },
    ],
  },
  {
    title: "Caesar Salad",
    description: "Classic salad with creamy dressing",
    ingredients: [
      { name: "lettuce", type: "anchor" },
      { name: "cheese", type: "anchor" },
      { name: "crouton", type: "optional" },
      { name: "anchovy", type: "optional" },
    ],
  },
  {
    title: "Cheese Quesadilla",
    description: "Crispy tortilla with melted cheese",
    ingredients: [
      { name: "tortilla", type: "anchor" },
      { name: "cheese", type: "anchor" },
      { name: "bell pepper", type: "optional" },
    ],
  },
  {
    title: "Miso Soup",
    description: "Traditional Japanese soup",
    ingredients: [
      { name: "miso paste", type: "anchor" },
      { name: "tofu", type: "anchor" },
      { name: "seaweed", type: "optional" },
      { name: "green onion", type: "optional" },
    ],
  },
  {
    title: "Cheeseburger",
    description: "Classic beef burger with cheese",
    ingredients: [
      { name: "ground beef", type: "anchor" },
      { name: "cheese", type: "anchor" },
      { name: "bread", type: "anchor" },
      { name: "lettuce", type: "optional" },
    ],
  },
  {
    title: "Moussaka",
    description: "Greek layered eggplant casserole",
    ingredients: [
      { name: "eggplant", type: "anchor" },
      { name: "ground beef", type: "anchor" },
      { name: "tomato", type: "anchor" },
      { name: "bechamel sauce", type: "optional" },
    ],
  },
  {
    title: "Grilled Salmon and Lemon",
    description: "Salmon with fresh lemon",
    ingredients: [
      { name: "salmon", type: "anchor" },
      { name: "lemon", type: "anchor" },
      { name: "olive oil", type: "optional" },
      { name: "dill", type: "optional" },
    ],
  },
  {
    title: "Veal Blanquette",
    description: "French creamy veal stew",
    ingredients: [
      { name: "veal", type: "anchor" },
      { name: "cream", type: "anchor" },
      { name: "carrot", type: "anchor" },
      { name: "mushroom", type: "optional" },
    ],
  },
];
