import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core'

export const llmUsageLog = pgTable('llm_usage_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  endpoint: text('endpoint').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_llm_usage_user_date').on(table.userId, table.createdAt),
])
