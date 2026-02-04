import { NextResponse } from "next/server";
import { adminDb } from "@/db/client";
import { ingredients } from "@/db/schema";
import {
  getNextUnprocessedSpan,
  markSpanAsReviewed,
} from "@/lib/services/opik-spans";
import { requireAdmin } from "@/lib/services/admin-auth";
import { sql } from "drizzle-orm";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const span = await getNextUnprocessedSpan();

    if (!span) {
      return NextResponse.json({
        spanId: null,
        traceId: null,
        items: [],
        totalInSpan: 0,
      });
    }

    // Extract unrecognized items from metadata
    const rawItems = span.metadata?.unrecognized ?? [];

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      console.warn("Span has malformed or empty metadata.unrecognized", {
        spanId: span.id,
      });
      // Auto-mark as reviewed since nothing to process
      await markSpanAsReviewed({ spanId: span.id });
      return NextResponse.json({
        spanId: null,
        traceId: null,
        items: [],
        totalInSpan: 0,
      });
    }

    // Deduplicate items (case-insensitive)
    const deduplicatedItems = Array.from(
      new Set(rawItems.map((item) => item.toLowerCase())),
    );

    // Filter out items already in database
    const existingNames = await adminDb
      .select({ name: ingredients.name })
      .from(ingredients)
      .where(
        sql`LOWER(${ingredients.name}) IN (${sql.join(
          deduplicatedItems.map((name) => sql`${name}`),
          sql`, `,
        )})`,
      );

    const existingSet = new Set(
      existingNames.map((row) => row.name.toLowerCase()),
    );
    const newItems = deduplicatedItems.filter(
      (item) => !existingSet.has(item),
    );

    // If all items already exist, auto-tag and return empty
    if (newItems.length === 0) {
      console.info("All items in span already in DB, marking as reviewed", {
        spanId: span.id,
      });
      await markSpanAsReviewed({ spanId: span.id });
      return NextResponse.json({
        spanId: null,
        traceId: null,
        items: [],
        totalInSpan: span.metadata?.totalUnrecognized ?? rawItems.length,
      });
    }

    return NextResponse.json({
      spanId: span.id,
      traceId: span.trace_id,
      items: newItems,
      totalInSpan: span.metadata?.totalUnrecognized ?? rawItems.length,
    });
  } catch (error) {
    console.error("Error fetching next span", error);
    return NextResponse.json(
      { error: "Failed to fetch spans" },
      { status: 500 },
    );
  }
}
