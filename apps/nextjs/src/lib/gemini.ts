import { google } from '@ai-sdk/google';
import { generateText, Output } from 'ai';
import { VoiceUpdateSchema } from '@/types/onboarding';

/**
 * T002: Gemini service wrapper for voice/text NLP processing
 * Spec: specs/004-onboarding-flow/research.md lines 9-98
 * Model: gemini-2.5-flash (audio support + structured output)
 */

interface ProcessVoiceInputParams {
  audioBase64?: string;
  text?: string;
  currentContext: {
    dishes: string[];
    ingredients: string[];
  };
}

export async function processVoiceInput(params: ProcessVoiceInputParams) {
  const { audioBase64, text, currentContext } = params;

  if (!audioBase64 && !text) {
    throw new Error('Either audioBase64 or text must be provided');
  }

  const contextString = `Current dishes: ${currentContext.dishes.join(', ') || 'none'}
Current ingredients: ${currentContext.ingredients.join(', ') || 'none'}`;

  const userContent = audioBase64
    ? [
        {
          type: 'text' as const,
          text: `You are a kitchen assistant helping users build their cooking profile.

${contextString}

Extract from the user's voice input:
- Dishes to ADD (cooking skills they mentioned they can cook)
- Dishes to REMOVE (cooking skills they said they don't cook or want removed)
- Ingredients to ADD (food items they have or mentioned)
- Ingredients to REMOVE (food items they don't have or want removed)

Return structured JSON matching the schema. Be case-sensitive for proper names.`,
        },
        {
          type: 'file' as const,
          mediaType: 'audio/webm',
          data: audioBase64,
        },
      ]
    : [
        {
          type: 'text' as const,
          text: `You are a kitchen assistant helping users build their cooking profile.

${contextString}

User typed: "${text}"

Extract from the user's input:
- Dishes to ADD (cooking skills they mentioned they can cook)
- Dishes to REMOVE (cooking skills they said they don't cook or want removed)
- Ingredients to ADD (food items they have or mentioned)
- Ingredients to REMOVE (food items they don't have or want removed)

Return structured JSON matching the schema. Be case-sensitive for proper names.`,
        },
      ];

  const result = await generateText({
    model: google('gemini-2.5-flash'),
    messages: [
      {
        role: 'user',
        content: userContent,
      },
    ],
    output: Output.object({
      schema: VoiceUpdateSchema,
    }),
  });

  return result.output;
}
