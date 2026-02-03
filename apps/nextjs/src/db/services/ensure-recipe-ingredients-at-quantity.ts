/**
 * Ensure Recipe Ingredients at Specific Quantity Level
 *
 * Inserts/updates recipe ingredients in user inventory with a custom quantity level.
 * Used during onboarding to add recipe ingredients at quantity=3.
 *
 * ## Purpose
 *
 * Maintains inventory consistency by ensuring recipe ingredients exist with
 * appropriate quantity levels. Unlike ensureIngredientsInInventory (quantity=0),
 * this allows specifying custom quantities for different contexts.
 *
 * ## Usage
 *
 * Called from:
 * - Onboarding complete route (add recipe ingredients at quantity=3)
 * - Future bulk operations requiring non-zero quantities
 *
 * ## Behavior
 *
 * - Idempotent: safe to call multiple times with same data
 * - Transaction-safe: uses passed transaction parameter
 * - Never decreases quantities: only updates when new quantity is greater
 * - Handles duplicates: deduplicates ingredient IDs before processing
 * - Explicit control: queries first, then inserts or updates as needed
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
 *   // Ensure all ingredients exist in inventory with quantity=3
 *   const ingredientIds = ingredients.map(i => i.ingredientId).filter(Boolean);
 *   await ensureRecipeIngredientsAtQuantity({
 *     tx,
 *     userId,
 *     ingredientIds,
 *     quantityLevel: 3
 *   });
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
 * Ensure Recipe Ingredients Exist at Specific Quantity Level
 *
 * Adds/updates ingredients in user inventory with specified quantity level.
 * Never decreases existing quantities (uses GREATEST logic).
 *
 * @param params.tx - Drizzle transaction instance
 * @param params.userId - User ID who owns the inventory
 * @param params.ingredientIds - Array of ingredient IDs to ensure exist
 * @param params.quantityLevel - Desired quantity level (0-3)
 *
 * @throws {Error} If database operation fails (handled by transaction rollback)
 *
 * @example
 * ```typescript
 * const ingredientIds = recipe.ingredients
 *   .map(i => i.ingredientId)
 *   .filter((id): id is string => id !== null && id !== undefined);
 *
 * await ensureRecipeIngredientsAtQuantity({
 *   tx,
 *   userId: session.user.id,
 *   ingredientIds,
 *   quantityLevel: 3
 * });
 * ```
 */
export async function ensureRecipeIngredientsAtQuantity(params: {
  tx: DrizzleTransaction;
  userId: string;
  ingredientIds: string[];
  quantityLevel: number;
}): Promise<void> {
  const { tx, userId, ingredientIds, quantityLevel } = params;

  // Early exit if no ingredients
  if (ingredientIds.length === 0) return;

  // Remove duplicates
  const uniqueIds = [...new Set(ingredientIds)];

  // Query existing inventory for these ingredients
  const existingInventory = await tx
    .select()
    .from(userInventory)
    .where(
      and(
        eq(userInventory.userId, userId),
        inArray(userInventory.ingredientId, uniqueIds)
      )
    );

  // Build map of existing inventory
  const existingMap = new Map(
    existingInventory.map((inv) => [inv.ingredientId, inv])
  );

  // Process each ingredient
  for (const ingredientId of uniqueIds) {
    const existing = existingMap.get(ingredientId);

    if (existing) {
      // Update only if new quantity is greater
      if (existing.quantityLevel < quantityLevel) {
        await tx
          .update(userInventory)
          .set({ quantityLevel })
          .where(eq(userInventory.id, existing.id));
      }
    } else {
      // Insert new entry
      await tx.insert(userInventory).values({
        userId,
        ingredientId,
        quantityLevel,
        isPantryStaple: false,
        unrecognizedItemId: null,
      });
    }
  }
}
