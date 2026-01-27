// POST /api/inventory/process-text
// Process text input to extract inventory updates
// Feature: 014-inventory-page-rework

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { processTextInventory } from "@/lib/prompts/inventory-update/process";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Invalid input", details: "Text is required" },
        { status: 400 }
      );
    }

    // Process with Gemini (Opik tracked)
    const extraction = await processTextInventory({ text });

    if (!extraction.updates || extraction.updates.length === 0) {
      return NextResponse.json(
        { error: "No ingredients detected", details: "Try being more specific about ingredients" },
        { status: 400 }
      );
    }

    return NextResponse.json(extraction);
  } catch (error) {
    console.error("Text processing error:", error);
    return NextResponse.json(
      {
        error: "Processing failed",
        details: error instanceof Error ? error.message : "LLM service unavailable",
      },
      { status: 500 }
    );
  }
}
