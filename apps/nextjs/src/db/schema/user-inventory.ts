import { pgTable, uuid, integer, timestamp, check, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'
import { ingredients } from './ingredients'

export const userInventory = pgTable('user_inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  ingredientId: uuid('ingredient_id').notNull().references(() => ingredients.id, { onDelete: 'restrict' }),
  quantityLevel: integer('quantity_level').notNull().default(3),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check('quantity_level_check', sql`${table.quantityLevel} BETWEEN 0 AND 3`),
  uniqueIndex('idx_user_inventory_unique').on(table.userId, table.ingredientId),
  index('idx_user_inventory_user').on(table.userId),
  index('idx_user_inventory_quantity').on(table.userId, table.quantityLevel).where(sql`${table.quantityLevel} > 0`),
  index('idx_user_inventory_matching').on(table.userId, table.ingredientId, table.quantityLevel).where(sql`${table.quantityLevel} > 0`),
])

// Relations
export const userInventoryRelations = relations(userInventory, ({ one }) => ({
  ingredient: one(ingredients, {
    fields: [userInventory.ingredientId],
    references: [ingredients.id],
  }),
}))
