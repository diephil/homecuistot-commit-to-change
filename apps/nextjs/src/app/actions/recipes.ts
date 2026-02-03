"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createUserDb, decodeSupabaseToken } from "@/db/client";
import { userRecipes, recipeIngredients, ingredients } from "@/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import type { IngredientType } from "@/db/schema/enums";
import { ensureIngredientsInInventory } from "@/db/services/ensure-ingredients-in-inventory";

// Get all recipes for current user
export async function getRecipes(params?: { limit?: number }) {
  const supabase = await createClient();

  // Verify user authenticity
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get session for JWT token
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
      orderBy: [asc(userRecipes.name)],
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

  // Verify user authenticity
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get session for JWT token
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

      // Ensure all ingredients exist in user inventory
      const ingredientIds = params.ingredients
        .map((ing) => ing.ingredientId)
        .filter((id): id is string => id !== null && id !== undefined);

      await ensureIngredientsInInventory({
        tx,
        userId: session.user.id,
        ingredientIds,
      });
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

  // Verify user authenticity
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get session for JWT token
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

      // Ensure all ingredients exist in user inventory
      const ingredientIds = params.ingredients
        .map((ing) => ing.ingredientId)
        .filter((id): id is string => id !== null && id !== undefined);

      await ensureIngredientsInInventory({
        tx,
        userId: session.user.id,
        ingredientIds,
      });
    }
  });

  revalidatePath("/app");
  revalidatePath("/app/recipes");
}

// Toggle ingredient type between anchor and optional
export async function toggleIngredientType(params: {
  recipeIngredientId: string;
  recipeId: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const token = decodeSupabaseToken(session.access_token);
  const db = createUserDb(token);

  // Verify recipe belongs to user and get current ingredient type
  const [existing] = await db((tx) =>
    tx
      .select({
        ingredientType: recipeIngredients.ingredientType,
        userId: userRecipes.userId,
      })
      .from(recipeIngredients)
      .innerJoin(userRecipes, eq(recipeIngredients.recipeId, userRecipes.id))
      .where(
        and(
          eq(recipeIngredients.id, params.recipeIngredientId),
          eq(recipeIngredients.recipeId, params.recipeId),
          eq(userRecipes.userId, session.user.id)
        )
      )
      .limit(1)
  );

  if (!existing) {
    throw new Error("Ingredient not found");
  }

  const newType: IngredientType =
    existing.ingredientType === "anchor" ? "optional" : "anchor";

  await db((tx) =>
    tx
      .update(recipeIngredients)
      .set({ ingredientType: newType })
      .where(eq(recipeIngredients.id, params.recipeIngredientId))
  );

  revalidatePath("/app");
  revalidatePath("/app/recipes");

  return { newType };
}

// Delete recipe
export async function deleteRecipe(params: { recipeId: string }) {
  const supabase = await createClient();

  // Verify user authenticity
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get session for JWT token
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

  // Verify user authenticity
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get session for JWT token
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
