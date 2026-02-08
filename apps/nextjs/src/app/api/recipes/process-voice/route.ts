import { NextResponse } from "next/server";
import { withAuth } from "@/lib/services/route-auth";
import { checkUsageLimit, logUsage } from "@/lib/services/usage-limit";
import { processVoiceRecipe } from "@/lib/prompts/recipe-editor/process";
import { recipeExtractionSchema } from "@/types/recipes";

export const maxDuration = 15; // 15 second timeout

export const POST = withAuth(async ({ userId, db, request }) => {
  try {
    const body = await request.json();

    if (!body.audioBase64) {
      return NextResponse.json(
        { error: "audioBase64 is required" },
        { status: 400 }
      );
    }

    await checkUsageLimit({ userId, db })

    // Process via Gemini with Opik tracing
    const result = await processVoiceRecipe({
      audioBase64: body.audioBase64,
    });

    // Validate response schema
    const validated = recipeExtractionSchema.parse(result);

    await logUsage({ userId, db, endpoint: '/api/recipes/process-voice' })
    return NextResponse.json(validated);
  } catch (error) {
    console.error("[process-voice] Error:", error);
    return NextResponse.json(
      { error: "Failed to process voice input" },
      { status: 500 }
    );
  }
});
