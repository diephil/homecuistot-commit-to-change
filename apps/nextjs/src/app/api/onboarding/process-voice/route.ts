import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/services/route-auth';
import { checkUsageLimit, logUsage } from '@/lib/services/usage-limit';
import { processVoiceInput } from '@/lib/prompts/onboarding-voice/process';
import { IngredientExtractionSchema } from '@/types/onboarding';
import { validateIngredientNames } from '@/lib/services/ingredient-matcher';
import { classifyLlmError } from '@/lib/services/api-error-handler';

/**
 * T026-T027: API route for voice processing
 * Spec: specs/019-onboarding-revamp/contracts/api.md
 *
 * POST /api/onboarding/process-voice
 * Accepts audio (base64) input and returns ingredient add/remove arrays
 */

export const maxDuration = 15; // 15 second timeout per spec

export const POST = withAuth(async ({ user, userId, db, request }) => {
  try {
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

    await checkUsageLimit({ userId, db })

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

    await logUsage({ userId, db, endpoint: '/api/onboarding/process-voice' })
    return NextResponse.json(validated);
  } catch (error) {
    console.error('[process-voice] Error:', error);
    return classifyLlmError(error);
  }
});
