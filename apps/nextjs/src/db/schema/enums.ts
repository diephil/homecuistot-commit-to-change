// String literal types to replace PostgreSQL enums
// Migration: Converted from pgEnum to text columns with indexes

export const INGREDIENT_CATEGORIES = [
  'non_classified',
  'e100_e199',
  'ferments',
  'dairy',
  'cheeses',
  'salt',
  'meat',
  'starch',
  'oils_and_fats',
  'alcohol',
  'aroma',
  'cereal',
  'cocoa',
  'water',
  'fruit',
  'vegetables',
  'beans',
  'nuts',
  'seed',
  'plants',
  'mushroom',
  'fish',
  'molluscs',
  'crustaceans',
  'bee_ingredients',
  'synthesized',
  'poultry',
  'eggs',
  'parts',
  'compound_ingredients',
] as const

export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number]

export const INGREDIENT_TYPES = ['anchor', 'optional', 'assumed'] as const

export type IngredientType = (typeof INGREDIENT_TYPES)[number]

export const RECIPE_SOURCES = ['onboarding', 'added', 'other'] as const

export type RecipeSource = (typeof RECIPE_SOURCES)[number]
