import { NextRequest, NextResponse } from "next/server";
import { validateIngredients } from "@/app/actions/recipes";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.ingredientNames || !Array.isArray(body.ingredientNames)) {
      return NextResponse.json(
        { error: "ingredientNames array is required" },
        { status: 400 }
      );
    }

    const result = await validateIngredients({
      ingredientNames: body.ingredientNames,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[validate] Error:", error);
    return NextResponse.json(
      { error: "Failed to validate ingredients" },
      { status: 500 }
    );
  }
}
