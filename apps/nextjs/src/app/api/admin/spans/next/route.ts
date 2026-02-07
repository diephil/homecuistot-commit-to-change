import { NextResponse } from "next/server";
import { adminDb } from "@/db/client";
import { ingredients } from "@/db/schema";
import {
  getNextUnprocessedSpans,
  markSpanAsReviewed,
} from "@/lib/services/opik-spans";
import { checkIsAdmin, requireUser } from "@/lib/services/admin-auth";
import { sql } from "drizzle-orm";

export interface SpanItemWithDbStatus {
  name: string;
  existsInDb: boolean;
}

export interface SpanEntry {
  spanId: string;
  spanName: string;
  traceId: string;
  tags: string[];
  items: SpanItemWithDbStatus[];
  totalInSpan: number;
}

const MOCK_SPANS: SpanEntry[] = [
  {
    spanId: "00000000-0000-0000-0000-000000000001",
    spanName: "classify-ingredients",
    traceId: "00000000-0000-0000-0000-000000000099",
    tags: ["unrecognized-items", "demo"],
    items: [
      { name: "unicorn meat", existsInDb: false },
      { name: "salt", existsInDb: true },
    ],
    totalInSpan: 2,
  },
];

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    return NextResponse.json({ spans: MOCK_SPANS, isDemo: true });
  }

  try {
    const spans = await getNextUnprocessedSpans({ limit: 5 });

    if (spans.length === 0) {
      return NextResponse.json({ spans: [] });
    }

    const entries: SpanEntry[] = [];

    for (const span of spans) {
      const rawItems = span.metadata?.unrecognized ?? [];

      if (!Array.isArray(rawItems) || rawItems.length === 0) {
        console.warn("Span has malformed or empty metadata.unrecognized", {
          spanId: span.id,
        });
        try {
          await markSpanAsReviewed({ spanId: span.id });
        } catch (tagError) {
          console.error("Failed to auto-tag malformed span", {
            spanId: span.id,
            error: tagError,
          });
        }
        continue;
      }

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
        continue;
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

      const items: SpanItemWithDbStatus[] = deduplicatedItems.map((name) => ({
        name,
        existsInDb: existingSet.has(name),
      }));

      entries.push({
        spanId: span.id,
        spanName: span.name,
        traceId: span.trace_id,
        tags: span.tags ?? [],
        items,
        totalInSpan: span.metadata?.totalUnrecognized ?? rawItems.length,
      });
    }

    return NextResponse.json({ spans: entries });
  } catch (error) {
    console.error("Error fetching next spans", error);
    return NextResponse.json(
      { error: "Failed to fetch spans" },
      { status: 500 },
    );
  }
}
