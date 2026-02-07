import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/db/client";
import { ingredients } from "@/db/schema";
import { INGREDIENT_CATEGORIES } from "@/db/schema/enums";
import { markSpanAsReviewed } from "@/lib/services/opik-spans";
import { requireAdmin } from "@/lib/services/admin-auth";
import { z } from "zod";

const PromoteRequestSchema = z.object({
  spanId: z.string().uuid(),
  promotions: z
    .array(
      z.object({
        name: z.string().min(1),
        category: z.string().min(1),
      }),
    )
    .min(1),
});

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json(
      {
        error:
          "This is for demo purposes only. Real admins can promote new ingredients, but you got the idea :)",
        demo: true,
      },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const validated = PromoteRequestSchema.parse(body);

    // Validate categories against enum
    for (const promotion of validated.promotions) {
      if (
        !INGREDIENT_CATEGORIES.includes(
          promotion.category as (typeof INGREDIENT_CATEGORIES)[number],
        )
      ) {
        return NextResponse.json(
          { error: `Invalid category: ${promotion.category}` },
          { status: 400 },
        );
      }
    }

    // Batch insert, handle duplicates gracefully
    const valuesToInsert = validated.promotions.map((p) => ({
      name: p.name.trim().toLowerCase(),
      category: p.category as (typeof INGREDIENT_CATEGORIES)[number],
    }));

    const inserted = await adminDb
      .insert(ingredients)
      .values(valuesToInsert)
      .onConflictDoNothing()
      .returning({ name: ingredients.name });

    const promoted = inserted.length;
    const skipped = validated.promotions.length - promoted;

    // Mark span as reviewed (GET-then-PATCH)
    // Wrapped separately: if tagging fails, we still report insertion results
    let spanTagged = false;
    try {
      spanTagged = await markSpanAsReviewed({
        spanId: validated.spanId,
      });
    } catch (tagError) {
      console.error("Failed to tag span after promotion", {
        spanId: validated.spanId,
        error: tagError,
      });
    }

    return NextResponse.json({ promoted, skipped, spanTagged });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error promoting ingredients", error);
    return NextResponse.json(
      { error: "Failed to promote ingredients" },
      { status: 500 },
    );
  }
}
