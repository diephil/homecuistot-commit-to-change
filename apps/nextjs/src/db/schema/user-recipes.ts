import { pgTable, uuid, timestamp, index, uniqueIndex, text } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import type { RecipeSource } from './enums'
import { recipes } from './recipes'

export const userRecipes = pgTable('user_recipes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  recipeId: uuid('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  source: text('source').$type<RecipeSource>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('idx_user_recipes_unique').on(table.userId, table.recipeId),
  index('idx_user_recipes_user').on(table.userId),
  index('idx_user_recipes_source').on(table.source),
])

// Relations
export const userRecipesRelations = relations(userRecipes, ({ one }) => ({
  recipe: one(recipes, {
    fields: [userRecipes.recipeId],
    references: [recipes.id],
  }),
}))
