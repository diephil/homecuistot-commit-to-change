/**
 * POST /api/inventory/agent-proposal
 *
 * Processes voice/text input via ADK InventoryAgent.
 * Returns InventoryUpdateProposal with validated ingredient updates.
 *
 * Accepts: { input: string } for text OR { audioBase64: string } for voice
 */

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createUserDb, decodeSupabaseToken } from "@/db/client";
import { createInventoryManagerAgentProposal } from "@/lib/orchestration/inventory-update.orchestration";
import { getUserInventory } from "@/lib/services/user-inventory";
import type { InventorySessionItem } from "@/lib/agents/inventory-manager/tools/validate-ingredients";

export async function POST(request: Request) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();

  try {
    const body = await request.json();
    const { input, audioBase64 } = body as {
      input?: string;
      audioBase64?: string;
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

    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's current inventory
    const token = decodeSupabaseToken(session.access_token);
    const db = createUserDb(token);
    const inventoryRows = await getUserInventory({ db });

    // Map to minimal session state
    const currentInventory: InventorySessionItem[] = inventoryRows.map(
      (row) => ({
        id: row.id,
        ingredientId: row.ingredientId!,
        quantityLevel: row.quantityLevel,
        isPantryStaple: row.isPantryStaple,
        name: row.ingredientName,
      }),
    );

    // Process via traced agent
    const result = await createInventoryManagerAgentProposal({
      userId: user.id,
      input,
      audioBase64,
      currentInventory,
    });

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
}
