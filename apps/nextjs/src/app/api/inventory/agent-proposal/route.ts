/**
 * POST /api/inventory/agent-proposal
 *
 * Processes voice/text input via ADK InventoryAgent.
 * Returns InventoryUpdateProposal with validated ingredient updates.
 *
 * Accepts: { input: string } for text OR { audioBase64: string } for voice
 */

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/services/route-auth";
import { checkUsageLimit, logUsage } from "@/lib/services/usage-limit";
import { createInventoryManagerAgentProposal } from "@/lib/orchestration/inventory-update.orchestration";
import { getUserInventory } from "@/lib/services/user-inventory";
import type { InventorySessionItem } from "@/lib/agents/inventory-manager/tools/update-matching-ingredients";

export const POST = withAuth(async ({ userId, db, request }) => {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();

  try {
    const body = await request.json();
    const { input, audioBase64, mimeType } = body as {
      input?: string;
      audioBase64?: string;
      mimeType?: string;
    };

    // Validate input presence
    if (
      !audioBase64 &&
      (!input || typeof input !== "string" || input.trim().length === 0)
    ) {
      return NextResponse.json(
        { error: "Input text or audio is required" },
        { status: 400 },
      );
    }

    await checkUsageLimit({ userId, db })

    // Get user's current inventory
    const inventoryRows = await getUserInventory({ db });

    // Map to minimal session state
    const currentInventory: InventorySessionItem[] = inventoryRows.map(
      (row) => ({
        id: row.id,
        ingredientId: row.ingredientId!,
        quantityLevel: row.quantityLevel,
        isPantryStaple: row.isPantryStaple,
        name: row.ingredientName,
        category: row.ingredientCategory,
      }),
    );

    // Process via traced agent
    const result = await createInventoryManagerAgentProposal({
      userId,
      input,
      audioBase64,
      mimeType,
      currentInventory,
      model: "gemini-2.5-flash-lite",
    });

    await logUsage({ userId, db, endpoint: '/api/inventory/agent-proposal' })
    return NextResponse.json({
      proposal: result.proposal,
      transcribedText: result.transcribedText,
    });
  } catch (error) {
    console.error(`Agent proposal error [${requestId}]:`, error);
    return NextResponse.json(
      { error: "Could not process your request" },
      { status: 500 },
    );
  }
});
