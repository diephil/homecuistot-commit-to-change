import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'
import { recipes } from './recipes'

export const cookingLog = pgTable('cooking_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  recipeId: uuid('recipe_id').references(() => recipes.id, { onDelete: 'set null' }),
  recipeName: text('recipe_name').notNull(),
  cookedAt: timestamp('cooked_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_cooking_log_user').on(table.userId),
  index('idx_cooking_log_user_date').on(table.userId, sql`${table.cookedAt} DESC`),
])

// Relations
export const cookingLogRelations = relations(cookingLog, ({ one }) => ({
  recipe: one(recipes, {
    fields: [cookingLog.recipeId],
    references: [recipes.id],
  }),
}))
