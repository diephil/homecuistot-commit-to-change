/**
 * Ensure Recipe Ingredients in User Inventory
 *
 * This service ensures all recognized ingredients from a recipe exist in the
 * user's inventory with quantityLevel=0 if not already present.
 *
 * ## Purpose
 *
 * Maintains data consistency by ensuring recipes never reference ingredients
 * that don't exist in the user's inventory. This is critical for recipe
 * availability calculations and inventory management.
 *
 * ## Usage
 *
 * Called from:
 * - Onboarding persist route (batch recipe insertion)
 * - Manual recipe creation (createRecipe action)
 * - Manual recipe update (updateRecipe action)
 * - Agent proposal application (handleCreate, handleUpdate)
 *
 * ## Behavior
 *
 * - Idempotent: safe to call multiple times with same data
 * - Transaction-safe: uses passed transaction parameter
 * - Respects existing quantities: never modifies existing inventory levels
 * - Handles duplicates: deduplicates ingredient IDs before processing
 * - Race condition safe: uses onConflictDoNothing for concurrent calls
 *
 * @example
 * ```typescript
 * await db(async (tx) => {
 *   // Insert recipe
 *   const [recipe] = await tx.insert(userRecipes).values(...).returning();
 *
 *   // Insert recipe ingredients
 *   await tx.insert(recipeIngredients).values(...);
 *
 *   // Ensure all ingredients exist in inventory
 *   const ingredientIds = ingredients.map(i => i.ingredientId).filter(Boolean);
 *   await ensureIngredientsInInventory({ tx, userId, ingredientIds });
 * });
 * ```
 */

import { eq, and, inArray } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import type * as schema from "@/db/schema";
import { userInventory } from "@/db/schema/user-inventory";

/**
 * Transaction type matching createUserDb and adminDb patterns
 * Uses any for ExtractTablesWithRelations generic (Drizzle internal)
 */
type DrizzleTransaction = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof schema,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>;

/**
 * Ensure Ingredients Exist in User Inventory
 *
 * Adds missing ingredients to user inventory with quantityLevel=0.
 * Never modifies existing inventory entries.
 *
 * @param params.tx - Drizzle transaction instance
 * @param params.userId - User ID who owns the inventory
 * @param params.ingredientIds - Array of ingredient IDs to ensure exist
 *
 * @throws {Error} If database operation fails (handled by transaction rollback)
 *
 * @example
 * ```typescript
 * const ingredientIds = recipe.ingredients
 *   .map(i => i.ingredientId)
 *   .filter((id): id is string => id !== null && id !== undefined);
 *
 * await ensureIngredientsInInventory({
 *   tx,
 *   userId: session.user.id,
 *   ingredientIds
 * });
 * ```
 */
export async function ensureIngredientsInInventory(params: {
  tx: DrizzleTransaction;
  userId: string;
  ingredientIds: string[];
}): Promise<void> {
  const { tx, userId, ingredientIds } = params;

  // Early exit if no ingredients
  if (ingredientIds.length === 0) return;

  // Remove duplicates
  const uniqueIds = [...new Set(ingredientIds)];

  // Query existing inventory for this user + ingredient IDs
  const existingInventory = await tx
    .select({ ingredientId: userInventory.ingredientId })
    .from(userInventory)
    .where(
      and(
        eq(userInventory.userId, userId),
        inArray(userInventory.ingredientId, uniqueIds)
      )
    );

  // Build set of existing ingredient IDs
  const existingIds = new Set(
    existingInventory
      .map((inv) => inv.ingredientId)
      .filter((id): id is string => id !== null)
  );

  // Compute missing ingredients (set difference)
  const missingIds = uniqueIds.filter((id) => !existingIds.has(id));

  // Batch insert missing ingredients with quantity 0
  if (missingIds.length > 0) {
    await tx
      .insert(userInventory)
      .values(
        missingIds.map((ingredientId) => ({
          userId,
          ingredientId,
          quantityLevel: 0,
          isPantryStaple: false,
          unrecognizedItemId: null,
        }))
      )
      .onConflictDoNothing(); // Handle race conditions gracefully
  }
}
