import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createUserDb, decodeSupabaseToken } from '@/db/client';
import {
  userRecipes,
  recipeIngredients,
  userInventory,
  unrecognizedItems,
} from '@/db/schema';
import { PersistRequestSchema, type PersistResponse } from '@/types/onboarding';
import { BASIC_RECIPES, ADVANCED_RECIPES } from '@/constants/onboarding';
import { matchIngredients } from '@/lib/services/ingredient-matcher';

/**
 * T038-T047: Persist route for 019-onboarding-revamp
 * Spec: specs/019-onboarding-revamp/contracts/api.md
 *
 * Uses static recipes based on cookingSkill instead of LLM generation.
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

    // T038: Parse request with cookingSkill
    const body = await request.json();
    const parseResult = PersistRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.message },
        { status: 400 }
      );
    }

    const { cookingSkill, ingredients: userIngredientNames } = parseResult.data;

    // T041: Select recipe set based on skill
    const selectedRecipes =
      cookingSkill === 'basic'
        ? BASIC_RECIPES
        : [...BASIC_RECIPES, ...ADVANCED_RECIPES];

    // Collect all unique ingredient names from user input and static recipes
    const allIngredientNames = [
      ...new Set([
        ...userIngredientNames.map((n) => n.toLowerCase()),
        ...selectedRecipes.flatMap((r) =>
          r.ingredients.map((i) => i.name.toLowerCase())
        ),
      ]),
    ];

    // T045: Execute all operations in a transaction
    const result = await db(async (tx) => {
      // T039: Match ingredient names against DB
      const matchResult = await matchIngredients({
        names: allIngredientNames,
        userId,
        tx,
      });

      // Create map for quick lookup
      const ingredientMap = new Map(
        matchResult.ingredients.map((i) => [i.name.toLowerCase(), i])
      );
      const unrecognizedMap = new Map(
        matchResult.unrecognizedItems.map((u) => [u.rawText.toLowerCase(), u])
      );

      let recipesCreated = 0;
      let inventoryCreated = 0;

      // T040: Create new unrecognized_items for unrecognizedItemsToCreate
      // FR-040: Query back inserted IDs so they can be used for recipe_ingredients and inventory
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

        // Add newly created items to the map for recipe_ingredients and inventory lookups
        for (const item of insertedUnrecognized) {
          unrecognizedMap.set(item.rawText.toLowerCase(), {
            id: item.id,
            rawText: item.rawText,
          });
        }
      }

      // T042: Insert user_recipes from static dishes
      for (const recipe of selectedRecipes) {
        const insertedRecipes = await tx
          .insert(userRecipes)
          .values({
            name: recipe.title,
            description: recipe.description || null,
            userId,
          })
          .onConflictDoNothing()
          .returning();

        if (insertedRecipes.length > 0) {
          const insertedRecipe = insertedRecipes[0];
          recipesCreated++;

          // T043: Insert recipe_ingredients with anchor/optional types
          const ingredientsToInsert: Array<{
            recipeId: string;
            ingredientId?: string;
            unrecognizedItemId?: string;
            ingredientType: 'anchor' | 'optional';
          }> = [];

          for (const ing of recipe.ingredients) {
            const lowerName = ing.name.toLowerCase();
            const matched = ingredientMap.get(lowerName);
            const unrecognized = unrecognizedMap.get(lowerName);

            if (matched) {
              ingredientsToInsert.push({
                recipeId: insertedRecipe.id,
                ingredientId: matched.id,
                ingredientType: ing.type,
              });
            } else if (unrecognized) {
              ingredientsToInsert.push({
                recipeId: insertedRecipe.id,
                unrecognizedItemId: unrecognized.id,
                ingredientType: ing.type,
              });
            }
            // Skip ingredients that couldn't be matched (shouldn't happen for static data)
          }

          if (ingredientsToInsert.length > 0) {
            await tx
              .insert(recipeIngredients)
              .values(ingredientsToInsert)
              .onConflictDoNothing();
          }
        }
      }

      // T044: Insert user_inventory entries (quantity_level=3) for user ingredients
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
            })
            .onConflictDoNothing()
            .returning();

          if (inserted.length > 0) {
            inventoryCreated++;
          }
        } else if (unrecognized) {
          // FR-033: Add unrecognized items (existing + newly created) to inventory
          const inserted = await tx
            .insert(userInventory)
            .values({
              userId,
              unrecognizedItemId: unrecognized.id,
              quantityLevel: 3,
            })
            .onConflictDoNothing()
            .returning();

          if (inserted.length > 0) {
            inventoryCreated++;
          }
        }
      }

      return {
        recipesCreated,
        inventoryCreated,
        unrecognizedCount: matchResult.unrecognizedItemsToCreate.length,
      };
    });

    // T047: Return PersistResponse with counts
    const response: PersistResponse = {
      success: true,
      ...result,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[persist] Error:', error);

    return NextResponse.json(
      { error: 'Failed to persist data' },
      { status: 500 }
    );
  }
}
