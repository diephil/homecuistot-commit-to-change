import { NextResponse } from "next/server";
import { adminDb } from "@/db/client";
import { ingredients } from "@/db/schema";
import {
  getNextUnprocessedSpan,
  markSpanAsReviewed,
} from "@/lib/services/opik-spans";
import { requireAdmin } from "@/lib/services/admin-auth";
import { sql } from "drizzle-orm";

export interface SpanItemWithDbStatus {
  name: string;
  existsInDb: boolean;
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const span = await getNextUnprocessedSpan();
    console.log("Got next unprocessed span", {
      span,
      metadata: span?.metadata,
    });

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
      // Auto-tag only truly malformed/empty spans
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

    // Check which items already exist in DB
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

    // Return ALL items annotated with DB status — no silent auto-review
    const items: SpanItemWithDbStatus[] = deduplicatedItems.map((name) => ({
      name,
      existsInDb: existingSet.has(name),
    }));

    return NextResponse.json({
      spanId: span.id,
      spanName: span.name,
      traceId: span.trace_id,
      tags: span.tags ?? [],
      items,
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
