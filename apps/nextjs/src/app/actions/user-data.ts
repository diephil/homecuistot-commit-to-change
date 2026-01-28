'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createUserDb, decodeSupabaseToken } from '@/db/client'
import {
  cookingLog,
  recipeIngredients,
  userInventory,
  userRecipes,
  unrecognizedItems,
} from '@/db/schema'
import { eq, inArray } from 'drizzle-orm'

export async function resetUserData(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'No session' }
    }

    const token = decodeSupabaseToken(session.access_token)
    const db = createUserDb(token)
    const userId = user.id

    console.log('[user-data] Starting reset for userId:', userId)

    await db(async (tx) => {
      // Get user recipe IDs for recipe_ingredients deletion
      const recipes = await tx
        .select({ id: userRecipes.id })
        .from(userRecipes)
        .where(eq(userRecipes.userId, userId))

      const recipeIds = recipes.map((r) => r.id)
      console.log('[user-data] Found recipes to delete:', recipeIds.length)

      // Delete in FK order
      await tx.delete(cookingLog).where(eq(cookingLog.userId, userId))
      console.log('[user-data] Deleted cooking logs')

      if (recipeIds.length > 0) {
        await tx.delete(recipeIngredients).where(inArray(recipeIngredients.recipeId, recipeIds))
        console.log('[user-data] Deleted recipe ingredients')
      }

      await tx.delete(userRecipes).where(eq(userRecipes.userId, userId))
      console.log('[user-data] Deleted user recipes')

      await tx.delete(userInventory).where(eq(userInventory.userId, userId))
      console.log('[user-data] Deleted user inventory')

      await tx.delete(unrecognizedItems).where(eq(unrecognizedItems.userId, userId))
      console.log('[user-data] Deleted unrecognized items')
    })

    console.log('[user-data] Reset complete')

    // Clear cached data
    revalidatePath('/app')
    revalidatePath('/app/recipes')
    revalidatePath('/app/inventory')

    return { success: true }
  } catch (error) {
    console.error('[user-data] Failed to reset user data:', error)
    return { success: false, error: 'Failed to reset data' }
  }
}
