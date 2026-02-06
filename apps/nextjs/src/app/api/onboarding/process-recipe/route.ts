import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { withUser } from "@/lib/services/route-auth";
import { createRecipeManagerAgentProposal } from "@/lib/orchestration/recipe-update.orchestration";
import {
  isCreateRecipeResult,
  isUpdateRecipeResult,
  isDeleteRecipeResult,
  isDeleteAllRecipesResult,
  isCreateRecipesResult,
  isUpdateRecipesResult,
  isDeleteRecipesResult,
  type RecipeSessionItem,
  type RecipeManagerProposal,
  type RecipeToolResult,
} from "@/types/recipe-agent";

export const maxDuration = 30;

const recipeIngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["anchor", "optional"]),
});

const trackedRecipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  ingredients: z.array(recipeIngredientSchema),
});

const requestBodySchema = z
  .object({
    audioBase64: z.string().optional(),
    text: z.string().optional(),
    trackedRecipes: z.array(trackedRecipeSchema).default([]),
    additionalTags: z.array(z.string()).optional(),
  })
  .refine((data) => data.audioBase64 || data.text, {
    message: "Either audioBase64 or text must be provided",
  });

// Helper: Expand batch operations into individual operations
function expandBatchOperation(result: RecipeToolResult): RecipeToolResult[] {
  if (isCreateRecipesResult(result)) {
    return result.results.map(({ index, ...item }) => item);
  }
  if (isUpdateRecipesResult(result)) {
    return result.results.map(({ index, ...item }) => item);
  }
  if (isDeleteRecipesResult(result)) {
    return result.results.map((item) => ({
      operation: "delete" as const,
      recipeId: item.recipeId,
      title: item.title,
      reason: result.reason,
    }));
  }
  return [result];
}

// Helper: Apply proposal operations in-memory (no DB persistence)
function applyProposalInMemory(
  trackedRecipes: RecipeSessionItem[],
  proposal: RecipeManagerProposal,
): RecipeSessionItem[] {
  let recipes = [...trackedRecipes];

  for (const result of proposal.recipes) {
    const operations = expandBatchOperation(result);

    for (const op of operations) {
      if (isCreateRecipeResult(op)) {
        // CREATE: Add new recipe with temp ID
        recipes.push({
          id: randomUUID(),
          title: op.title,
          description: op.description,
          ingredients: op.ingredients.map((ing) => ({
            name: ing.name,
            isRequired: ing.isRequired,
          })),
        });
      } else if (isUpdateRecipeResult(op)) {
        // UPDATE: Find and replace recipe
        const index = recipes.findIndex((r) => r.id === op.recipeId);
        if (index !== -1) {
          recipes[index] = {
            id: op.recipeId,
            title: op.proposedState.title,
            description: op.proposedState.description,
            ingredients: op.proposedState.ingredients.map((ing) => ({
              name: ing.name,
              isRequired: ing.isRequired,
            })),
          };
        }
      } else if (isDeleteRecipeResult(op)) {
        // DELETE: Remove by ID
        recipes = recipes.filter((r) => r.id !== op.recipeId);
      } else if (isDeleteAllRecipesResult(op)) {
        // DELETE_ALL: Remove all specified recipes
        const deleteIds = new Set(op.deletedRecipes.map((d) => d.recipeId));
        recipes = recipes.filter((r) => !deleteIds.has(r.id));
      }
    }
  }

  return recipes;
}

export const POST = withUser(async ({ user, request }) => {
  try {
    // 1. Validate request body
    const rawBody = await request.json();
    const validationResult = requestBodySchema.safeParse(rawBody);

    if (!validationResult.success) {
      console.error(
        "[onboarding/recipe] Validation error:",
        validationResult.error,
      );
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const { audioBase64, text, trackedRecipes, additionalTags } =
      validationResult.data;

    // 2. Transform Zod types to orchestration types
    const sessionRecipes: RecipeSessionItem[] = trackedRecipes.map(
      (recipe) => ({
        id: recipe.id,
        title: recipe.name, // Zod uses 'name', orchestration uses 'title'
        description: recipe.description || "",
        ingredients: recipe.ingredients.map((ing) => ({
          name: ing.name,
          isRequired: ing.type === "anchor",
        })),
      }),
    );

    const inputType = audioBase64 ? "voice" : "text";
    console.log(
      `[onboarding/recipe] Processing ${inputType} input for user ${user.id}`,
    );
    console.log(
      `[onboarding/recipe] Tracked recipes: ${sessionRecipes.length}`,
    );

    // 3. Call orchestration
    const result = await createRecipeManagerAgentProposal({
      userId: user.id,
      input: text,
      audioBase64,
      trackedRecipes: sessionRecipes,
      model: "gemini-2.5-flash-lite",
      isOnBoarding: true,
      additionalTags,
    });

    console.log("Agent result", JSON.stringify(result, null, 2));

    // 4. Apply proposal in-memory
    const updatedRecipes = applyProposalInMemory(
      sessionRecipes,
      result.proposal,
    );

    // 5. Transform back to frontend format
    const frontendRecipes = updatedRecipes.map((recipe) => ({
      id: recipe.id,
      name: recipe.title, // Map title → name for frontend
      description: recipe.description,
      ingredients: recipe.ingredients.map((ing) => ({
        id: randomUUID(),
        name: ing.name,
        type: ing.isRequired ? ("anchor" as const) : ("optional" as const),
      })),
    }));

    console.log(
      `[onboarding/recipe] Updated recipes: ${updatedRecipes.length} (${result.proposal.recipes.length} operations)`,
    );

    // 6. Return response
    return NextResponse.json({
      recipes: frontendRecipes,
      transcribedText: result.transcribedText,
      assistantResponse: result.assistantResponse,
      noChangesDetected: result.proposal.noChangesDetected,
    });
  } catch (error) {
    console.error("[onboarding/recipe] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process recipe input",
      },
      { status: 500 },
    );
  }
});
