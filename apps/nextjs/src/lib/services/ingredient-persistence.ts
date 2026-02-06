import type { PgTransaction } from "drizzle-orm/pg-core";
import { userInventory, unrecognizedItems } from "@/db/schema";
import { matchIngredients } from "@/lib/services/ingredient-matcher";

interface PersistUserIngredientsParams {
  userId: string;
  ingredientNames: string[];
  pantryStapleNames: string[];
  /** Optional superset of names for matching (e.g. includes recipe ingredient names).
   *  If omitted, derived from ingredientNames + pantryStapleNames. */
  allNames?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: PgTransaction<any, any, any>;
}

export interface PersistUserIngredientsResult {
  inventoryCreated: number;
  unrecognizedCount: number;
  ingredientMap: Map<string, { id: string; name: string }>;
  unrecognizedMap: Map<string, { id: string; rawText: string }>;
}

/**
 * Persist user ingredients and pantry staples within a transaction.
 * Shared between onboarding/persist and onboarding/complete routes.
 *
 * 1. Match all names against ingredients + unrecognized_items tables
 * 2. Create new unrecognized items for unknown names
 * 3. Upsert user_inventory entries (ingredients as non-staple, pantry staples as staple)
 * 4. Return counts + lookup maps for downstream use (e.g. recipe ingredient linking)
 */
export async function persistUserIngredients(
  params: PersistUserIngredientsParams,
): Promise<PersistUserIngredientsResult> {
  const { userId, ingredientNames, pantryStapleNames, allNames, tx } = params;

  // Derive unique names for matching
  const namesToMatch = allNames ?? [
    ...new Set([
      ...ingredientNames.map((n) => n.toLowerCase()),
      ...pantryStapleNames.map((n) => n.toLowerCase()),
    ]),
  ];

  // Match against DB
  const matchResult = await matchIngredients({
    names: namesToMatch,
    userId,
    tx,
  });

  // Build lookup maps
  const ingredientMap = new Map(
    matchResult.ingredients.map((i) => [i.name.toLowerCase(), i]),
  );
  const unrecognizedMap = new Map(
    matchResult.unrecognizedItems.map((u) => [u.rawText.toLowerCase(), u]),
  );

  // Create new unrecognized items
  if (matchResult.unrecognizedItemsToCreate.length > 0) {
    const insertedUnrecognized = await tx
      .insert(unrecognizedItems)
      .values(
        matchResult.unrecognizedItemsToCreate.map((rawText) => ({
          userId,
          rawText,
          context: "ingredient",
        })),
      )
      .onConflictDoNothing()
      .returning();

    for (const item of insertedUnrecognized) {
      unrecognizedMap.set(item.rawText.toLowerCase(), {
        id: item.id,
        rawText: item.rawText,
      });
    }
  }

  let inventoryCreated = 0;

  // Upsert inventory for user ingredients (isPantryStaple: false)
  for (const name of ingredientNames.map((n) => n.toLowerCase())) {
    inventoryCreated += await upsertInventoryItem({
      tx,
      userId,
      name,
      isPantryStaple: false,
      ingredientMap,
      unrecognizedMap,
    });
  }

  // Upsert inventory for pantry staples (isPantryStaple: true)
  for (const name of pantryStapleNames.map((n) => n.toLowerCase())) {
    inventoryCreated += await upsertInventoryItem({
      tx,
      userId,
      name,
      isPantryStaple: true,
      ingredientMap,
      unrecognizedMap,
    });
  }

  return {
    inventoryCreated,
    unrecognizedCount: matchResult.unrecognizedItemsToCreate.length,
    ingredientMap,
    unrecognizedMap,
  };
}

/** Insert a single user_inventory row, returning 1 if created, 0 if conflict. */
async function upsertInventoryItem(params: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: PgTransaction<any, any, any>;
  userId: string;
  name: string;
  isPantryStaple: boolean;
  ingredientMap: Map<string, { id: string; name: string }>;
  unrecognizedMap: Map<string, { id: string; rawText: string }>;
}): Promise<number> {
  const { tx, userId, name, isPantryStaple, ingredientMap, unrecognizedMap } =
    params;
  const matched = ingredientMap.get(name);
  const unrecognized = unrecognizedMap.get(name);

  if (matched) {
    const inserted = await tx
      .insert(userInventory)
      .values({
        userId,
        ingredientId: matched.id,
        quantityLevel: 3,
        isPantryStaple,
      })
      .onConflictDoNothing()
      .returning();
    return inserted.length > 0 ? 1 : 0;
  }

  if (unrecognized) {
    const inserted = await tx
      .insert(userInventory)
      .values({
        userId,
        unrecognizedItemId: unrecognized.id,
        quantityLevel: 3,
        isPantryStaple,
      })
      .onConflictDoNothing()
      .returning();
    return inserted.length > 0 ? 1 : 0;
  }

  return 0;
}
