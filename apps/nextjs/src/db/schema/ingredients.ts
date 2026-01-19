import { pgTable, uuid, text, boolean, timestamp, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { ingredientCategoryEnum } from './enums'
import { recipeIngredients } from './recipes'
import { userInventory } from './user-inventory'

export const ingredients = pgTable('ingredients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  category: ingredientCategoryEnum('category').notNull(),
  isAssumed: boolean('is_assumed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_ingredients_category').on(table.category),
  index('idx_ingredients_is_assumed').on(table.isAssumed),
])

export const ingredientAliases = pgTable('ingredient_aliases', {
  id: uuid('id').primaryKey().defaultRandom(),
  ingredientId: uuid('ingredient_id').notNull().references(() => ingredients.id, { onDelete: 'cascade' }),
  alias: text('alias').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_ingredient_aliases_alias').on(table.alias),
  index('idx_ingredient_aliases_ingredient').on(table.ingredientId),
])

// Relations
export const ingredientsRelations = relations(ingredients, ({ many }) => ({
  aliases: many(ingredientAliases),
  recipeIngredients: many(recipeIngredients),
  userInventory: many(userInventory),
}))

export const ingredientAliasesRelations = relations(ingredientAliases, ({ one }) => ({
  ingredient: one(ingredients, {
    fields: [ingredientAliases.ingredientId],
    references: [ingredients.id],
  }),
}))
