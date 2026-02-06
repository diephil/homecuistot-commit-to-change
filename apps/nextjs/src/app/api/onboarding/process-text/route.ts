import { NextResponse } from 'next/server';
import { withUser } from '@/lib/services/route-auth';
import { processTextInput } from '@/lib/prompts/onboarding-text/process';
import { IngredientExtractionSchema } from '@/types/onboarding';
import { validateIngredientNames } from '@/lib/services/ingredient-matcher';

/**
 * T035: API route for text-based onboarding input processing
 * Spec: specs/019-onboarding-revamp/contracts/api.md
 *
 * POST /api/onboarding/process-text
 * Accepts text input and returns ingredient add/remove arrays
 */

export const maxDuration = 15; // 15 second timeout

export const POST = withUser(async ({ user, request }) => {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.text) {
      return NextResponse.json(
        { error: 'text is required' },
        { status: 400 }
      );
    }

    if (!body.currentContext) {
      return NextResponse.json(
        { error: 'currentContext is required' },
        { status: 400 }
      );
    }

    const currentContext = {
      ingredients: [
        ...(body.currentContext.ingredients || []),
        ...(body.currentContext.pantryStaples || []),
      ],
    };

    // Process via Gemini with opik tracing
    const result = await processTextInput({
      text: body.text,
      currentContext,
      userId: user.id,
    });

    // Validate ingredients against database
    const addValidation = await validateIngredientNames({ names: result.add });
    const rmValidation = await validateIngredientNames({ names: result.rm });

    // Build response with filtered ingredients
    const allUnrecognized = [
      ...addValidation.unrecognized,
      ...rmValidation.unrecognized,
    ];

    const validated = IngredientExtractionSchema.parse({
      add: addValidation.recognized,
      rm: rmValidation.recognized,
      transcribedText: result.transcribedText,
      unrecognized: allUnrecognized.length > 0 ? allUnrecognized : undefined,
    });

    return NextResponse.json(validated);
  } catch (error) {
    console.error('[process-text] Error:', error);

    if (error instanceof Error) {
      // Timeout error
      if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT') || error.message.includes('ECONNABORTED')) {
        return NextResponse.json(
          { error: 'Request timeout. Please try again.' },
          { status: 408 }
        );
      }

      // Validation error (unparseable NLP response)
      if (error.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Invalid response format from NLP service' },
          { status: 500 }
        );
      }

      // Network errors
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return NextResponse.json(
          { error: 'Network error. Please check your connection.' },
          { status: 503 }
        );
      }
    }

    // Generic error
    return NextResponse.json(
      { error: 'Text processing failed. Please try again.' },
      { status: 500 }
    );
  }
});
