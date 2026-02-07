import { NextRequest, NextResponse } from "next/server";
import { markSpanAsReviewed } from "@/lib/services/opik-spans";
import { requireAdmin } from "@/lib/services/admin-auth";
import { z } from "zod";

const MarkReviewedSchema = z.object({
  spanId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const validated = MarkReviewedSchema.parse(body);

    const spanTagged = await markSpanAsReviewed({
      spanId: validated.spanId,
    });

    return NextResponse.json({ spanTagged });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error marking span as reviewed", error);
    return NextResponse.json(
      { error: "Failed to mark span as reviewed" },
      { status: 500 },
    );
  }
}
