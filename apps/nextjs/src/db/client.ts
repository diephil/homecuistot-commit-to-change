import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { sql } from 'drizzle-orm'
import * as schema from './schema'

// Validate environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required in environment')
}

// Admin client (bypasses RLS) - use sparingly for migrations/seeds/admin ops
// Separate pool for admin operations
const adminClient = postgres(process.env.DATABASE_URL, { prepare: false })
export const adminDb = drizzle({ client: adminClient, schema })

// User client (respects RLS policies)
// Separate pool for user operations
const userClient = postgres(process.env.DATABASE_URL, { prepare: false })
export const userDb = drizzle({ client: userClient, schema })

type SupabaseToken = {
  iss?: string
  sub?: string
  aud?: string[] | string
  exp?: number
  nbf?: number
  iat?: number
  jti?: string
  role?: string
}

// RLS-aware wrapper following official Drizzle + Supabase pattern
// See: https://orm.drizzle.team/docs/rls
export function createUserDb(token: SupabaseToken) {
  return (async (transaction, ...rest) => {
    return await userDb.transaction(async (tx) => {
      try {
        // Set Supabase RLS context variables for auth.uid() and auth.jwt()
        await tx.execute(sql`
          -- auth.jwt()
          select set_config('request.jwt.claims', '${sql.raw(
            JSON.stringify(token)
          )}', TRUE);
          -- auth.uid()
          select set_config('request.jwt.claim.sub', '${sql.raw(
            token.sub ?? ''
          )}', TRUE);
          -- set local role
          set local role ${sql.raw(token.role ?? 'anon')};
        `)
        return await transaction(tx)
      } finally {
        // Reset session variables
        await tx.execute(sql`
          select set_config('request.jwt.claims', NULL, TRUE);
          select set_config('request.jwt.claim.sub', NULL, TRUE);
          reset role;
        `)
      }
    }, ...rest)
  }) as typeof userDb.transaction
}

// Type exports for query results
export type Ingredient = typeof schema.ingredients.$inferSelect
export type NewIngredient = typeof schema.ingredients.$inferInsert
export type IngredientAlias = typeof schema.ingredientAliases.$inferSelect
export type NewIngredientAlias = typeof schema.ingredientAliases.$inferInsert

export type Recipe = typeof schema.recipes.$inferSelect
export type NewRecipe = typeof schema.recipes.$inferInsert
export type RecipeIngredient = typeof schema.recipeIngredients.$inferSelect
export type NewRecipeIngredient = typeof schema.recipeIngredients.$inferInsert

export type UserInventory = typeof schema.userInventory.$inferSelect
export type NewUserInventory = typeof schema.userInventory.$inferInsert

export type UserRecipe = typeof schema.userRecipes.$inferSelect
export type NewUserRecipe = typeof schema.userRecipes.$inferInsert

export type CookingLog = typeof schema.cookingLog.$inferSelect
export type NewCookingLog = typeof schema.cookingLog.$inferInsert

export type UnrecognizedItem = typeof schema.unrecognizedItems.$inferSelect
export type NewUnrecognizedItem = typeof schema.unrecognizedItems.$inferInsert

// CRUD Helper Functions (using adminDb for examples)
// In production, use createUserDb for RLS-aware operations

import { eq, and, gt, desc, count, avg, sql as sqlFn } from 'drizzle-orm'

/**
 * Get all ingredients from catalog
 */
export async function getIngredients() {
  return await adminDb.select().from(schema.ingredients)
}

/**
 * Get ingredients by category
 */
export async function getIngredientsByCategory(params: { category: string }) {
  return await adminDb
    .select()
    .from(schema.ingredients)
    .where(eq(schema.ingredients.category, params.category as any))
}

/**
 * Add or update inventory item (upsert)
 */
export async function addInventoryItem(params: {
  userId: string
  ingredientId: string
  quantityLevel: number
}) {
  return await adminDb
    .insert(schema.userInventory)
    .values({
      userId: params.userId,
      ingredientId: params.ingredientId,
      quantityLevel: params.quantityLevel,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [schema.userInventory.userId, schema.userInventory.ingredientId],
      set: {
        quantityLevel: params.quantityLevel,
        updatedAt: new Date(),
      },
    })
    .returning()
}

/**
 * Update inventory quantity
 */
export async function updateInventoryQuantity(params: {
  userId: string
  ingredientId: string
  quantityLevel: number
}) {
  return await adminDb
    .update(schema.userInventory)
    .set({
      quantityLevel: params.quantityLevel,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(schema.userInventory.userId, params.userId),
        eq(schema.userInventory.ingredientId, params.ingredientId)
      )
    )
    .returning()
}

/**
 * Delete inventory item
 */
export async function deleteInventoryItem(params: {
  userId: string
  ingredientId: string
}) {
  return await adminDb
    .delete(schema.userInventory)
    .where(
      and(
        eq(schema.userInventory.userId, params.userId),
        eq(schema.userInventory.ingredientId, params.ingredientId)
      )
    )
    .returning()
}

/**
 * Get user's inventory with ingredient details (join)
 */
export async function getUserInventoryWithIngredients(params: {
  userId: string
}) {
  return await adminDb
    .select({
      id: schema.userInventory.id,
      userId: schema.userInventory.userId,
      ingredientId: schema.userInventory.ingredientId,
      quantityLevel: schema.userInventory.quantityLevel,
      updatedAt: schema.userInventory.updatedAt,
      ingredientName: schema.ingredients.name,
      ingredientCategory: schema.ingredients.category,
      isAssumed: schema.ingredients.isAssumed,
    })
    .from(schema.userInventory)
    .innerJoin(
      schema.ingredients,
      eq(schema.userInventory.ingredientId, schema.ingredients.id)
    )
    .where(eq(schema.userInventory.userId, params.userId))
    .orderBy(desc(schema.userInventory.updatedAt))
}

/**
 * Get Tier 1 recipes (all anchor ingredients present)
 * Based on data-model.md example query
 */
export async function getTier1Recipes(params: { userId: string }) {
  // Subquery: ingredient IDs user has in stock (quantity > 0)
  const inStockIngredientsSubquery = adminDb
    .select({ ingredientId: schema.userInventory.ingredientId })
    .from(schema.userInventory)
    .where(
      and(
        eq(schema.userInventory.userId, params.userId),
        gt(schema.userInventory.quantityLevel, 0)
      )
    )

  // Subquery: recipes with missing anchor ingredients
  const recipesWithMissingAnchorsSubquery = adminDb
    .selectDistinct({ recipeId: schema.recipeIngredients.recipeId })
    .from(schema.recipeIngredients)
    .where(
      and(
        eq(schema.recipeIngredients.ingredientType, 'anchor'),
        sqlFn`${schema.recipeIngredients.ingredientId} NOT IN ${inStockIngredientsSubquery}`
      )
    )

  // Main query: user's recipes WITHOUT missing anchors = Tier 1
  return await adminDb
    .select({
      recipeId: schema.recipes.id,
      recipeName: schema.recipes.name,
      recipeDescription: schema.recipes.description,
      isSeeded: schema.recipes.isSeeded,
      userRecipeId: schema.userRecipes.id,
      source: schema.userRecipes.source,
    })
    .from(schema.recipes)
    .innerJoin(
      schema.userRecipes,
      eq(schema.recipes.id, schema.userRecipes.recipeId)
    )
    .where(
      and(
        eq(schema.userRecipes.userId, params.userId),
        sqlFn`${schema.recipes.id} NOT IN ${recipesWithMissingAnchorsSubquery}`
      )
    )
}

/**
 * Cooking flow transaction example
 * Records cooking event AND updates inventory quantities atomically
 */
export async function recordCooking(params: {
  userId: string
  recipeId: string
  recipeName: string
  ingredientUpdates: Array<{ ingredientId: string; quantityDecrease: number }>
}) {
  return await adminDb.transaction(async (tx) => {
    // 1. Insert cooking log entry
    const [cookingLogEntry] = await tx
      .insert(schema.cookingLog)
      .values({
        userId: params.userId,
        recipeId: params.recipeId,
        recipeName: params.recipeName,
        cookedAt: new Date(),
      })
      .returning()

    // 2. Update inventory quantities for consumed ingredients
    for (const update of params.ingredientUpdates) {
      // Get current quantity
      const [currentInventory] = await tx
        .select()
        .from(schema.userInventory)
        .where(
          and(
            eq(schema.userInventory.userId, params.userId),
            eq(schema.userInventory.ingredientId, update.ingredientId)
          )
        )

      if (!currentInventory) {
        throw new Error(
          `Ingredient ${update.ingredientId} not found in user inventory`
        )
      }

      // Calculate new quantity (minimum 0)
      const newQuantity = Math.max(
        0,
        currentInventory.quantityLevel - update.quantityDecrease
      )

      // Update quantity
      await tx
        .update(schema.userInventory)
        .set({
          quantityLevel: newQuantity,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.userInventory.userId, params.userId),
            eq(schema.userInventory.ingredientId, update.ingredientId)
          )
        )
    }

    return cookingLogEntry
  })
}
