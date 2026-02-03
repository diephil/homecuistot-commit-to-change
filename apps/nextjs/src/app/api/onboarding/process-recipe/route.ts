import { NextResponse } from "next/server";
import { z } from "zod";

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
  })
  .refine((data) => data.audioBase64 || data.text, {
    message: "Either audioBase64 or text must be provided",
  });

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const validationResult = requestBodySchema.safeParse(rawBody);

    if (!validationResult.success) {
      console.error("[onboarding/recipe] Validation error:", validationResult.error);
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { audioBase64, text, trackedRecipes } = validationResult.data;

    // Determine input type
    const inputType = audioBase64 ? "voice" : "text";

    console.log(`[onboarding/recipe] Received ${inputType} input`);
    if (audioBase64) {
      console.log(`[onboarding/recipe] Audio size: ${audioBase64.length} chars`);
    } else if (text) {
      console.log(`[onboarding/recipe] Text: "${text}"`);
    }
    console.log(`[onboarding/recipe] Tracked recipes count: ${trackedRecipes.length}`);

    // TODO: Process with recipe-update orchestration
    // For now, return a placeholder response
    return NextResponse.json({
      success: true,
      message: "Recipe input received (processing not implemented yet)",
      inputType,
    });
  } catch (error) {
    console.error("[onboarding/recipe] Error:", error);
    return NextResponse.json(
      { error: "Failed to process recipe input" },
      { status: 500 }
    );
  }
}
