import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createUserDb, decodeSupabaseToken } from '@/db/client';
import {
  ingredients,
  userRecipes,
  recipeIngredients,
  userInventory,
  unrecognizedItems,
} from '@/db/schema';
import { sql } from 'drizzle-orm';
import { PersistRequestSchema, type PersistResponse } from '@/types/onboarding';
import { generateRecipeDetails } from '@/lib/prompts/recipe-generation/process';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    // T007: Auth validation
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const token = decodeSupabaseToken(session.access_token);
    const db = createUserDb(token);

    // Parse and validate request body
    const body = await request.json();
    const parseResult = PersistRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.message },
        { status: 400 }
      );
    }

    const { dishes, ingredients: userIngredients, pantryItems } = parseResult.data;

    // T019: Deduplicate ingredient names
    const uniqueUserIngredients = [...new Set(userIngredients.map((i) => i.toLowerCase()))];
    const uniquePantryItems = [...new Set(pantryItems.map((i) => i.toLowerCase()))];

    // T008: Match user ingredients with case-insensitive WHERE LOWER(name) IN clause
    const matchedUserIngredients = await db(async (tx) => {
      if (uniqueUserIngredients.length === 0) return [];

      return await tx
        .select()
        .from(ingredients)
        .where(
          sql`LOWER(${ingredients.name}) IN (${sql.join(
            uniqueUserIngredients.map((n) => sql`${n}`),
            sql`, `
          )})`
        );
    });

    const matchedUserIngredientSet = new Set(
      matchedUserIngredients.map((i) => i.name.toLowerCase())
    );

    // T009: Log unrecognized user ingredients
    const unmatchedUserIngredients = uniqueUserIngredients.filter(
      (n) => !matchedUserIngredientSet.has(n)
    );

    if (unmatchedUserIngredients.length > 0) {
      console.log(
        `unrecognized ingredients, will be added to annotation queue: ${unmatchedUserIngredients.join(', ')}`
      );
    }

    // T010 + T017: Call LLM for recipe generation (with retry logic)
    let recipeDetails: Awaited<ReturnType<typeof generateRecipeDetails>> = [];

    // T018: Handle 0 dishes edge case
    if (dishes.length > 0) {
      try {
        recipeDetails = await generateRecipeDetails({ dishes });
      } catch (error) {
        console.error('[persist] LLM first attempt failed:', error);
        // T017: Retry once
        try {
          recipeDetails = await generateRecipeDetails({ dishes });
        } catch (retryError) {
          console.error('[persist] LLM retry failed:', retryError);
          // Create name-only recipes on second failure
          recipeDetails = dishes.map((d) => ({
            dishName: d,
            description: '',
            ingredients: [],
          }));
        }
      }
    }

    // Collect all LLM-returned ingredient names and dedupe
    const llmIngredientNames = [
      ...new Set(recipeDetails.flatMap((r) => r.ingredients.map((i) => i.toLowerCase()))),
    ];

    // Match LLM ingredients against DB
    const matchedLlmIngredients = await db(async (tx) => {
      if (llmIngredientNames.length === 0) return [];

      return await tx
        .select()
        .from(ingredients)
        .where(
          sql`LOWER(${ingredients.name}) IN (${sql.join(
            llmIngredientNames.map((n) => sql`${n}`),
            sql`, `
          )})`
        );
    });

    const matchedLlmIngredientMap = new Map(
      matchedLlmIngredients.map((i) => [i.name.toLowerCase(), i])
    );

    // T009: Log unrecognized LLM ingredients
    const unmatchedLlmIngredients = llmIngredientNames.filter(
      (n) => !matchedLlmIngredientMap.has(n)
    );

    if (unmatchedLlmIngredients.length > 0) {
      console.log(
        `unrecognized ingredients, will be added to annotation queue: ${unmatchedLlmIngredients.join(', ')}`
      );
    }

    // All unrecognized items combined
    const allUnrecognized = [...unmatchedUserIngredients, ...unmatchedLlmIngredients];

    // Execute all inserts in a transaction
    const result = await db(async (tx) => {
      let recipesCreated = 0;
      let inventoryCreated = 0;
      let pantryStaplesCreated = 0;

      // T009: Insert unrecognized items (context='ingredient')
      if (allUnrecognized.length > 0) {
        await tx
          .insert(unrecognizedItems)
          .values(
            allUnrecognized.map((rawText) => ({
              userId,
              rawText,
              context: 'ingredient',
            }))
          )
          .onConflictDoNothing();
      }

      // T011-T013: Insert recipes (user_recipes table)
      for (const recipe of recipeDetails) {
        // T011: Insert recipe with ON CONFLICT DO NOTHING
        const insertedRecipes = await tx
          .insert(userRecipes)
          .values({
            name: recipe.dishName,
            description: recipe.description || null,
            userId,
          })
          .onConflictDoNothing()
          .returning();

        if (insertedRecipes.length > 0) {
          const insertedRecipe = insertedRecipes[0];
          recipesCreated++;

          // T013: Insert recipe_ingredients for matched LLM ingredients
          const matchedRecipeIngredients = recipe.ingredients
            .map((name) => matchedLlmIngredientMap.get(name.toLowerCase()))
            .filter((i): i is NonNullable<typeof i> => i !== undefined);

          if (matchedRecipeIngredients.length > 0) {
            await tx
              .insert(recipeIngredients)
              .values(
                matchedRecipeIngredients.map((ing) => ({
                  recipeId: insertedRecipe.id,
                  ingredientId: ing.id,
                  ingredientType: 'anchor' as const,
                }))
              )
              .onConflictDoNothing();
          }
        }
      }

      // T014: Insert user_inventory for all matched user ingredients
      if (matchedUserIngredients.length > 0) {
        const inventoryInserts = await tx
          .insert(userInventory)
          .values(
            matchedUserIngredients.map((ing) => ({
              userId,
              ingredientId: ing.id,
              quantityLevel: 3,
            }))
          )
          .onConflictDoNothing()
          .returning();

        inventoryCreated = inventoryInserts.length;
      }

      // T015: Mark pantry staples in user_inventory (isPantryStaple flag)
      const pantryIngredientIds = matchedUserIngredients
        .filter((ing) => uniquePantryItems.includes(ing.name.toLowerCase()))
        .map((ing) => ing.id);

      if (pantryIngredientIds.length > 0) {
        // Update existing inventory items to mark as pantry staples
        for (const ingredientId of pantryIngredientIds) {
          await tx
            .insert(userInventory)
            .values({
              userId,
              ingredientId,
              quantityLevel: 3,
              isPantryStaple: true,
            })
            .onConflictDoUpdate({
              target: [userInventory.userId, userInventory.ingredientId],
              set: { isPantryStaple: true },
            });
        }
        pantryStaplesCreated = pantryIngredientIds.length;
      }

      return {
        recipesCreated,
        inventoryCreated,
        pantryStaplesCreated,
        unrecognizedCount: allUnrecognized.length,
      };
    });

    // T016: Return PersistResponse
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
