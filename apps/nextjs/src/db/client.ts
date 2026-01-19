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
