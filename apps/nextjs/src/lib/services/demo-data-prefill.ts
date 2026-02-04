import type { PgTransaction } from "drizzle-orm/pg-core";
import {
  userInventory,
  unrecognizedItems,
  userRecipes,
  recipeIngredients,
} from "@/db/schema";
import { matchIngredients } from "@/lib/services/ingredient-matcher";
import { ensureRecipeIngredientsAtQuantity } from "@/db/services/ensure-recipe-ingredients-at-quantity";
import type { StoryCompleteRequest } from "@/lib/story-onboarding/types";

/**
 * Pre-fill demo data for brand-new users completing story onboarding.
 * Must run inside a Drizzle transaction. Follows the same pattern as
 * /api/onboarding/complete/route.ts but accepts structured params.
 */
export async function prefillDemoData(params: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: PgTransaction<any, any, any>;
  userId: string;
  ingredients: Array<{ name: string; quantityLevel: number }>;
  pantryStaples: Array<{ name: string; quantityLevel: number }>;
  recipes: StoryCompleteRequest["recipes"];
}): Promise<{
  inventoryCreated: number;
  recipesCreated: number;
  unrecognizedIngredients: number;
  unrecognizedRecipeIngredients: number;
}> {
  const {
    tx,
    userId,
    ingredients: userIngredients,
    pantryStaples,
    recipes,
  } = params;

  // Collect all ingredient names
  const recipeIngredientNames = recipes.flatMap((r) =>
    r.ingredients.map((i) => i.name.toLowerCase()),
  );

  const allNames = [
    ...new Set([
      ...userIngredients.map((item) => item.name.toLowerCase()),
      ...pantryStaples.map((item) => item.name.toLowerCase()),
      ...recipeIngredientNames,
    ]),
  ];

  // Match names → IDs
  const matchResult = await matchIngredients({ names: allNames, userId, tx });

  // Build lookup maps
  const ingredientMap = new Map(
    matchResult.ingredients.map((i) => [i.name.toLowerCase(), i]),
  );
  const unrecognizedMap = new Map(
    matchResult.unrecognizedItems.map((u) => [u.rawText.toLowerCase(), u]),
  );

  let inventoryCreated = 0;
  let unrecognizedIngredients = 0;
  let unrecognizedRecipeIngredients = 0;

  // Create new unrecognized_items
  if (matchResult.unrecognizedItemsToCreate.length > 0) {
    const inserted = await tx
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

    for (const item of inserted) {
      unrecognizedMap.set(item.rawText.toLowerCase(), {
        id: item.id,
        rawText: item.rawText,
      });
    }
    unrecognizedIngredients = inserted.length;
  }

  // Insert tracked ingredients with per-item quantityLevel
  for (const item of userIngredients) {
    const matched = ingredientMap.get(item.name.toLowerCase());
    const unrecognized = unrecognizedMap.get(item.name.toLowerCase());

    if (matched) {
      const ins = await tx
        .insert(userInventory)
        .values({
          userId,
          ingredientId: matched.id,
          quantityLevel: item.quantityLevel,
          isPantryStaple: false,
        })
        .onConflictDoNothing()
        .returning();
      if (ins.length > 0) inventoryCreated++;
    } else if (unrecognized) {
      const ins = await tx
        .insert(userInventory)
        .values({
          userId,
          unrecognizedItemId: unrecognized.id,
          quantityLevel: item.quantityLevel,
          isPantryStaple: false,
        })
        .onConflictDoNothing()
        .returning();
      if (ins.length > 0) inventoryCreated++;
    }
  }

  // Insert pantry staples with per-item quantityLevel (isPantryStaple=true)
  for (const item of pantryStaples) {
    const matched = ingredientMap.get(item.name.toLowerCase());
    const unrecognized = unrecognizedMap.get(item.name.toLowerCase());

    if (matched) {
      const ins = await tx
        .insert(userInventory)
        .values({
          userId,
          ingredientId: matched.id,
          quantityLevel: item.quantityLevel,
          isPantryStaple: true,
        })
        .onConflictDoNothing()
        .returning();
      if (ins.length > 0) inventoryCreated++;
    } else if (unrecognized) {
      const ins = await tx
        .insert(userInventory)
        .values({
          userId,
          unrecognizedItemId: unrecognized.id,
          quantityLevel: item.quantityLevel,
          isPantryStaple: true,
        })
        .onConflictDoNothing()
        .returning();
      if (ins.length > 0) inventoryCreated++;
    }
  }

  // Insert recipes + recipe ingredients
  let recipesCreated = 0;

  for (const recipe of recipes) {
    const [insertedRecipe] = await tx
      .insert(userRecipes)
      .values({
        userId,
        name: recipe.name,
        description: recipe.description || null,
      })
      .returning();

    recipesCreated++;

    const riValues = [];
    for (const ing of recipe.ingredients) {
      const matched = ingredientMap.get(ing.name.toLowerCase());
      const unrecognized = unrecognizedMap.get(ing.name.toLowerCase());

      if (matched) {
        riValues.push({
          recipeId: insertedRecipe.id,
          ingredientId: matched.id,
          unrecognizedItemId: null,
          ingredientType: ing.type,
        });
      } else if (unrecognized) {
        riValues.push({
          recipeId: insertedRecipe.id,
          ingredientId: null,
          unrecognizedItemId: unrecognized.id,
          ingredientType: ing.type,
        });
        unrecognizedRecipeIngredients++;
      }
    }

    if (riValues.length > 0) {
      await tx.insert(recipeIngredients).values(riValues);

      const knownIds = riValues
        .map((v) => v.ingredientId)
        .filter((id): id is string => id !== null);

      if (knownIds.length > 0) {
        await ensureRecipeIngredientsAtQuantity({
          tx,
          userId,
          ingredientIds: knownIds,
          quantityLevel: 1,
        });
      }
    }
  }

  return {
    inventoryCreated,
    recipesCreated,
    unrecognizedIngredients,
    unrecognizedRecipeIngredients,
  };
}
