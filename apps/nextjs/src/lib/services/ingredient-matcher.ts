import { sql } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import { ingredients, unrecognizedItems } from "@/db/schema";
import type { IngredientMatchResult } from "@/types/onboarding";

/**
 * T007: matchIngredients - Match ingredient names against DB
 * Spec: specs/019-onboarding-revamp/contracts/api.md
 *
 * Logic:
 * 1. Query ingredients table with case-insensitive match
 * 2. Track matched names
 * 3. Query unrecognized_items for remaining names
 * 4. Return unmatched as unrecognizedItemsToCreate
 * 5. Per FR-029: If same name in both, prioritize ingredients table
 */

interface MatchIngredientsParams {
  names: string[];
  userId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: PgTransaction<any, any, any>;
}

export async function matchIngredients(
  params: MatchIngredientsParams,
): Promise<IngredientMatchResult> {
  const { names, userId, tx } = params;

  if (names.length === 0) {
    return {
      ingredients: [],
      unrecognizedItems: [],
      unrecognizedItemsToCreate: [],
    };
  }

  // Normalize names to lowercase for matching
  const normalizedNames = names.map((n) => n.toLowerCase().trim());
  const uniqueNames = [...new Set(normalizedNames)];

  // 1. Query ingredients table (case-insensitive)
  const matchedIngredients = await tx
    .select({ id: ingredients.id, name: ingredients.name })
    .from(ingredients)
    .where(
      sql`LOWER(${ingredients.name}) IN (${sql.join(
        uniqueNames.map((n) => sql`${n}`),
        sql`, `,
      )})`,
    );

  // Track matched ingredient names
  const matchedIngredientNames = new Set(
    matchedIngredients.map((i) => i.name.toLowerCase()),
  );

  // 2. Find remaining names not matched to ingredients
  const remainingNames = uniqueNames.filter(
    (n) => !matchedIngredientNames.has(n),
  );

  // 3. Query user's unrecognized_items for remaining names
  let matchedUnrecognized: Array<{ id: string; rawText: string }> = [];

  if (remainingNames.length > 0) {
    matchedUnrecognized = await tx
      .select({ id: unrecognizedItems.id, rawText: unrecognizedItems.rawText })
      .from(unrecognizedItems)
      .where(
        sql`${unrecognizedItems.userId} = ${userId} AND LOWER(${unrecognizedItems.rawText}) IN (${sql.join(
          remainingNames.map((n) => sql`${n}`),
          sql`, `,
        )})`,
      );
  }

  // Track matched unrecognized names
  const matchedUnrecognizedNames = new Set(
    matchedUnrecognized.map((u) => u.rawText.toLowerCase()),
  );

  // 4. Find names that need to be created as new unrecognized items
  const unrecognizedItemsToCreate = remainingNames.filter(
    (n) => !matchedUnrecognizedNames.has(n),
  );

  return {
    ingredients: matchedIngredients,
    unrecognizedItems: matchedUnrecognized,
    unrecognizedItemsToCreate,
  };
}
