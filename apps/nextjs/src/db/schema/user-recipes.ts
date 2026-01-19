import { pgTable, uuid, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { recipeSourceEnum } from './enums'
import { recipes } from './recipes'

export const userRecipes = pgTable('user_recipes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  recipeId: uuid('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  source: recipeSourceEnum('source').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('idx_user_recipes_unique').on(table.userId, table.recipeId),
  index('idx_user_recipes_user').on(table.userId),
])

// Relations
export const userRecipesRelations = relations(userRecipes, ({ one }) => ({
  recipe: one(recipes, {
    fields: [userRecipes.recipeId],
    references: [recipes.id],
  }),
}))
