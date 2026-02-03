'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createUserDb, decodeSupabaseToken } from '@/db/client'
import { userInventory } from '@/db/schema'
import { eq, and, sql, isNotNull } from 'drizzle-orm'
import type { DeleteUnrecognizedItemParams, DeleteUnrecognizedItemResult } from '@/types/inventory'

export async function updateInventoryQuantity(params: {
  ingredientId: string
  quantityLevel: number
}) {
  const supabase = await createClient()

  // Verify user authenticity
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get session for JWT token
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Unauthorized')
  }

  // Validate quantity level
  if (params.quantityLevel < 0 || params.quantityLevel > 3) {
    throw new Error('Quantity level must be between 0 and 3')
  }

  // Decode JWT token for Drizzle RLS
  const token = decodeSupabaseToken(session.access_token)

  const db = createUserDb(token)

  await db((tx) =>
    tx
      .update(userInventory)
      .set({
        quantityLevel: params.quantityLevel,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(userInventory.userId, session.user.id),
          eq(userInventory.ingredientId, params.ingredientId)
        )
      )
  )

  revalidatePath('/inventory')
}

export async function addInventoryItem(params: {
  ingredientId: string
  quantityLevel: number
}) {
  const supabase = await createClient()

  // Verify user authenticity
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get session for JWT token
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Unauthorized')
  }

  // Validate quantity level
  if (params.quantityLevel < 0 || params.quantityLevel > 3) {
    throw new Error('Quantity level must be between 0 and 3')
  }

  // Decode JWT token for Drizzle RLS
  const token = decodeSupabaseToken(session.access_token)
  const db = createUserDb(token)

  // Upsert: insert or update if exists - use targetWhere for partial unique index
  await db((tx) =>
    tx
      .insert(userInventory)
      .values({
        userId: session.user.id,
        ingredientId: params.ingredientId,
        quantityLevel: params.quantityLevel,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [userInventory.userId, userInventory.ingredientId],
        targetWhere: sql`${userInventory.ingredientId} IS NOT NULL`,
        set: {
          quantityLevel: params.quantityLevel,
          updatedAt: new Date(),
        },
      })
  )

  revalidatePath('/inventory')
}

export async function deleteInventoryItem(params: { ingredientId: string }) {
  const supabase = await createClient()

  // Verify user authenticity
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get session for JWT token
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Unauthorized')
  }

  // Decode JWT token for Drizzle RLS
  const token = decodeSupabaseToken(session.access_token)
  const db = createUserDb(token)

  await db((tx) =>
    tx
      .delete(userInventory)
      .where(
        and(
          eq(userInventory.userId, session.user.id),
          eq(userInventory.ingredientId, params.ingredientId)
        )
      )
  )

  revalidatePath('/inventory')
}

/**
 * Delete an unrecognized item from user's inventory
 * Feature: 021-unrecognized-items-display
 * FR-007: Remove from user_inventory table
 * FR-008: Preserve unrecognized_items table record
 * FR-014: Return error message on failure
 *
 * Named parameters per Constitution Principle VI
 * Security: Only deletes items with unrecognizedItemId NOT NULL
 */
/**
 * Check if user has completed onboarding (has at least 1 inventory item)
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return false
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return false
    }

    const token = decodeSupabaseToken(session.access_token)
    const db = createUserDb(token)

    const result = await db((tx) =>
      tx
        .select({ id: userInventory.id })
        .from(userInventory)
        .where(eq(userInventory.userId, session.user.id))
        .limit(1)
    )

    return result.length > 0
  } catch (error) {
    console.error('hasCompletedOnboarding check failed:', error)
    return false
  }
}

export async function deleteUnrecognizedItem(
  params: DeleteUnrecognizedItemParams
): Promise<DeleteUnrecognizedItemResult> {
  try {
    const supabase = await createClient()

    // Verify user authenticity
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Not authorized',
        code: 'UNAUTHORIZED',
      }
    }

    // Get session for JWT token
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return {
        success: false,
        error: 'Not authorized',
        code: 'UNAUTHORIZED',
      }
    }

    // Validate userId matches authenticated user
    if (params.userId !== session.user.id) {
      return {
        success: false,
        error: 'Not authorized',
        code: 'UNAUTHORIZED',
      }
    }

    // Decode JWT token for Drizzle RLS
    const token = decodeSupabaseToken(session.access_token)
    const db = createUserDb(token)

    // Safety: only delete if unrecognizedItemId IS NOT NULL
    // This prevents accidental deletion of recognized ingredients
    const result = await db((tx) =>
      tx
        .delete(userInventory)
        .where(
          and(
            eq(userInventory.id, params.inventoryId),
            eq(userInventory.userId, params.userId),
            isNotNull(userInventory.unrecognizedItemId)
          )
        )
        .returning({ id: userInventory.id })
    )

    if (result.length === 0) {
      return {
        success: false,
        error: 'Item not found',
        code: 'NOT_FOUND',
      }
    }

    // Revalidate inventory page to refresh server component data
    revalidatePath('/app/inventory')

    return {
      success: true,
      deletedInventoryId: result[0].id,
    }
  } catch (error) {
    console.error('Delete unrecognized item failed:', error)
    return {
      success: false,
      error: 'Failed to delete item',
      code: 'DATABASE_ERROR',
    }
  }
}
