import { NextResponse } from "next/server";
import { hasCompletedOnboarding } from "@/app/actions/inventory";

/**
 * Onboarding Status Check Route
 * Returns whether user has completed onboarding
 * Used by client-side guard to prevent bfcache issues
 */
export async function GET() {
  try {
    const completed = await hasCompletedOnboarding();

    return NextResponse.json({ completed }, {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("[onboarding/status] Error:", error);

    return NextResponse.json(
      { error: "Failed to check onboarding status" },
      { status: 500 }
    );
  }
}
