import { NextResponse } from "next/server";
import { withUser } from "@/lib/services/route-auth";
import { recipeUpdateTextRequestSchema } from "@/types/recipes";
import { processTextRecipeUpdate } from "@/lib/prompts/recipe-updater/process";

export const POST = withUser(async ({ request }) => {
  try {
    const body = await request.json();

    // Validate request
    const validationResult = recipeUpdateTextRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error },
        { status: 400 }
      );
    }

    const { currentRecipe, text } = validationResult.data;

    // Process with LLM
    const updatedRecipe = await processTextRecipeUpdate({
      currentRecipe,
      text,
    });

    return NextResponse.json(updatedRecipe);
  } catch (error) {
    console.error("Error processing text recipe update:", error);
    return NextResponse.json(
      { error: "Failed to process text input" },
      { status: 500 }
    );
  }
});
