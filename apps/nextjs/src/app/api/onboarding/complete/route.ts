import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createUserDb, decodeSupabaseToken } from '@/db/client';
import { userInventory, unrecognizedItems, userRecipes, recipeIngredients } from '@/db/schema';
import { CompleteRequestSchema, type CompleteResponse } from '@/types/onboarding';
import { matchIngredients } from '@/lib/services/ingredient-matcher';
import { ensureRecipeIngredientsAtQuantity } from '@/db/services/ensure-recipe-ingredients-at-quantity';

/**
 * Onboarding Complete Route
 *
 * Persists ingredients, pantry staples, and recipes from onboarding flow.
 * All operations occur in a single transaction for atomicity.
 */

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    // Auth validation
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const token = decodeSupabaseToken(session.access_token);
    const db = createUserDb(token);

    // Parse request
    const body = await request.json();
    const parseResult = CompleteRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.message },
        { status: 400 }
      );
    }

    const {
      ingredients: userIngredientNames,
      pantryStaples: userPantryStaples = [],
      recipes,
    } = parseResult.data;

    // Execute all operations in a transaction
    const result = await db(async (tx) => {
      // Collect all ingredient names from user input + recipes
      const recipeIngredientNames = recipes.flatMap((r) =>
        r.ingredients.map((i) => i.name.toLowerCase())
      );

      const allIngredientNames = [
        ...new Set([
          ...userIngredientNames.map((n) => n.toLowerCase()),
          ...userPantryStaples.map((n) => n.toLowerCase()),
          ...recipeIngredientNames,
        ]),
      ];

      // Match ingredient names against DB
      const matchResult = await matchIngredients({
        names: allIngredientNames,
        userId,
        tx,
      });

      // Create maps for quick lookup
      const ingredientMap = new Map(
        matchResult.ingredients.map((i) => [i.name.toLowerCase(), i])
      );
      const unrecognizedMap = new Map(
        matchResult.unrecognizedItems.map((u) => [u.rawText.toLowerCase(), u])
      );

      let inventoryCreated = 0;
      let unrecognizedIngredients = 0;
      let unrecognizedRecipeIngredients = 0;

      // Create new unrecognized_items
      if (matchResult.unrecognizedItemsToCreate.length > 0) {
        const insertedUnrecognized = await tx
          .insert(unrecognizedItems)
          .values(
            matchResult.unrecognizedItemsToCreate.map((rawText) => ({
              userId,
              rawText,
              context: 'ingredient',
            }))
          )
          .onConflictDoNothing()
          .returning();

        // Add newly created items to the map
        for (const item of insertedUnrecognized) {
          unrecognizedMap.set(item.rawText.toLowerCase(), {
            id: item.id,
            rawText: item.rawText,
          });
        }

        unrecognizedIngredients = insertedUnrecognized.length;
      }

      // Insert user_inventory entries for user-selected ingredients (quantity=3)
      const userIngredientLower = userIngredientNames.map((n) => n.toLowerCase());

      for (const name of userIngredientLower) {
        const matched = ingredientMap.get(name);
        const unrecognized = unrecognizedMap.get(name);

        if (matched) {
          const inserted = await tx
            .insert(userInventory)
            .values({
              userId,
              ingredientId: matched.id,
              quantityLevel: 3,
              isPantryStaple: false,
            })
            .onConflictDoNothing()
            .returning();

          if (inserted.length > 0) {
            inventoryCreated++;
          }
        } else if (unrecognized) {
          const inserted = await tx
            .insert(userInventory)
            .values({
              userId,
              unrecognizedItemId: unrecognized.id,
              quantityLevel: 3,
              isPantryStaple: false,
            })
            .onConflictDoNothing()
            .returning();

          if (inserted.length > 0) {
            inventoryCreated++;
          }
        }
      }

      // Insert pantry staples with isPantryStaple=true
      const pantryStaplesLower = userPantryStaples.map((n) => n.toLowerCase());

      for (const name of pantryStaplesLower) {
        const matched = ingredientMap.get(name);
        const unrecognized = unrecognizedMap.get(name);

        if (matched) {
          const inserted = await tx
            .insert(userInventory)
            .values({
              userId,
              ingredientId: matched.id,
              quantityLevel: 3,
              isPantryStaple: true,
            })
            .onConflictDoNothing()
            .returning();

          if (inserted.length > 0) {
            inventoryCreated++;
          }
        } else if (unrecognized) {
          const inserted = await tx
            .insert(userInventory)
            .values({
              userId,
              unrecognizedItemId: unrecognized.id,
              quantityLevel: 3,
              isPantryStaple: true,
            })
            .onConflictDoNothing()
            .returning();

          if (inserted.length > 0) {
            inventoryCreated++;
          }
        }
      }

      // Insert recipes and recipe ingredients
      let recipesCreated = 0;

      for (const recipe of recipes) {
        // Insert recipe
        const [insertedRecipe] = await tx
          .insert(userRecipes)
          .values({
            userId,
            name: recipe.name,
            description: recipe.description || null,
          })
          .returning();

        recipesCreated++;

        // Insert recipe ingredients
        const recipeIngredientValues = [];

        for (const ing of recipe.ingredients) {
          const matched = ingredientMap.get(ing.name.toLowerCase());
          const unrecognized = unrecognizedMap.get(ing.name.toLowerCase());

          if (matched) {
            recipeIngredientValues.push({
              recipeId: insertedRecipe.id,
              ingredientId: matched.id,
              unrecognizedItemId: null,
              ingredientType: ing.type,
            });
          } else if (unrecognized) {
            recipeIngredientValues.push({
              recipeId: insertedRecipe.id,
              ingredientId: null,
              unrecognizedItemId: unrecognized.id,
              ingredientType: ing.type,
            });
            unrecognizedRecipeIngredients++;
          }
        }

        if (recipeIngredientValues.length > 0) {
          await tx.insert(recipeIngredients).values(recipeIngredientValues);

          // Ensure recipe ingredients exist in inventory with quantity=3
          const recipeIngredientIds = recipeIngredientValues
            .map((v) => v.ingredientId)
            .filter((id): id is string => id !== null);

          if (recipeIngredientIds.length > 0) {
            await ensureRecipeIngredientsAtQuantity({
              tx,
              userId,
              ingredientIds: recipeIngredientIds,
              quantityLevel: 3,
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
    });

    // Return response with stats
    const response: CompleteResponse = {
      success: true,
      ...result,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[onboarding/complete] Error:', error);

    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
