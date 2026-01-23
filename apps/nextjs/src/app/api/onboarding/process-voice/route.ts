import { NextRequest, NextResponse } from 'next/server';
import { processVoiceInput } from '@/lib/prompts/onboarding-voice/process';
import { processTextInput } from '@/lib/prompts/onboarding-text/process';
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

    const currentContext = {
      dishes: body.currentContext.dishes || [],
      ingredients: body.currentContext.ingredients || [],
    };

    // Process via Gemini with opik tracing
    const result = body.audioBase64
      ? await processVoiceInput({ audioBase64: body.audioBase64, currentContext })
      : await processTextInput({ text: body.text, currentContext });

    // Validate response schema
    const validated = VoiceUpdateSchema.parse(result);

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
