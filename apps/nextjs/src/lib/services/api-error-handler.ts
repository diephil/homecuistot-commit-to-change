import { NextResponse } from "next/server";

/**
 * Classify LLM/processing errors into appropriate HTTP responses.
 * Shared across onboarding LLM processing routes.
 */
export function classifyLlmError(error: unknown): NextResponse {
  if (error instanceof Error) {
    if (
      error.message.includes("timeout") ||
      error.message.includes("ETIMEDOUT") ||
      error.message.includes("ECONNABORTED")
    ) {
      return NextResponse.json(
        { error: "Request timeout. Please try again." },
        { status: 408 },
      );
    }

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Processing failed. Please try again." },
        { status: 500 },
      );
    }

    if (
      error.message.includes("fetch") ||
      error.message.includes("network")
    ) {
      return NextResponse.json(
        { error: "Network error. Please check your connection." },
        { status: 503 },
      );
    }
  }

  return NextResponse.json(
    { error: "Processing failed. Please try again." },
    { status: 500 },
  );
}
