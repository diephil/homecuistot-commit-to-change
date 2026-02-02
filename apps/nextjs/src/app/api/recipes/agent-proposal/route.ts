/**
 * POST /api/recipes/agent-proposal
 *
 * Processes voice/text input via ADK RecipeAgent.
 * Returns RecipeManagerProposal with create/update operations.
 *
 * Accepts: { input: string } for text OR { audioBase64: string } for voice
 */

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createUserDb, decodeSupabaseToken } from "@/db/client";
import { createRecipeManagerAgentProposal } from "@/lib/orchestration/recipe-update.orchestration";
import { userRecipes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { RecipeSessionItem } from "@/types/recipe-agent";

export const maxDuration = 30; // 30 second timeout for voice processing

export async function POST(request: Request) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();

  try {
    const body = await request.json();
    const { input, audioBase64 } = body as {
      input?: string;
      audioBase64?: string;
    };

    // Validate input presence
    if (
      !audioBase64 &&
      (!input || typeof input !== "string" || input.trim().length === 0)
    ) {
      return NextResponse.json(
        { error: "Input text or audio is required" },
        { status: 400 },
      );
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

    // Get user's current recipes
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
      }),
    );

    // Map to minimal session state
    const trackedRecipes: RecipeSessionItem[] = recipes.map((recipe) => ({
      id: recipe.id,
      title: recipe.name,
      description: recipe.description ?? "",
      ingredients: recipe.recipeIngredients
        .filter((ri) => ri.ingredient) // Only include ingredients with valid refs
        .map((ri) => ({
          name: ri.ingredient!.name,
          isRequired: ri.ingredientType === "anchor",
        })),
    }));

    // Process via traced agent
    const result = await createRecipeManagerAgentProposal({
      userId: user.id,
      input,
      audioBase64,
      trackedRecipes,
      model: "gemini-2.5-flash-lite",
    });

    return NextResponse.json({
      proposal: result.proposal,
      transcribedText: result.transcribedText,
      assistantResponse: result.assistantResponse,
      usage: result.usage,
    });
  } catch (error) {
    console.error(`Recipe agent proposal error [${requestId}]:`, error);
    return NextResponse.json(
      { error: "Could not process your request" },
      { status: 500 },
    );
  }
}
