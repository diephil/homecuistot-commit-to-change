import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/services/route-auth';
import { PersistRequestSchema, type PersistResponse } from '@/types/onboarding';
import { persistUserIngredients } from '@/lib/services/ingredient-persistence';

/**
 * T038-T047: Persist route for 019-onboarding-revamp
 * Spec: specs/019-onboarding-revamp/contracts/api.md
 *
 * Persists user ingredients and pantry staples.
 */

export const maxDuration = 30;

export const POST = withAuth(async ({ userId, db, request }) => {
  try {
    // T038: Parse request with cookingSkill
    const body = await request.json();
    const parseResult = PersistRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.message },
        { status: 400 }
      );
    }

    const {
      ingredients: userIngredientNames,
      pantryStaples: userPantryStaples = [],
    } = parseResult.data;

    // T045: Execute all operations in a transaction
    const result = await db(async (tx) => {
      return persistUserIngredients({
        userId,
        ingredientNames: userIngredientNames,
        pantryStapleNames: userPantryStaples,
        tx,
      });
    });

    // T047: Return PersistResponse with counts
    const response: PersistResponse = {
      success: true,
      inventoryCreated: result.inventoryCreated,
      unrecognizedCount: result.unrecognizedCount,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[persist] Error:', error);

    return NextResponse.json(
      { error: 'Failed to persist data' },
      { status: 500 }
    );
  }
});
