// DELETE /api/inventory/[id]
// Permanently remove item from inventory
// Feature: 014-inventory-page-rework

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createUserDb, decodeSupabaseToken } from "@/db/client";
import { userInventory } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
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

    const [result] = await db((tx) =>
      tx
        .delete(userInventory)
        .where(
          and(
            eq(userInventory.id, id),
            eq(userInventory.userId, session.user.id)
          )
        )
        .returning({ id: userInventory.id })
    );

    if (!result) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      deletedId: result.id,
    });
  } catch (error) {
    console.error("Delete inventory item error:", error);
    return NextResponse.json(
      { error: "Delete failed", details: "Database error" },
      { status: 500 }
    );
  }
}
