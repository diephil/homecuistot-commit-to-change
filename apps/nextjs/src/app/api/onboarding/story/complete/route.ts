import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { withAuth } from "@/lib/services/route-auth";
import { StoryCompleteRequestSchema } from "@/lib/story-onboarding/types";
import { CARBONARA_RECIPE } from "@/lib/story-onboarding/constants";
import { isNewUser } from "@/lib/services/brand-new-user";
import { prefillDemoData } from "@/lib/services/demo-data-prefill";

/**
 * Story Onboarding Complete Route
 *
 * Detects brand-new vs returning user.
 * Pre-fills demo data (inventory + recipes) for brand-new users.
 * All operations in a single transaction.
 */

export const maxDuration = 30;

export const POST = withAuth(async ({ userId, db, request }) => {
  try {
    // Parse request body
    const body = await request.json();
    const parseResult = StoryCompleteRequestSchema.safeParse(body);

    if (!parseResult.success) {
      console.error("[story/complete] Validation error:", parseResult.error);
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.message },
        { status: 400 },
      );
    }

    const { ingredients, pantryStaples, recipes } = parseResult.data;

    // Always include Sarah's carbonara as the default recipe + user recipes from scene 7
    const allRecipes = [
      {
        name: CARBONARA_RECIPE.name,
        description: CARBONARA_RECIPE.description,
        ingredients: CARBONARA_RECIPE.ingredients,
      },
      ...recipes,
    ];

    // Execute in single transaction
    const result = await db(async (tx) => {
      const brandNew = await isNewUser({ tx, userId });

      if (!brandNew) {
        return {
          isNewUser: false as const,
          inventoryCreated: 0,
          recipesCreated: 0,
          unrecognizedIngredients: 0,
          unrecognizedRecipeIngredients: 0,
        };
      }

      const prefillResult = await prefillDemoData({
        tx,
        userId,
        ingredients,
        pantryStaples,
        recipes: allRecipes,
      });

      return { isNewUser: true as const, ...prefillResult };
    });

    // Revalidate cached pages
    revalidatePath("/app/onboarding");
    revalidatePath("/app");

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[story/complete] Error:", error);
    return NextResponse.json(
      { error: "Failed to complete story onboarding" },
      { status: 500 },
    );
  }
});
