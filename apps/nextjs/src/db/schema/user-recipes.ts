import { pgTable, uuid, text, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import type { IngredientType } from './enums'
import { ingredients } from './ingredients'
import { cookingLog } from './cooking-log'

export const userRecipes = pgTable('user_recipes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  userId: uuid('user_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_user_recipes_user').on(table.userId),
])

export const recipeIngredients = pgTable('recipe_ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipeId: uuid('recipe_id').notNull().references(() => userRecipes.id, { onDelete: 'cascade' }),
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
export const userRecipesRelations = relations(userRecipes, ({ many }) => ({
  recipeIngredients: many(recipeIngredients),
  cookingLog: many(cookingLog),
}))

export const recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(userRecipes, {
    fields: [recipeIngredients.recipeId],
    references: [userRecipes.id],
  }),
  ingredient: one(ingredients, {
    fields: [recipeIngredients.ingredientId],
    references: [ingredients.id],
  }),
}))
