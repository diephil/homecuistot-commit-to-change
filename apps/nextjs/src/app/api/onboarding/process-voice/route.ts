import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { processVoiceInput } from '@/lib/prompts/onboarding-voice/process';
import { IngredientExtractionSchema } from '@/types/onboarding';
import { validateIngredientNames } from '@/lib/services/ingredient-matcher';

/**
 * T026-T027: API route for voice processing
 * Spec: specs/019-onboarding-revamp/contracts/api.md
 *
 * POST /api/onboarding/process-voice
 * Accepts audio (base64) input and returns ingredient add/remove arrays
 */

export const maxDuration = 15; // 15 second timeout per spec

export async function POST(request: NextRequest) {
  try {
    // Get user ID from session
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    if (!body.audioBase64) {
      return NextResponse.json(
        { error: 'audioBase64 is required' },
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
    const result = await processVoiceInput({
      audioBase64: body.audioBase64,
      mimeType: body.mimeType,
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
    // T053: Log all errors to console (no external service for MVP)
    console.error('[process-voice] Error:', error);

    if (error instanceof Error) {
      // T049: Check if it's a timeout error (408 Request Timeout)
      if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT') || error.message.includes('ECONNABORTED')) {
        return NextResponse.json(
          { error: 'Request timeout. Please try again.' },
          { status: 408 }
        );
      }

      // T050: Check if it's a validation error (unparseable NLP response)
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
      { error: 'NLP processing failed. Please try again.' },
      { status: 500 }
    );
  }
}
