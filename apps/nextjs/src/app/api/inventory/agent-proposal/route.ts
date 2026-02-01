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
import { InMemoryRunner, isFinalResponse } from "@google/adk";
import { createInventoryAgent } from "@/lib/agents/inventory";
import { getUserInventory } from "@/lib/services/user-inventory";
import { transcribeAudio } from "@/lib/services/audio-transcription";
import type { InventorySessionItem } from "@/lib/agents/inventory/tools/validate-ingredients";
import type { InventoryUpdateProposal } from "@/types/inventory";

export async function POST(request: Request) {
  // Request-unique identifier for session tracking
  const requestId =
    request.headers.get("x-request-id") ?? crypto.randomUUID();

  try {
    const body = await request.json();
    const { input, audioBase64 } = body as {
      input?: string;
      audioBase64?: string;
    };

    // Validate input presence (actual processing after auth)
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

    // Transcribe audio if provided, otherwise use text input
    let textInput: string;

    if (audioBase64) {
      textInput = await transcribeAudio({ audioBase64 });
      if (!textInput) {
        return NextResponse.json(
          { error: "Could not transcribe audio" },
          { status: 400 },
        );
      }
    } else {
      textInput = input!.trim();
    }

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

    // Create agent and runner
    const appName = "inventory_manager";
    const agent = createInventoryAgent({ userId: user.id });
    const runner = new InMemoryRunner({ agent, appName });

    // Create session with inventory state
    const agentSession = await runner.sessionService.createSession({
      userId: user.id,
      appName,
      state: { currentInventory },
    });

    // Run agent
    let proposal: InventoryUpdateProposal | null = null;

    for await (const event of runner.runAsync({
      userId: user.id,
      sessionId: agentSession.id,
      newMessage: {
        role: "user",
        parts: [{ text: textInput }],
      },
    })) {
      if (event.content?.parts) {
        for (const part of event.content.parts) {
          // Tool result contains proposal
          if ("functionResponse" in part && part.functionResponse) {
            const response = part.functionResponse.response;
            if (
              response &&
              typeof response === "object" &&
              "recognized" in response
            ) {
              proposal = response as unknown as InventoryUpdateProposal;
            }
          }
          // Fallback: parse JSON from text
          if ("text" in part && part.text && isFinalResponse(event)) {
            try {
              const parsed = JSON.parse(part.text);
              if (parsed.recognized !== undefined) {
                proposal = parsed as InventoryUpdateProposal;
              }
            } catch {
              // Not JSON
            }
          }
        }
      }
    }

    return NextResponse.json({
      proposal: proposal ?? { recognized: [], unrecognized: [] },
    });
  } catch (error) {
    console.error(`Agent proposal error [${requestId}]:`, error);
    return NextResponse.json(
      { error: "Could not process your request" },
      { status: 500 },
    );
  }
}
