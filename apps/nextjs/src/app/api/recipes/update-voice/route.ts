import { NextResponse } from "next/server";
import { withUser } from "@/lib/services/route-auth";
import { recipeUpdateVoiceRequestSchema } from "@/types/recipes";
import { processVoiceRecipeUpdate } from "@/lib/prompts/recipe-updater/process";

export const POST = withUser(async ({ request }) => {
  try {
    const body = await request.json();

    // Validate request
    const validationResult = recipeUpdateVoiceRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error },
        { status: 400 }
      );
    }

    const { currentRecipe, audioBase64 } = validationResult.data;

    // Process with LLM
    const updatedRecipe = await processVoiceRecipeUpdate({
      currentRecipe,
      audioBase64,
    });

    return NextResponse.json(updatedRecipe);
  } catch (error) {
    console.error("Error processing voice recipe update:", error);
    return NextResponse.json(
      { error: "Failed to process voice input" },
      { status: 500 }
    );
  }
});
