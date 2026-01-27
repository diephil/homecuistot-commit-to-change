// PATCH /api/inventory/[id]/toggle-staple
// Toggle pantry staple status for an item
// Feature: 014-inventory-page-rework

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createUserDb, decodeSupabaseToken } from "@/db/client";
import { userInventory } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const token = decodeSupabaseToken(session.access_token);
    const db = createUserDb(token);

    // Toggle isPantryStaple
    const [result] = await db((tx) =>
      tx
        .update(userInventory)
        .set({
          isPantryStaple: sql`NOT ${userInventory.isPantryStaple}`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(userInventory.id, id),
            eq(userInventory.userId, session.user.id)
          )
        )
        .returning()
    );

    if (!result) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      item: {
        id: result.id,
        isPantryStaple: result.isPantryStaple,
      },
    });
  } catch (error) {
    console.error("Toggle staple error:", error);
    return NextResponse.json(
      { error: "Toggle failed", details: "Database error" },
      { status: 500 }
    );
  }
}
