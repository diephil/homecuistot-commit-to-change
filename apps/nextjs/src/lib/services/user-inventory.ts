/**
 * User Inventory Service
 *
 * Reusable functions for fetching user inventory data.
 */

import { eq, isNotNull } from 'drizzle-orm';
import { userInventory, ingredients } from '@/db/schema';
import { createUserDb } from '@/db/client';

interface GetUserInventoryParams {
  db: ReturnType<typeof createUserDb>;
}

/**
 * Fetch user's recognized inventory items with ingredient details.
 * Returns full row data for flexibility.
 */
export async function getUserInventory(params: GetUserInventoryParams) {
  const { db } = params;

  return db((tx) =>
    tx
      .select({
        id: userInventory.id,
        ingredientId: userInventory.ingredientId,
        ingredientName: ingredients.name,
        ingredientCategory: ingredients.category,
        quantityLevel: userInventory.quantityLevel,
        isPantryStaple: userInventory.isPantryStaple,
        updatedAt: userInventory.updatedAt,
      })
      .from(userInventory)
      .innerJoin(ingredients, eq(userInventory.ingredientId, ingredients.id))
      .where(isNotNull(userInventory.ingredientId))
  );
}
