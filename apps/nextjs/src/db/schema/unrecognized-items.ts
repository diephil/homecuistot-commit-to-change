import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const unrecognizedItems = pgTable('unrecognized_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  rawText: text('raw_text').notNull(),
  context: text('context'),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
