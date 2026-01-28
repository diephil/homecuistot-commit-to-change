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
  ingredients,
} from '@/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { DEMO_INVENTORY, DEMO_RECIPES } from '@/db/demo-data'

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

export async function startDemoData(): Promise<{ success: boolean; error?: string }> {
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

    console.log('[user-data] Starting demo data for userId:', userId)

    await db(async (tx) => {
      // Step 1: Delete existing data (same as resetUserData)
      const recipes = await tx
        .select({ id: userRecipes.id })
        .from(userRecipes)
        .where(eq(userRecipes.userId, userId))

      const recipeIds = recipes.map((r) => r.id)

      await tx.delete(cookingLog).where(eq(cookingLog.userId, userId))
      if (recipeIds.length > 0) {
        await tx.delete(recipeIngredients).where(inArray(recipeIngredients.recipeId, recipeIds))
      }
      await tx.delete(userRecipes).where(eq(userRecipes.userId, userId))
      await tx.delete(userInventory).where(eq(userInventory.userId, userId))
      await tx.delete(unrecognizedItems).where(eq(unrecognizedItems.userId, userId))

      console.log('[user-data] Deleted existing data')

      // Step 2: Lookup ingredient IDs
      const allIngredientNames = [
        ...DEMO_INVENTORY.map((item) => item.name),
        ...DEMO_RECIPES.flatMap((recipe) => recipe.ingredients.map((ing) => ing.name)),
      ]
      const uniqueIngredientNames = [...new Set(allIngredientNames)]

      const foundIngredients = await tx
        .select({ id: ingredients.id, name: ingredients.name })
        .from(ingredients)
        .where(inArray(ingredients.name, uniqueIngredientNames))

      const ingredientMap = new Map(foundIngredients.map((ing) => [ing.name, ing.id]))

      // Check for missing ingredients
      const missingIngredients = uniqueIngredientNames.filter((name) => !ingredientMap.has(name))
      if (missingIngredients.length > 0) {
        throw new Error(`Missing ingredients: ${missingIngredients.join(', ')}`)
      }

      console.log('[user-data] Found all required ingredients')

      // Step 3: Insert demo inventory
      const inventoryData = DEMO_INVENTORY.map((item) => ({
        userId,
        ingredientId: ingredientMap.get(item.name)!,
        quantityLevel: item.quantityLevel,
        isPantryStaple: item.isPantryStaple,
      }))

      await tx.insert(userInventory).values(inventoryData)
      console.log('[user-data] Inserted demo inventory:', inventoryData.length, 'items')

      // Step 4: Insert demo recipes
      const recipeData = DEMO_RECIPES.map((recipe) => ({
        userId,
        name: recipe.name,
        description: recipe.description,
      }))

      const insertedRecipes = await tx.insert(userRecipes).values(recipeData).returning({ id: userRecipes.id, name: userRecipes.name })
      const recipeNameToId = new Map(insertedRecipes.map((r) => [r.name, r.id]))

      console.log('[user-data] Inserted demo recipes:', insertedRecipes.length)

      // Step 5: Insert recipe ingredients
      const recipeIngredientsData = DEMO_RECIPES.flatMap((recipe) =>
        recipe.ingredients.map((ingredient) => ({
          recipeId: recipeNameToId.get(recipe.name)!,
          ingredientId: ingredientMap.get(ingredient.name)!,
          ingredientType: ingredient.type,
        }))
      )

      await tx.insert(recipeIngredients).values(recipeIngredientsData)
      console.log('[user-data] Inserted recipe ingredients:', recipeIngredientsData.length)
    })

    console.log('[user-data] Demo data complete')

    // Clear cached data
    revalidatePath('/app')
    revalidatePath('/app/recipes')
    revalidatePath('/app/inventory')

    return { success: true }
  } catch (error) {
    console.error('[user-data] Failed to start demo data:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start demo'
    }
  }
}
