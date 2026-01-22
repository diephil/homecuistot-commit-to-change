import { pgTable, uuid, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

/**
 * User Quotas Table
 *
 * Stores per-user quota configuration for audio uploads.
 * Each user has one record defining their daily audio minute allowance.
 *
 * Admin can increase quota by updating daily_audio_minutes directly in DB:
 * UPDATE user_quotas SET daily_audio_minutes = 30 WHERE user_id = 'uuid-here';
 *
 * Default: 10 minutes/day for new users (handled at application level)
 */
export const userQuotas = pgTable('user_quotas', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  /** Maximum audio minutes allowed per day (in minutes). Beyond quota, users fallback to free Gemma 3n model */
  dailyAudioMinutes: integer('daily_audio_minutes').notNull().default(5),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('idx_user_quotas_user_id').on(table.userId),
])
