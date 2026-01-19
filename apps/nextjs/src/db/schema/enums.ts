import { pgEnum } from 'drizzle-orm/pg-core'

export const ingredientCategoryEnum = pgEnum('ingredient_category', [
  'meat',
  'proteins_nonmeat',
  'legumes',
  'vegetables',
  'starches',
  'dairy',
  'canned_jarred',
])

export const ingredientTypeEnum = pgEnum('ingredient_type', [
  'anchor',
  'optional',
  'assumed',
])

export const recipeSourceEnum = pgEnum('recipe_source', [
  'onboarding',
  'added',
  'other',
])
