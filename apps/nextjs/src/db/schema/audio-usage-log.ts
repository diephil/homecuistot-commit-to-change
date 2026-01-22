import { pgTable, uuid, integer, timestamp, date, jsonb, index } from 'drizzle-orm/pg-core'

/**
 * Audio Usage Log Table
 *
 * Records every audio upload for accurate quota tracking.
 * Usage is tracked per-day to enable daily limits that reset automatically.
 *
 * Query example - Get today's usage for a user:
 * SELECT SUM(duration_seconds) FROM audio_usage_log
 * WHERE user_id = 'uuid' AND usage_date = CURRENT_DATE;
 *
 * Query example - Get remaining minutes today:
 * SELECT (uq.daily_audio_minutes * 60 - COALESCE(SUM(aul.duration_seconds), 0)) / 60.0 as remaining_minutes
 * FROM user_quotas uq
 * LEFT JOIN audio_usage_log aul ON aul.user_id = uq.user_id AND aul.usage_date = CURRENT_DATE
 * WHERE uq.user_id = 'uuid'
 * GROUP BY uq.daily_audio_minutes;
 */
export const audioUsageLog = pgTable('audio_usage_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  /** Duration of the uploaded audio in seconds */
  durationSeconds: integer('duration_seconds').notNull(),
  /** Date of usage - enables daily aggregation and automatic "reset" */
  usageDate: date('usage_date').notNull().defaultNow(),
  /** When the upload occurred */
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  /** Optional metadata (file name, source, etc.) */
  metadata: jsonb('metadata'),
}, (table) => [
  // Optimized index for daily usage queries
  index('idx_audio_usage_user_date').on(table.userId, table.usageDate),
  // Index for user's usage history
  index('idx_audio_usage_user').on(table.userId),
])
