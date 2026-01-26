import { pgTable, uuid, text, boolean, timestamp, check, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'
import type { IngredientType } from './enums'
import { ingredients } from './ingredients'
import { userRecipes } from './user-recipes'
import { cookingLog } from './cooking-log'

export const recipes = pgTable('recipes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  isSeeded: boolean('is_seeded').notNull().default(false),
  userId: uuid('user_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check(
    'recipe_ownership',
    sql`(${table.isSeeded} = true AND ${table.userId} IS NULL) OR (${table.isSeeded} = false AND ${table.userId} IS NOT NULL)`
  ),
  index('idx_recipes_user').on(table.userId),
  index('idx_recipes_user_seeded').on(table.userId, table.isSeeded),
])

export const recipeIngredients = pgTable('recipe_ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipeId: uuid('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  ingredientId: uuid('ingredient_id').notNull().references(() => ingredients.id, { onDelete: 'restrict' }),
  ingredientType: text('ingredient_type').$type<IngredientType>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('idx_recipe_ingredients_unique').on(table.recipeId, table.ingredientId),
  index('idx_recipe_ingredients_recipe').on(table.recipeId),
  index('idx_recipe_ingredients_ingredient').on(table.ingredientId),
  index('idx_recipe_ingredients_type').on(table.ingredientType),
])

// Relations
export const recipesRelations = relations(recipes, ({ many }) => ({
  recipeIngredients: many(recipeIngredients),
  userRecipes: many(userRecipes),
  cookingLog: many(cookingLog),
}))

export const recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeIngredients.recipeId],
    references: [recipes.id],
  }),
  ingredient: one(ingredients, {
    fields: [recipeIngredients.ingredientId],
    references: [ingredients.id],
  }),
}))
