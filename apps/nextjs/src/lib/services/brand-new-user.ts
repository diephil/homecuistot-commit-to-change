import { eq } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import { userInventory, userRecipes } from "@/db/schema";

/**
 * Check if a user is brand-new (no inventory and no recipes).
 * Accepts a transaction for reuse inside API route transactions.
 */
export async function isNewUser(params: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: PgTransaction<any, any, any>;
  userId: string;
}): Promise<boolean> {
  const { tx, userId } = params;

  const [inventoryResult, recipeResult] = await Promise.all([
    tx
      .select({ id: userInventory.id })
      .from(userInventory)
      .where(eq(userInventory.userId, userId))
      .limit(1),
    tx
      .select({ id: userRecipes.id })
      .from(userRecipes)
      .where(eq(userRecipes.userId, userId))
      .limit(1),
  ]);

  return inventoryResult.length === 0 && recipeResult.length === 0;
}
