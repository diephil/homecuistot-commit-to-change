import { z } from "zod";
import { GoogleGenAI, type Schema } from "@google/genai";
import { trackGemini } from "opik-gemini";
import { recipeExtractionSchema, type RecipeExtraction } from "@/types/recipes";
import { RECIPE_EDITOR_PROMPT } from "./prompt";

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

const trackedGenAI = trackGemini(genAI, {
  generationName: RECIPE_EDITOR_PROMPT.name,
  traceMetadata: {
    tags: RECIPE_EDITOR_PROMPT.tags,
    ...RECIPE_EDITOR_PROMPT.metadata,
  },
});

const responseSchema = z.toJSONSchema(recipeExtractionSchema) as Schema;

// Process voice input (audio base64)
export async function processVoiceRecipe(params: {
  audioBase64: string;
}): Promise<RecipeExtraction> {
  const { audioBase64 } = params;

  const systemPrompt = RECIPE_EDITOR_PROMPT.prompt.replace(
    "{{{input}}}",
    "[Audio input - listen and extract recipe details]"
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
  return recipeExtractionSchema.parse(parsed);
}

// Process text input
export async function processTextRecipe(params: {
  text: string;
}): Promise<RecipeExtraction> {
  const { text } = params;

  const systemPrompt = RECIPE_EDITOR_PROMPT.prompt.replace(
    "{{{input}}}",
    text
  );

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

  const text_response = response.text;
  if (!text_response) {
    throw new Error("Empty response from Gemini");
  }

  const parsed = JSON.parse(text_response);
  return recipeExtractionSchema.parse(parsed);
}
