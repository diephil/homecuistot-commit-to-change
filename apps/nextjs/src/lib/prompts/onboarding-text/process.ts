import { z } from "zod";
import { GoogleGenAI, type Schema } from "@google/genai";
import { trackGemini } from "opik-gemini";
import { VoiceUpdateSchema, type VoiceUpdate } from "@/types/onboarding";
import { ONBOARDING_TEXT_PROMPT } from "./prompt";

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

const trackedGenAI = trackGemini(genAI, {
  generationName: ONBOARDING_TEXT_PROMPT.name,
  traceMetadata: {
    tags: ONBOARDING_TEXT_PROMPT.tags,
    ...ONBOARDING_TEXT_PROMPT.metadata,
  },
});

const responseSchema = z.toJSONSchema(VoiceUpdateSchema) as Schema;

interface ProcessTextInputParams {
  text: string;
  currentContext: {
    dishes: string[];
    ingredients: string[];
  };
}

export async function processTextInput(
  params: ProcessTextInputParams,
): Promise<VoiceUpdate> {
  const { text, currentContext } = params;

  const systemPrompt = ONBOARDING_TEXT_PROMPT.prompt
    .replace("{{currentDishes}}", currentContext.dishes.join(", ") || "none")
    .replace(
      "{{currentIngredients}}",
      currentContext.ingredients.join(", ") || "none",
    )
    .replace("{{userInput}}", text);

  const response = await trackedGenAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  await trackedGenAI.flush();

  const responseText = response.text;
  if (!responseText) {
    throw new Error("Empty response from Gemini");
  }

  const parsed = JSON.parse(responseText);
  return VoiceUpdateSchema.parse(parsed);
}
