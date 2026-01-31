import { z } from "zod";
import { GoogleGenAI, type Schema } from "@google/genai";
import { trackGemini } from "opik-gemini";
import {
  IngredientExtractionSchema,
  type IngredientExtractionResponse,
} from "@/types/onboarding";
import { ONBOARDING_TEXT_PROMPT } from "./prompt";

/**
 * T012: Updated process for ingredient-only extraction
 * Spec: specs/019-onboarding-revamp/contracts/api.md
 */

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

const responseSchema = z.toJSONSchema(IngredientExtractionSchema) as Schema;

interface ProcessTextInputParams {
  text: string;
  currentContext: {
    ingredients: string[];
  };
}

export async function processTextInput(
  params: ProcessTextInputParams,
): Promise<IngredientExtractionResponse> {
  const { text, currentContext } = params;

  const systemPrompt = ONBOARDING_TEXT_PROMPT.prompt
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
  return IngredientExtractionSchema.parse(parsed);
}
