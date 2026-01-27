/**
 * Database Client Configuration
 *
 * This module implements the Dual Client Pattern for Supabase + Drizzle ORM:
 * 1. Admin Client (adminDb) - Bypasses RLS policies
 * 2. User Client (createUserDb) - Respects RLS policies with auth context
 *
 * ## When to Use Which Client
 *
 * ### Use Admin Client (adminDb) for:
 * - Database migrations and schema changes
 * - Seeding initial data (recipes, ingredients)
 * - Background jobs and cron tasks
 * - Administrative operations (analytics, cleanup)
 * - System-level queries that need full database access
 *
 * ### Use User Client (createUserDb) for:
 * - All user-facing operations in Server Components
 * - Server Actions that modify user data
 * - API routes handling authenticated requests
 * - Any operation that should respect RLS policies
 *
 * ## RLS (Row Level Security) Pattern
 *
 * The user client factory sets PostgreSQL session variables to enable RLS:
 * - request.jwt.claims: Full JWT token for auth.jwt()
 * - request.jwt.claim.sub: User ID for auth.uid()
 * - role: PostgreSQL role (authenticated/anon)
 *
 * These variables allow RLS policies to filter queries based on user context.
 *
 * ## Example Usage
 *
 * ```typescript
 * // Server Component
 * import { createClient } from '@/utils/supabase/server'
 * import { createUserDb } from '@/db/client'
 *
 * export default async function InventoryPage() {
 *   const supabase = await createClient()
 *   const { data: { session } } = await supabase.auth.getSession()
 *   if (!session) redirect('/login')
 *
 *   const userDb = createUserDb(session.access_token)
 *   const inventory = await userDb((tx) =>
 *     tx.select().from(userInventory).where(eq(userInventory.userId, session.user.id))
 *   )
 *
 *   return <div>{...}</div>
 * }
 *
 * // Server Action
 * 'use server'
 * export async function updateInventory(ingredientId: string, quantity: number) {
 *   const supabase = await createClient()
 *   const { data: { session } } = await supabase.auth.getSession()
 *   if (!session) throw new Error('Unauthorized')
 *
 *   const userDb = createUserDb(session.access_token)
 *   await userDb((tx) =>
 *     tx.update(userInventory)
 *       .set({ quantityLevel: quantity })
 *       .where(eq(userInventory.ingredientId, ingredientId))
 *   )
 * }
 *
 * // Admin Seed Script
 * import { adminDb } from '@/db/client'
 *
 * async function seedIngredients() {
 *   await adminDb.insert(ingredients).values([
 *     { name: 'Chicken', category: 'meat' },
 *     // ...
 *   ])
 * }
 * ```
 *
 * ## Security Considerations
 *
 * - Never expose adminDb to client-side code
 * - Always validate session before creating user client
 * - Use adminDb only in controlled server environments
 * - Define RLS policies in Supabase dashboard or migrations
 * - Test RLS enforcement with multiple user contexts
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

// Validate environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required in environment");
}

/**
 * Admin Database Client
 *
 * Bypasses Row Level Security (RLS) policies.
 * Use only for:
 * - Migrations and seeding
 * - Background jobs
 * - Administrative operations
 * - System-level queries
 *
 * ⚠️ WARNING: Never expose this client to user-facing operations
 */
const adminClient = postgres(process.env.DATABASE_URL, { prepare: false });
export const adminDb = drizzle({ client: adminClient, schema });

/**
 * User Database Client (Base)
 *
 * Internal client used by createUserDb factory.
 * Respects RLS policies when session variables are set.
 *
 * Do not use directly - use createUserDb() instead.
 */
const userClient = postgres(process.env.DATABASE_URL, { prepare: false });
export const userDb = drizzle({ client: userClient, schema });

/**
 * Supabase JWT Token Structure
 *
 * Standard JWT claims used for RLS context.
 * Based on official Drizzle ORM Supabase integration pattern.
 * @see {@link https://orm.drizzle.team/docs/rls | Drizzle RLS Documentation}
 */
export type SupabaseToken = {
  /** Issuer - Supabase project URL */
  iss?: string;
  /** Subject - User ID (required for RLS) */
  sub?: string;
  /** Audience - typically 'authenticated' */
  aud?: string[] | string;
  /** Expiration time (Unix timestamp in seconds) */
  exp?: number;
  /** Not before time (Unix timestamp in seconds) */
  nbf?: number;
  /** Issued at time (Unix timestamp in seconds) */
  iat?: number;
  /** JWT ID - unique identifier */
  jti?: string;
  /** PostgreSQL role - 'authenticated', 'anon', or custom */
  role?: string;
};

/**
 * Decode Supabase JWT Access Token
 *
 * Safely decodes a Supabase JWT access token into a SupabaseToken object.
 * This is the recommended approach per Drizzle ORM docs.
 *
 * @param accessToken - Raw JWT access token from Supabase session
 * @returns Decoded SupabaseToken object
 * @throws {Error} If token is invalid or cannot be decoded
 *
 * @example
 * ```typescript
 * const supabase = await createClient()
 * const { data: { session } } = await supabase.auth.getSession()
 * const token = decodeSupabaseToken(session.access_token)
 * const db = createUserDb(token)
 * ```
 */
export function decodeSupabaseToken(accessToken: string): SupabaseToken {
  try {
    // JWT format: header.payload.signature
    const parts = accessToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Decode the payload (second part)
    const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
    return JSON.parse(payload) as SupabaseToken;
  } catch (error) {
    throw new Error(
      `Failed to decode Supabase token: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Create User Database Client Factory
 *
 * Creates an RLS-aware database client that respects Supabase auth context.
 * Sets PostgreSQL session variables to enable RLS policies.
 *
 * @param token - Supabase JWT token from session.access_token
 * @returns Transaction function that executes queries with RLS context
 *
 * @throws {Error} If token is invalid, missing sub claim, or expired
 *
 * @example
 * ```typescript
 * const supabase = await createClient()
 * const { data: { session } } = await supabase.auth.getSession()
 * if (!session) throw new Error('Unauthorized')
 *
 * const userDb = createUserDb(session.access_token)
 * const data = await userDb((tx) =>
 *   tx.select().from(userInventory)
 * )
 * ```
 *
 * ## How RLS Works
 *
 * 1. Function validates token and extracts user context
 * 2. Within transaction, sets PostgreSQL session variables:
 *    - request.jwt.claims: Full token for auth.jwt()
 *    - request.jwt.claim.sub: User ID for auth.uid()
 *    - role: PostgreSQL role (authenticated/anon)
 * 3. All queries in transaction respect RLS policies
 * 4. Session variables reset after transaction completes
 *
 * ## RLS Policy Example
 *
 * ```sql
 * -- In Supabase migration or dashboard:
 * CREATE POLICY "Users can only see their own inventory"
 * ON user_inventory
 * FOR SELECT
 * USING (auth.uid()::text = user_id);
 * ```
 *
 * With this policy, queries via createUserDb automatically filter to current user.
 *
 * @see {@link https://orm.drizzle.team/docs/rls | Drizzle RLS Documentation}
 * @see {@link https://supabase.com/docs/guides/auth/row-level-security | Supabase RLS Guide}
 */
export function createUserDb(token: SupabaseToken) {
  // Validate token has required fields
  if (!token || typeof token !== "object") {
    throw new Error("Invalid token: token must be a valid object");
  }

  if (!token.sub) {
    throw new Error("Invalid token: missing user ID (sub claim)");
  }

  // Validate token is not expired
  if (token.exp && token.exp * 1000 < Date.now()) {
    throw new Error("Invalid token: token has expired");
  }

  return (async (transaction, ...rest) => {
    return await userDb.transaction(
      async (tx) => {
        try {
          // Set Supabase RLS context variables for auth.uid() and auth.jwt()
          await tx.execute(sql`
          -- auth.jwt()
          select set_config('request.jwt.claims', '${sql.raw(
            JSON.stringify(token),
          )}', TRUE);
          -- auth.uid()
          select set_config('request.jwt.claim.sub', '${sql.raw(
            token.sub ?? "",
          )}', TRUE);
          -- set local role
          set local role ${sql.raw(token.role ?? "anon")};
        `);
          return await transaction(tx);
        } finally {
          // Reset session variables
          await tx.execute(sql`
          select set_config('request.jwt.claims', NULL, TRUE);
          select set_config('request.jwt.claim.sub', NULL, TRUE);
          reset role;
        `);
        }
      },
      ...rest,
    );
  }) as typeof userDb.transaction;
}

// Type exports for query results
export type Ingredient = typeof schema.ingredients.$inferSelect;
export type NewIngredient = typeof schema.ingredients.$inferInsert;

export type Recipe = typeof schema.userRecipes.$inferSelect;
export type NewRecipe = typeof schema.userRecipes.$inferInsert;
export type RecipeIngredient = typeof schema.recipeIngredients.$inferSelect;
export type NewRecipeIngredient = typeof schema.recipeIngredients.$inferInsert;

export type UserInventory = typeof schema.userInventory.$inferSelect;
export type NewUserInventory = typeof schema.userInventory.$inferInsert;

export type UserRecipe = typeof schema.userRecipes.$inferSelect;
export type NewUserRecipe = typeof schema.userRecipes.$inferInsert;

export type CookingLog = typeof schema.cookingLog.$inferSelect;
export type NewCookingLog = typeof schema.cookingLog.$inferInsert;

export type UnrecognizedItem = typeof schema.unrecognizedItems.$inferSelect;
export type NewUnrecognizedItem = typeof schema.unrecognizedItems.$inferInsert;

/**
 * CRUD Helper Functions
 *
 * ⚠️ These helpers use adminDb and bypass RLS. They are for:
 * - Admin scripts, seed data, background jobs only
 *
 * For user-facing operations, use Server Actions in @/app/actions/
 * which implement RLS-aware patterns with createUserDb
 *
 * Functions prefixed with `admin` bypass RLS and should NEVER be exposed
 * to client-side code or used in API routes/Server Actions.
 */

import { eq, and, gt, desc, sql as sqlFn } from "drizzle-orm";

/**
 * Get all ingredients from catalog
 */
export async function getIngredients() {
  return await adminDb.select().from(schema.ingredients);
}

/**
 * Get ingredients by category
 */
export async function getIngredientsByCategory(params: {
  category: Ingredient["category"];
}) {
  return await adminDb
    .select()
    .from(schema.ingredients)
    .where(eq(schema.ingredients.category, params.category));
}

/**
 * Add or update inventory item (upsert) - ADMIN ONLY
 *
 * ⚠️ Uses adminDb - bypasses RLS. For admin/seed operations only.
 * For user operations, use server action: @/app/actions/inventory.addInventoryItem
 */
export async function adminAddInventoryItem(params: {
  userId: string;
  ingredientId: string;
  quantityLevel: number;
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
    .returning();
}

/**
 * Update inventory quantity - ADMIN ONLY
 *
 * ⚠️ Uses adminDb - bypasses RLS. For admin/seed operations only.
 * For user operations, use server action: @/app/actions/inventory.updateInventoryQuantity
 */
export async function adminUpdateInventoryQuantity(params: {
  userId: string;
  ingredientId: string;
  quantityLevel: number;
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
        eq(schema.userInventory.ingredientId, params.ingredientId),
      ),
    )
    .returning();
}

/**
 * Delete inventory item - ADMIN ONLY
 *
 * ⚠️ Uses adminDb - bypasses RLS. For admin/seed operations only.
 * For user operations, use server action: @/app/actions/inventory.deleteInventoryItem
 */
export async function adminDeleteInventoryItem(params: {
  userId: string;
  ingredientId: string;
}) {
  return await adminDb
    .delete(schema.userInventory)
    .where(
      and(
        eq(schema.userInventory.userId, params.userId),
        eq(schema.userInventory.ingredientId, params.ingredientId),
      ),
    )
    .returning();
}

/**
 * Get user's inventory with ingredient details (join)
 */
export async function getUserInventoryWithIngredients(params: {
  userId: string;
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
    })
    .from(schema.userInventory)
    .innerJoin(
      schema.ingredients,
      eq(schema.userInventory.ingredientId, schema.ingredients.id),
    )
    .where(eq(schema.userInventory.userId, params.userId))
    .orderBy(desc(schema.userInventory.updatedAt));
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
        gt(schema.userInventory.quantityLevel, 0),
      ),
    );

  // Typed constant for ingredient type filter
  const ANCHOR_TYPE: RecipeIngredient["ingredientType"] = "anchor";

  // Subquery: recipes with missing anchor ingredients
  const recipesWithMissingAnchorsSubquery = adminDb
    .selectDistinct({ recipeId: schema.recipeIngredients.recipeId })
    .from(schema.recipeIngredients)
    .where(
      and(
        eq(schema.recipeIngredients.ingredientType, ANCHOR_TYPE),
        sqlFn`${schema.recipeIngredients.ingredientId} NOT IN ${inStockIngredientsSubquery}`,
      ),
    );

  // Main query: user's recipes WITHOUT missing anchors = Tier 1
  return await adminDb
    .select({
      recipeId: schema.userRecipes.id,
      recipeName: schema.userRecipes.name,
      recipeDescription: schema.userRecipes.description,
    })
    .from(schema.userRecipes)
    .where(
      and(
        eq(schema.userRecipes.userId, params.userId),
        sqlFn`${schema.userRecipes.id} NOT IN ${recipesWithMissingAnchorsSubquery}`,
      ),
    );
}

/**
 * Cooking flow transaction example
 * Records cooking event AND updates inventory quantities atomically
 */
export async function recordCooking(params: {
  userId: string;
  recipeId: string;
  recipeName: string;
  ingredientUpdates: Array<{ ingredientId: string; quantityDecrease: number }>;
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
      .returning();

    // 2. Update inventory quantities for consumed ingredients
    for (const update of params.ingredientUpdates) {
      // Get current quantity
      const [currentInventory] = await tx
        .select()
        .from(schema.userInventory)
        .where(
          and(
            eq(schema.userInventory.userId, params.userId),
            eq(schema.userInventory.ingredientId, update.ingredientId),
          ),
        );

      if (!currentInventory) {
        throw new Error(
          `Ingredient ${update.ingredientId} not found in user inventory`,
        );
      }

      // Calculate new quantity (minimum 0)
      const newQuantity = Math.max(
        0,
        currentInventory.quantityLevel - update.quantityDecrease,
      );

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
            eq(schema.userInventory.ingredientId, update.ingredientId),
          ),
        );
    }

    return cookingLogEntry;
  });
}
