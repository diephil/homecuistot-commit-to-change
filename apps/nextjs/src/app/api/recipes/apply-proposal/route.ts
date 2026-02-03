/**
 * POST /api/recipes/apply-proposal
 *
 * Applies confirmed recipe create/update proposal to the database.
 */

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createUserDb, decodeSupabaseToken } from "@/db/client";
import { userRecipes, recipeIngredients } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type {
  RecipeToolResult,
  RecipeApplyProposalResponse,
  CreateRecipeResult,
  UpdateRecipeResult,
  DeleteRecipeResult,
  DeleteAllRecipesResult,
} from "@/types/recipe-agent";
import type { IngredientType } from "@/db/schema/enums";
import { ensureIngredientsInInventory } from "@/db/services/ensure-ingredients-in-inventory";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipes } = body as { recipes?: RecipeToolResult[] };

    if (!recipes || !Array.isArray(recipes)) {
      return NextResponse.json({ error: "Invalid proposal" }, { status: 400 });
    }

    if (recipes.length === 0) {
      const response: RecipeApplyProposalResponse = {
        success: true,
        created: 0,
        updated: 0,
        deleted: 0,
      };
      return NextResponse.json(response);
    }

    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = decodeSupabaseToken(session.access_token);
    const db = createUserDb(token);

    let createdCount = 0;
    let updatedCount = 0;
    let deletedCount = 0;
    const errors: string[] = [];

    await db(async (tx) => {
      for (const recipe of recipes) {
        try {
          if (recipe.operation === "create") {
            await handleCreate(tx, user.id, recipe);
            createdCount++;
          } else if (recipe.operation === "update") {
            await handleUpdate(tx, user.id, recipe);
            updatedCount++;
          } else if (recipe.operation === "delete") {
            await handleDelete(tx, user.id, recipe);
            deletedCount++;
          } else if (recipe.operation === "delete_all") {
            const count = await handleDeleteAll(tx, user.id, recipe);
            deletedCount += count;
          }
        } catch (err) {
          errors.push(`Failed to ${recipe.operation} recipe: ${String(err)}`);
        }
      }
    });

    // Revalidate paths
    revalidatePath("/app");
    revalidatePath("/app/recipes");

    const response: RecipeApplyProposalResponse = {
      success: errors.length === 0,
      created: createdCount,
      updated: updatedCount,
      deleted: deletedCount,
      ...(errors.length > 0 && { errors }),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Apply recipe proposal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleCreate(tx: any, userId: string, recipe: CreateRecipeResult) {
  // Only insert ingredients that have a matched ingredientId
  const validIngredients = recipe.ingredients.filter((ing) => ing.ingredientId);

  const [newRecipe] = await tx
    .insert(userRecipes)
    .values({
      name: recipe.title,
      description: recipe.description,
      userId,
    })
    .returning();

  if (validIngredients.length > 0) {
    await tx.insert(recipeIngredients).values(
      validIngredients.map((ing) => ({
        recipeId: newRecipe.id,
        ingredientId: ing.ingredientId!,
        ingredientType: (ing.isRequired ? "anchor" : "optional") as IngredientType,
      }))
    );

    // Ensure all ingredients exist in user inventory
    const ingredientIds = validIngredients
      .map((ing) => ing.ingredientId)
      .filter((id): id is string => id !== null && id !== undefined);

    await ensureIngredientsInInventory({
      tx,
      userId,
      ingredientIds,
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleUpdate(tx: any, userId: string, recipe: UpdateRecipeResult) {
  const { recipeId, proposedState } = recipe;

  // Verify recipe belongs to user
  const [existing] = await tx
    .select({ id: userRecipes.id })
    .from(userRecipes)
    .where(and(eq(userRecipes.id, recipeId), eq(userRecipes.userId, userId)))
    .limit(1);

  if (!existing) {
    throw new Error(`Recipe ${recipeId} not found`);
  }

  // Update recipe metadata
  await tx
    .update(userRecipes)
    .set({
      name: proposedState.title,
      description: proposedState.description,
      updatedAt: new Date(),
    })
    .where(eq(userRecipes.id, recipeId));

  // Delete existing ingredients and insert new ones
  await tx.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, recipeId));

  // Only insert ingredients that have a matched ingredientId
  const validIngredients = proposedState.ingredients.filter((ing) => ing.ingredientId);

  if (validIngredients.length > 0) {
    await tx.insert(recipeIngredients).values(
      validIngredients.map((ing) => ({
        recipeId,
        ingredientId: ing.ingredientId!,
        ingredientType: (ing.isRequired ? "anchor" : "optional") as IngredientType,
      }))
    );

    // Ensure all ingredients exist in user inventory
    const ingredientIds = validIngredients
      .map((ing) => ing.ingredientId)
      .filter((id): id is string => id !== null && id !== undefined);

    await ensureIngredientsInInventory({
      tx,
      userId,
      ingredientIds,
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleDelete(tx: any, userId: string, recipe: DeleteRecipeResult) {
  const { recipeId } = recipe;

  // Verify recipe belongs to user
  const [existing] = await tx
    .select({ id: userRecipes.id })
    .from(userRecipes)
    .where(and(eq(userRecipes.id, recipeId), eq(userRecipes.userId, userId)))
    .limit(1);

  if (!existing) {
    throw new Error(`Recipe ${recipeId} not found`);
  }

  // Delete recipe ingredients first (foreign key constraint)
  await tx.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, recipeId));

  // Delete the recipe
  await tx.delete(userRecipes).where(eq(userRecipes.id, recipeId));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleDeleteAll(tx: any, userId: string, recipe: DeleteAllRecipesResult) {
  const { deletedRecipes } = recipe;
  let count = 0;

  for (const { recipeId } of deletedRecipes) {
    try {
      // Verify recipe belongs to user
      const [existing] = await tx
        .select({ id: userRecipes.id })
        .from(userRecipes)
        .where(and(eq(userRecipes.id, recipeId), eq(userRecipes.userId, userId)))
        .limit(1);

      if (existing) {
        // Delete recipe ingredients first (foreign key constraint)
        await tx.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, recipeId));

        // Delete the recipe
        await tx.delete(userRecipes).where(eq(userRecipes.id, recipeId));
        count++;
      }
    } catch (err) {
      console.error(`Failed to delete recipe ${recipeId}:`, err);
    }
  }

  return count;
}
