import { z } from "zod";
import { GoogleGenAI, type Schema } from "@google/genai";
import { trackGemini } from "opik-gemini";
import { OnboardingUpdateSchema, type OnboardingUpdate } from "@/types/onboarding";
import { ONBOARDING_VOICE_PROMPT } from "./prompt";

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

const responseSchema = z.toJSONSchema(OnboardingUpdateSchema) as Schema;

interface ProcessVoiceInputParams {
  audioBase64: string;
  currentContext: {
    dishes: string[];
    ingredients: string[];
  };
}

export async function processVoiceInput(
  params: ProcessVoiceInputParams,
): Promise<OnboardingUpdate> {
  const { audioBase64, currentContext } = params;

  const systemPrompt = ONBOARDING_VOICE_PROMPT.prompt
    .replace("{{currentDishes}}", currentContext.dishes.join(", ") || "none")
    .replace(
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
  return OnboardingUpdateSchema.parse(parsed);
}
