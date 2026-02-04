import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createInventoryManagerAgentProposal } from "@/lib/orchestration/inventory-update.orchestration";
import type { InventorySessionItem } from "@/lib/agents/inventory-manager/tools/update-matching-ingredients";

/**
 * Unified process-input route for story onboarding Scene 4.
 * Accepts voice (audioBase64) OR text input. No DB writes.
 * Uses inventory-update orchestration with "onboarding-story" tag.
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

    // Convert currentIngredients (string[]) to minimal InventorySessionItem[]
    // For story onboarding, we use fake IDs since no DB records exist yet
    const currentInventory: InventorySessionItem[] = currentIngredients.map(
      (name: string, index: number) => ({
        id: `demo-${index}`,
        ingredientId: `demo-ing-${index}`,
        name,
        quantityLevel: 3, // Default for demo items
        isPantryStaple: false,
      }),
    );

    // Call inventory manager orchestration (handles tracing internally)
    const { proposal, transcribedText } =
      await createInventoryManagerAgentProposal({
        userId: user.id,
        input: text || undefined,
        audioBase64: audioBase64 || undefined,
        currentInventory,
        model: "gemini-2.5-flash-lite",
        provider: "onboarding-story", // Tag to differentiate traces
      });

    // Transform response to match Scene4Voice expectations
    // ValidatedInventoryUpdate[] → { name, quantityLevel }[]
    const add = proposal.recognized.map((item) => ({
      name: item.ingredientName,
      quantityLevel: item.proposedQuantity,
    }));

    // For removals, extract names only (orchestration doesn't return removals separately)
    // Items with proposedQuantity = 0 are removals
    const rm = proposal.recognized
      .filter((item) => item.proposedQuantity === 0)
      .map((item) => item.ingredientName);

    const response = {
      add,
      rm,
      transcribedText,
      unrecognized:
        proposal.unrecognized.length > 0 ? proposal.unrecognized : undefined,
    };

    return NextResponse.json(response);
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
