'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createUserDb, decodeSupabaseToken } from '@/db/client'
import { cookingLog, userInventory, userRecipes } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import type { RecipeWithAvailability, CookingLogEntry, QuantityLevel, MarkCookedPayload } from '@/types/cooking'

// Helper to get authenticated user context
async function getAuthContext() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }

  const token = decodeSupabaseToken(session.access_token)
  const db = createUserDb(token)

  return { userId: session.user.id, db }
}

// T002: Get recipes with availability computed
export async function getRecipesWithAvailability(): Promise<RecipeWithAvailability[]> {
  const { userId, db } = await getAuthContext()

  // Fetch all recipes with ingredients
  const recipes = await db((tx) =>
    tx.query.userRecipes.findMany({
      where: eq(userRecipes.userId, userId),
      with: {
        recipeIngredients: {
          with: { ingredient: true },
        },
      },
      orderBy: [desc(userRecipes.createdAt)],
    })
  )

  // Fetch user inventory
  const inventory = await db((tx) =>
    tx
      .select({
        ingredientId: userInventory.ingredientId,
        quantityLevel: userInventory.quantityLevel,
        isPantryStaple: userInventory.isPantryStaple,
      })
      .from(userInventory)
      .where(eq(userInventory.userId, userId))
  )

  // Create inventory lookup map (only for known ingredients)
  const inventoryMap = new Map(
    inventory
      .filter((i): i is typeof i & { ingredientId: string } => i.ingredientId !== null)
      .map((i) => [i.ingredientId, i])
  )

  // Compute availability for each recipe
  return recipes.map((recipe) => {
    // Filter to only known ingredients (not unrecognized items) for availability calculation
    const knownIngredients = recipe.recipeIngredients.filter(
      (ri): ri is typeof ri & { ingredientId: string; ingredient: NonNullable<typeof ri.ingredient> } =>
        ri.ingredientId !== null && ri.ingredient !== null
    )

    const ingredientsWithAvailability = knownIngredients.map((ri) => {
      const inv = inventoryMap.get(ri.ingredientId)
      const inInventory = inv
        ? (inv.quantityLevel > 0 || inv.isPantryStaple)
        : false

      return {
        id: ri.ingredientId,
        name: ri.ingredient.name,
        type: ri.ingredientType,
        inInventory,
        currentQuantity: (inv?.quantityLevel ?? 0) as QuantityLevel,
        isPantryStaple: inv?.isPantryStaple ?? false,
      }
    })

    // Only anchor ingredients matter for availability
    const anchorIngredients = ingredientsWithAvailability.filter(
      (i) => i.type === 'anchor'
    )
    const missingAnchors = anchorIngredients.filter((i) => !i.inInventory)

    // Determine availability state
    let availability: RecipeWithAvailability['availability']
    if (missingAnchors.length === 0) {
      availability = 'available'
    } else if (missingAnchors.length <= 2) {
      availability = 'almost-available'
    } else {
      availability = 'unavailable'
    }

    return {
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      ingredients: ingredientsWithAvailability,
      missingAnchorCount: missingAnchors.length,
      missingAnchorNames: missingAnchors.map((i) => i.name),
      availability,
    }
  })
}

// T003: Get cooking history (last 20 entries)
export async function getCookingHistory(): Promise<CookingLogEntry[]> {
  const { userId, db } = await getAuthContext()

  const history = await db((tx) =>
    tx
      .select({
        id: cookingLog.id,
        recipeId: cookingLog.recipeId,
        recipeName: cookingLog.recipeName,
        cookedAt: cookingLog.cookedAt,
      })
      .from(cookingLog)
      .where(eq(cookingLog.userId, userId))
      .orderBy(desc(cookingLog.cookedAt))
      .limit(20)
  )

  return history
}

// T004: Mark recipe as cooked (transaction: log + inventory update)
export async function markRecipeAsCooked(params: MarkCookedPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId, db } = await getAuthContext()

    // Validate recipe exists and belongs to user
    const [recipe] = await db((tx) =>
      tx
        .select({ id: userRecipes.id })
        .from(userRecipes)
        .where(
          and(
            eq(userRecipes.id, params.recipeId),
            eq(userRecipes.userId, userId)
          )
        )
        .limit(1)
    )

    if (!recipe) {
      return { success: false, error: 'Recipe not found' }
    }

    // Validate ingredient updates
    for (const update of params.ingredientUpdates) {
      if (update.newQuantity < 0 || update.newQuantity > 3) {
        return { success: false, error: 'Quantity must be 0-3' }
      }
    }

    // Execute transaction: create log + update inventory
    await db(async (tx) => {
      // Insert cooking log entry
      await tx.insert(cookingLog).values({
        userId,
        recipeId: params.recipeId,
        recipeName: params.recipeName,
      })

      // Update inventory quantities
      for (const update of params.ingredientUpdates) {
        await tx
          .update(userInventory)
          .set({
            quantityLevel: update.newQuantity,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(userInventory.userId, userId),
              eq(userInventory.ingredientId, update.ingredientId)
            )
          )
      }
    })

    // Revalidate pages
    revalidatePath('/app')
    revalidatePath('/app/inventory')

    return { success: true }
  } catch (error) {
    console.error('[cooking-log] Failed to mark recipe as cooked:', error)
    return { success: false, error: 'Failed to log cooking' }
  }
}

// Helper: Get recipe and inventory counts for redirect check
export async function getUserCounts(): Promise<{ recipeCount: number; inventoryCount: number }> {
  const { userId, db } = await getAuthContext()

  const [recipeResult, inventoryResult] = await Promise.all([
    db((tx) =>
      tx
        .select({ id: userRecipes.id })
        .from(userRecipes)
        .where(eq(userRecipes.userId, userId))
        .limit(1)
    ),
    db((tx) =>
      tx
        .select({ id: userInventory.id })
        .from(userInventory)
        .where(eq(userInventory.userId, userId))
        .limit(1)
    ),
  ])

  return {
    recipeCount: recipeResult.length,
    inventoryCount: inventoryResult.length,
  }
}
