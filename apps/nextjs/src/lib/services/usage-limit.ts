import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { llmUsageLog } from '@/db/schema'
import type { createUserDb } from '@/db/client'

type UserDb = ReturnType<typeof createUserDb>

const DAILY_LLM_LIMIT = Number(process.env.DAILY_LLM_LIMIT) || 100

function getAdminIds(): string[] {
  return process.env.ADMIN_USER_IDS?.split(',').map((id) => id.trim()) || []
}

/**
 * Check if user has exceeded daily LLM usage limit.
 * Call BEFORE LLM processing. Throws 429 NextResponse if over limit.
 * Admin users bypass the check entirely.
 * Fails closed: DB errors deny the request.
 */
export async function checkUsageLimit({ userId, db }: { userId: string; db: UserDb }) {
  if (getAdminIds().includes(userId)) return

  const todayUtc = new Date()
  todayUtc.setUTCHours(0, 0, 0, 0)

  const result = await db((tx) =>
    tx
      .select({ count: sql<number>`count(*)::int` })
      .from(llmUsageLog)
      .where(
        sql`${llmUsageLog.userId} = ${userId} AND ${llmUsageLog.createdAt} >= ${todayUtc}`,
      ),
  )

  const count = result[0]?.count ?? 0

  if (count >= DAILY_LLM_LIMIT) {
    throw NextResponse.json(
      { error: 'Daily LLM usage limit reached. Resets at midnight UTC.' },
      { status: 429 },
    )
  }
}

/**
 * Log a successful LLM call. Call AFTER successful LLM response.
 */
export async function logUsage({
  userId,
  db,
  endpoint,
}: {
  userId: string
  db: UserDb
  endpoint: string
}) {
  await db((tx) =>
    tx.insert(llmUsageLog).values({ userId, endpoint }),
  )
}
