import { pgTable, uuid, integer, timestamp, check, index, uniqueIndex, boolean } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'
import { ingredients } from './ingredients'
import { unrecognizedItems } from './unrecognized-items'

export const userInventory = pgTable('user_inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  ingredientId: uuid('ingredient_id').references(() => ingredients.id, { onDelete: 'restrict' }),
  unrecognizedItemId: uuid('unrecognized_item_id').references(() => unrecognizedItems.id, { onDelete: 'restrict' }),
  quantityLevel: integer('quantity_level').notNull().default(3),
  isPantryStaple: boolean('is_pantry_staple').notNull().default(false),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check('quantity_level_check', sql`${table.quantityLevel} BETWEEN 0 AND 3`),
  // XOR constraint: exactly one of ingredient_id or unrecognized_item_id must be set
  check('exactly_one_reference', sql`(${table.ingredientId} IS NOT NULL) != (${table.unrecognizedItemId} IS NOT NULL)`),
  // Partial unique indexes for each reference type
  uniqueIndex('idx_user_inventory_ingredient_unique').on(table.userId, table.ingredientId).where(sql`${table.ingredientId} IS NOT NULL`),
  uniqueIndex('idx_user_inventory_unrecognized_unique').on(table.userId, table.unrecognizedItemId).where(sql`${table.unrecognizedItemId} IS NOT NULL`),
  index('idx_user_inventory_user').on(table.userId),
  index('idx_user_inventory_quantity').on(table.userId, table.quantityLevel).where(sql`${table.quantityLevel} > 0`),
  index('idx_user_inventory_matching').on(table.userId, table.ingredientId, table.quantityLevel).where(sql`${table.quantityLevel} > 0`),
  index('idx_user_inventory_pantry').on(table.userId, table.isPantryStaple).where(sql`${table.isPantryStaple} = true`),
])

// Relations
export const userInventoryRelations = relations(userInventory, ({ one }) => ({
  ingredient: one(ingredients, {
    fields: [userInventory.ingredientId],
    references: [ingredients.id],
  }),
  unrecognizedItem: one(unrecognizedItems, {
    fields: [userInventory.unrecognizedItemId],
    references: [unrecognizedItems.id],
  }),
}))
