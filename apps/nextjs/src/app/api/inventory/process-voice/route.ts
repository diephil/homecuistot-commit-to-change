// POST /api/inventory/process-voice
// Process voice recording to extract inventory updates
// Feature: 014-inventory-page-rework

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { processVoiceInventory } from "@/lib/prompts/inventory-update/process";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verify user authenticity
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { audioBase64 } = body;

    if (!audioBase64) {
      return NextResponse.json(
        { error: "Audio data required" },
        { status: 400 }
      );
    }

    // Process with Gemini (Opik tracked)
    const extraction = await processVoiceInventory({ audioBase64 });

    if (!extraction.updates || extraction.updates.length === 0) {
      return NextResponse.json(
        { error: "No ingredients detected", details: "Try speaking more clearly or use text input" },
        { status: 400 }
      );
    }

    return NextResponse.json(extraction);
  } catch (error) {
    console.error("Voice processing error:", error);
    // Log full error details for debugging
    if (error && typeof error === 'object') {
      console.error("Error details:", JSON.stringify(error, null, 2));
    }
    return NextResponse.json(
      {
        error: "Processing failed",
        details: error instanceof Error ? error.message : "LLM service unavailable",
      },
      { status: 500 }
    );
  }
}
