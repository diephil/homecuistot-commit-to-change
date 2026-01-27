"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createUserDb, decodeSupabaseToken } from "@/db/client";
import { userRecipes, recipeIngredients, ingredients } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import type { IngredientType } from "@/db/schema/enums";

// Get all recipes for current user
export async function getRecipes(params?: { limit?: number }) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const token = decodeSupabaseToken(session.access_token);
  const db = createUserDb(token);

  const recipes = await db((tx) =>
    tx.query.userRecipes.findMany({
      where: eq(userRecipes.userId, session.user.id),
      with: {
        recipeIngredients: {
          with: { ingredient: true },
        },
      },
      orderBy: [desc(userRecipes.createdAt)],
      limit: params?.limit,
    }),
  );

  return recipes;
}

// Create new recipe with ingredients
export async function createRecipe(params: {
  title: string;
  description: string;
  ingredients: Array<{
    ingredientId: string;
    ingredientType: IngredientType;
  }>;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const token = decodeSupabaseToken(session.access_token);
  const db = createUserDb(token);

  await db(async (tx) => {
    const [recipe] = await tx
      .insert(userRecipes)
      .values({
        name: params.title,
        description: params.description,
        userId: session.user.id,
      })
      .returning();

    if (params.ingredients.length > 0) {
      await tx.insert(recipeIngredients).values(
        params.ingredients.map((ing) => ({
          recipeId: recipe.id,
          ingredientId: ing.ingredientId,
          ingredientType: ing.ingredientType,
        })),
      );
    }

    return recipe;
  });

  revalidatePath("/app");
  revalidatePath("/app/recipes");
}

// Update existing recipe
export async function updateRecipe(params: {
  recipeId: string;
  title: string;
  description: string;
  ingredients: Array<{
    ingredientId: string;
    ingredientType: IngredientType;
  }>;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const token = decodeSupabaseToken(session.access_token);
  const db = createUserDb(token);

  await db(async (tx) => {
    await tx
      .update(userRecipes)
      .set({
        name: params.title,
        description: params.description,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userRecipes.id, params.recipeId),
          eq(userRecipes.userId, session.user.id),
        ),
      );

    // Delete existing ingredients and insert new ones
    await tx
      .delete(recipeIngredients)
      .where(eq(recipeIngredients.recipeId, params.recipeId));

    if (params.ingredients.length > 0) {
      await tx.insert(recipeIngredients).values(
        params.ingredients.map((ing) => ({
          recipeId: params.recipeId,
          ingredientId: ing.ingredientId,
          ingredientType: ing.ingredientType,
        })),
      );
    }
  });

  revalidatePath("/app");
  revalidatePath("/app/recipes");
}

// Delete recipe
export async function deleteRecipe(params: { recipeId: string }) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const token = decodeSupabaseToken(session.access_token);
  const db = createUserDb(token);

  await db((tx) =>
    tx
      .delete(userRecipes)
      .where(
        and(
          eq(userRecipes.id, params.recipeId),
          eq(userRecipes.userId, session.user.id),
        ),
      ),
  );

  revalidatePath("/app");
  revalidatePath("/app/recipes");
}

// Validate ingredient names against database
export async function validateIngredients(params: {
  ingredientNames: string[];
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const token = decodeSupabaseToken(session.access_token);
  const db = createUserDb(token);

  const lowerNames = params.ingredientNames.map((n) => n.toLowerCase());

  const matched = await db((tx) =>
    tx
      .select({ id: ingredients.id, name: ingredients.name })
      .from(ingredients)
      .where(
        sql`LOWER(${ingredients.name}) IN (${sql.join(
          lowerNames.map((n) => sql`${n}`),
          sql`, `,
        )})`,
      ),
  );

  const matchedNames = matched.map((m) => m.name.toLowerCase());
  const unrecognized = lowerNames.filter((n) => !matchedNames.includes(n));

  return {
    matched,
    unrecognized,
  };
}
