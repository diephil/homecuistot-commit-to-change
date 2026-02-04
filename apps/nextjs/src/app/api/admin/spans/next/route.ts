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
      console.log("[spans/next] No unprocessed span found from Opik");
      return NextResponse.json({
        spanId: null,
        traceId: null,
        items: [],
        totalInSpan: 0,
      });
    }

    console.log("[spans/next] Span found:", {
      spanId: span.id,
      tags: span.tags,
      metadataKeys: span.metadata ? Object.keys(span.metadata) : "null",
      metadata: span.metadata,
    });

    // Extract unrecognized items from metadata
    const rawItems = span.metadata?.unrecognized ?? [];
    console.log("[spans/next] rawItems:", rawItems);

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      console.warn("Span has malformed or empty metadata.unrecognized", {
        spanId: span.id,
      });
      // Auto-mark as reviewed since nothing to process
      try {
        await markSpanAsReviewed({ spanId: span.id });
      } catch (tagError) {
        console.error("Failed to auto-tag malformed span", {
          spanId: span.id,
          error: tagError,
        });
      }
      return NextResponse.json({
        spanId: null,
        traceId: null,
        items: [],
        totalInSpan: 0,
      });
    }

    // Filter non-string entries and deduplicate (case-insensitive)
    const stringItems = rawItems.filter(
      (item): item is string => typeof item === "string" && item.trim() !== "",
    );
    const deduplicatedItems = Array.from(
      new Set(stringItems.map((item) => item.toLowerCase().trim())),
    );

    if (deduplicatedItems.length === 0) {
      console.warn("Span had items but none were valid strings", {
        spanId: span.id,
      });
      try {
        await markSpanAsReviewed({ spanId: span.id });
      } catch (tagError) {
        console.error("Failed to auto-tag span with invalid items", {
          spanId: span.id,
          error: tagError,
        });
      }
      return NextResponse.json({
        spanId: null,
        traceId: null,
        items: [],
        totalInSpan: 0,
      });
    }

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

    console.log("[spans/next] Processing:", {
      deduplicatedCount: deduplicatedItems.length,
      existingInDb: existingNames.length,
      newItemsCount: newItems.length,
      deduplicatedItems,
      existingNames: existingNames.map((r) => r.name),
      newItems,
    });

    // If all items already exist, auto-tag and return empty
    if (newItems.length === 0) {
      console.info("All items in span already in DB, marking as reviewed", {
        spanId: span.id,
      });
      try {
        await markSpanAsReviewed({ spanId: span.id });
      } catch (tagError) {
        console.error("Failed to auto-tag fully-existing span", {
          spanId: span.id,
          error: tagError,
        });
      }
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
