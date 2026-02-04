import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ingredientExtractorAgent } from "@/lib/agents/ingredient-extractor/agent";
import { validateIngredientNames } from "@/lib/services/ingredient-matcher";
import { createAgentTrace } from "@/lib/tracing/opik-agent";
import { IngredientExtractionSchema } from "@/types/onboarding";

/**
 * Unified process-input route for story onboarding Scene 4.
 * Accepts voice (audioBase64) OR text input. No DB writes.
 */

export const maxDuration = 15;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { audioBase64, text, currentIngredients = [] } = body;

    if (!audioBase64 && !text) {
      return NextResponse.json(
        { error: "Either audioBase64 or text is required" },
        { status: 400 },
      );
    }

    // Create Opik trace
    const traceCtx = createAgentTrace({
      name: "story-onboarding-process-input",
      input: {
        hasAudio: !!audioBase64,
        hasText: !!text,
        currentIngredients,
      },
      tags: [
        `user:${user.id}`,
        "story-onboarding",
        audioBase64 ? "voice-input" : "text-input",
      ],
    });

    try {
      // Call ingredient extractor agent (handles both voice and text natively)
      const result = await ingredientExtractorAgent({
        text: text || undefined,
        audioBase64: audioBase64 || undefined,
        currentIngredients,
        parentTrace: traceCtx.trace,
        userId: user.id,
      });

      // Validate extracted names against ingredients DB
      const addValidation = await validateIngredientNames({
        names: result.add,
      });
      const rmValidation = await validateIngredientNames({
        names: result.rm,
      });

      const allUnrecognized = [
        ...addValidation.unrecognized,
        ...rmValidation.unrecognized,
      ];

      const validated = IngredientExtractionSchema.parse({
        add: addValidation.recognized,
        rm: rmValidation.recognized,
        transcribedText: result.transcribedText,
        unrecognized:
          allUnrecognized.length > 0 ? allUnrecognized : undefined,
      });

      traceCtx.trace.update({
        output: validated as unknown as Record<string, unknown>,
      });
      traceCtx.end();
      await traceCtx.flush();

      return NextResponse.json(validated);
    } catch (innerError) {
      traceCtx.end();
      await traceCtx.flush();
      throw innerError;
    }
  } catch (error) {
    console.error("[story/process-input] Error:", error);

    if (error instanceof Error) {
      if (
        error.message.includes("timeout") ||
        error.message.includes("ETIMEDOUT") ||
        error.message.includes("ECONNABORTED")
      ) {
        return NextResponse.json(
          { error: "Request timeout. Please try again." },
          { status: 408 },
        );
      }

      if (error.name === "ZodError") {
        return NextResponse.json(
          { error: "Processing failed. Please try again." },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      { error: "Processing failed. Please try again." },
      { status: 500 },
    );
  }
}
