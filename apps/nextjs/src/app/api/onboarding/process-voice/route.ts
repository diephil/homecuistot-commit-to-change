import { NextRequest, NextResponse } from 'next/server';
import { processVoiceInput } from '@/lib/gemini';
import { VoiceUpdateSchema } from '@/types/onboarding';

/**
 * T005: API route for voice/text processing
 * Spec: specs/004-onboarding-flow/contracts/process-voice.openapi.yaml
 *
 * POST /api/onboarding/process-voice
 * Accepts audio (base64) or text input and returns structured add/remove operations
 */

export const maxDuration = 15; // 15 second timeout per spec

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.audioBase64 && !body.text) {
      return NextResponse.json(
        { error: 'Either audioBase64 or text must be provided' },
        { status: 400 }
      );
    }

    if (!body.currentContext) {
      return NextResponse.json(
        { error: 'currentContext is required' },
        { status: 400 }
      );
    }

    // Process via Gemini
    const result = await processVoiceInput({
      audioBase64: body.audioBase64,
      text: body.text,
      currentContext: {
        dishes: body.currentContext.dishes || [],
        ingredients: body.currentContext.ingredients || [],
      },
    });

    // Validate response schema
    const validated = VoiceUpdateSchema.parse(result);

    return NextResponse.json(validated);
  } catch (error) {
    console.error('[process-voice] Error:', error);

    if (error instanceof Error) {
      // Check if it's a timeout error
      if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        return NextResponse.json(
          { error: 'Request timeout. Please try again.' },
          { status: 408 }
        );
      }

      // Check if it's a validation error
      if (error.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Invalid response format from NLP service' },
          { status: 500 }
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
