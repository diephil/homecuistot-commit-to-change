// String literal types to replace PostgreSQL enums
// Migration: Converted from pgEnum to text columns with indexes

export const INGREDIENT_CATEGORIES = [
  'meat',
  'proteins_nonmeat',
  'legumes',
  'vegetables',
  'starches',
  'dairy',
  'canned_jarred',
] as const

export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number]

export const INGREDIENT_TYPES = ['anchor', 'optional', 'assumed'] as const

export type IngredientType = (typeof INGREDIENT_TYPES)[number]

export const RECIPE_SOURCES = ['onboarding', 'added', 'other'] as const

export type RecipeSource = (typeof RECIPE_SOURCES)[number]
