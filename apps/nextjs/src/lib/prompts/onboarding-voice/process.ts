import { z } from "zod";
import { GoogleGenAI, type Schema } from "@google/genai";
import { trackGemini } from "opik-gemini";
import {
  IngredientExtractionSchema,
  type IngredientExtractionResponse,
} from "@/types/onboarding";
import { ONBOARDING_VOICE_PROMPT } from "./prompt";

/**
 * T010: Updated process for ingredient-only extraction
 * Spec: specs/019-onboarding-revamp/contracts/api.md
 */

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

const trackedGenAI = trackGemini(genAI, {
  generationName: ONBOARDING_VOICE_PROMPT.name,
  traceMetadata: {
    tags: ONBOARDING_VOICE_PROMPT.tags,
    ...ONBOARDING_VOICE_PROMPT.metadata,
  },
});

const responseSchema = z.toJSONSchema(IngredientExtractionSchema) as Schema;

interface ProcessVoiceInputParams {
  audioBase64: string;
  currentContext: {
    ingredients: string[];
  };
}

export async function processVoiceInput(
  params: ProcessVoiceInputParams,
): Promise<IngredientExtractionResponse> {
  const { audioBase64, currentContext } = params;

  const systemPrompt = ONBOARDING_VOICE_PROMPT.prompt.replace(
    "{{currentIngredients}}",
    currentContext.ingredients.join(", ") || "none",
  );

  const response = await trackedGenAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: systemPrompt },
          {
            inlineData: {
              mimeType: "audio/webm",
              data: audioBase64,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  await trackedGenAI.flush();

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  const parsed = JSON.parse(text);
  return IngredientExtractionSchema.parse(parsed);
}
