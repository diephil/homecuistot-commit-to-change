import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { withAuth } from "@/lib/services/route-auth";
import { userRecipes, recipeIngredients } from "@/db/schema";
import {
  CompleteRequestSchema,
  type CompleteResponse,
} from "@/types/onboarding";
import { persistUserIngredients } from "@/lib/services/ingredient-persistence";

/**
 * Onboarding Complete Route
 *
 * Persists ingredients, pantry staples, and recipes from onboarding flow.
 * All operations occur in a single transaction for atomicity.
 */

export const maxDuration = 30;

export const POST = withAuth(async ({ userId, db, request }) => {
  try {
    // Parse request
    const body = await request.json();
    const parseResult = CompleteRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.message },
        { status: 400 },
      );
    }

    const {
      ingredients: userIngredientNames,
      pantryStaples: userPantryStaples = [],
      recipes,
    } = parseResult.data;

    // Execute all operations in a transaction
    const result = await db(async (tx) => {
      // Collect all ingredient names including recipe ingredients
      const recipeIngredientNames = recipes.flatMap((r) =>
        r.ingredients.map((i) => i.name.toLowerCase()),
      );

      const allIngredientNames = [
        ...new Set([
          ...userIngredientNames.map((n) => n.toLowerCase()),
          ...userPantryStaples.map((n) => n.toLowerCase()),
          ...recipeIngredientNames,
        ]),
      ];

      const {
        inventoryCreated,
        unrecognizedCount: unrecognizedIngredients,
        ingredientMap,
        unrecognizedMap,
      } = await persistUserIngredients({
        userId,
        ingredientNames: userIngredientNames,
        pantryStapleNames: userPantryStaples,
        allNames: allIngredientNames,
        tx,
      });

      // Insert recipes and recipe ingredients
      let recipesCreated = 0;
      let unrecognizedRecipeIngredients = 0;

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
        }
      }

      return {
        inventoryCreated,
        recipesCreated,
        unrecognizedIngredients,
        unrecognizedRecipeIngredients,
      };
    });

    // Invalidate onboarding page cache to prevent back button from showing onboarding again
    revalidatePath("/app/onboarding");

    // Return response with stats
    const response: CompleteResponse = {
      success: true,
      ...result,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[onboarding/complete] Error:", error);

    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 },
    );
  }
});
