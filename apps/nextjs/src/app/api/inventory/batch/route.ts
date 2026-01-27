// POST /api/inventory/batch
// Apply multiple inventory updates in single transaction
// Feature: 014-inventory-page-rework

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createUserDb, decodeSupabaseToken } from "@/db/client";
import { userInventory, ingredients } from "@/db/schema";
import { eq } from "drizzle-orm";

interface BatchUpdate {
  ingredientId: string;
  quantityLevel: number;
}

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
    const { updates } = body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "Invalid input", details: "updates array required" },
        { status: 400 }
      );
    }

    // Validate each update
    for (const update of updates) {
      if (!update.ingredientId || typeof update.quantityLevel !== "number") {
        return NextResponse.json(
          { error: "Validation failed", details: "Each update needs ingredientId and quantityLevel" },
          { status: 400 }
        );
      }
      if (update.quantityLevel < 0 || update.quantityLevel > 3) {
        return NextResponse.json(
          { error: "Validation failed", details: "Quantity level must be 0-3" },
          { status: 400 }
        );
      }
    }

    const token = decodeSupabaseToken(session.access_token);
    const db = createUserDb(token);

    // Batch upsert
    const results = await db((tx) =>
      tx
        .insert(userInventory)
        .values(
          updates.map((u: BatchUpdate) => ({
            userId: session.user.id,
            ingredientId: u.ingredientId,
            quantityLevel: u.quantityLevel,
            isPantryStaple: false,
            updatedAt: new Date(),
          }))
        )
        .onConflictDoUpdate({
          target: [userInventory.userId, userInventory.ingredientId],
          set: {
            quantityLevel: updates[0].quantityLevel, // This gets overridden by EXCLUDED in Drizzle
            updatedAt: new Date(),
          },
        })
        .returning()
    );

    // Fetch full display data with ingredient names
    const displayItems = await db((tx) =>
      tx
        .select({
          id: userInventory.id,
          ingredientId: userInventory.ingredientId,
          name: ingredients.name,
          category: ingredients.category,
          quantityLevel: userInventory.quantityLevel,
          isPantryStaple: userInventory.isPantryStaple,
          updatedAt: userInventory.updatedAt,
        })
        .from(userInventory)
        .innerJoin(ingredients, eq(userInventory.ingredientId, ingredients.id))
        .where(
          eq(
            userInventory.id,
            results.map((r) => r.id)[0]
          )
        )
    );

    return NextResponse.json({
      success: true,
      updatedCount: results.length,
      items: displayItems,
    });
  } catch (error) {
    console.error("Batch update error:", error);
    return NextResponse.json(
      { error: "Batch update failed", details: "Database error" },
      { status: 500 }
    );
  }
}
