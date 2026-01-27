// POST /api/inventory/validate
// Validate ingredient names against database
// Feature: 014-inventory-page-rework

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createUserDb, decodeSupabaseToken } from "@/db/client";
import { ingredients } from "@/db/schema";
import { ilike } from "drizzle-orm";

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

    // Get session for JWT token
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ingredientNames } = body;

    if (!Array.isArray(ingredientNames) || ingredientNames.length === 0) {
      return NextResponse.json(
        { error: "Invalid input", details: "ingredientNames array required" },
        { status: 400 }
      );
    }

    const token = decodeSupabaseToken(session.access_token);
    const db = createUserDb(token);

    const recognized: Array<{
      inputName: string;
      matchedName: string;
      ingredientId: string;
    }> = [];
    const unrecognized: string[] = [];

    // Validate each ingredient name
    for (const name of ingredientNames) {
      const [match] = await db((tx) =>
        tx
          .select({ id: ingredients.id, name: ingredients.name })
          .from(ingredients)
          .where(ilike(ingredients.name, name))
          .limit(1)
      );

      if (match) {
        recognized.push({
          inputName: name,
          matchedName: match.name,
          ingredientId: match.id,
        });
      } else {
        unrecognized.push(name);
      }
    }

    return NextResponse.json({ recognized, unrecognized });
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { error: "Validation failed", details: "Database error" },
      { status: 500 }
    );
  }
}
