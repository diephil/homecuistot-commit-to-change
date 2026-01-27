'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createUserDb, decodeSupabaseToken } from '@/db/client'
import { userInventory } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

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

  // Upsert: insert or update if exists
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
