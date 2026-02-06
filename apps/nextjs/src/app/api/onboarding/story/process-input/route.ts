import { NextResponse } from "next/server";
import { withUser } from "@/lib/services/route-auth";
import { createInventoryManagerAgentProposal } from "@/lib/orchestration/inventory-update.orchestration";
import type { InventorySessionItem } from "@/lib/agents/inventory-manager/tools/update-matching-ingredients";
import { classifyLlmError } from "@/lib/services/api-error-handler";

/**
 * Unified process-input route for story onboarding Scene 4.
 * Accepts voice (audioBase64) OR text input. No DB writes.
 * Uses inventory-update orchestration with "onboarding-story" tag.
 */

export const maxDuration = 15;

export const POST = withUser(async ({ user, request }) => {
  try {
    const body = await request.json();
    const { audioBase64, mimeType, text, currentIngredients = [] } = body;

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
        mimeType: mimeType || undefined,
        currentInventory,
        model: "gemini-2.5-flash-lite",
        additionalTags: ["onboarding-story"],
      });

    // Transform response to match Scene4Voice expectations
    const add = proposal.recognized.map((item) => ({
      name: item.ingredientName,
      quantityLevel: item.proposedQuantity,
    }));

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
    return classifyLlmError(error);
  }
});
