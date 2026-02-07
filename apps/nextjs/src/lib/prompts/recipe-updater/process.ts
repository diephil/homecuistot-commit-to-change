import { z } from "zod";
import { GoogleGenAI, type Schema } from "@google/genai";
import { trackGemini } from "opik-gemini";
import {
  recipeExtractionSchema,
  type RecipeExtraction,
  type RecipeState,
} from "@/types/recipes";
import { RECIPE_UPDATER_PROMPT } from "./prompt";

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

const trackedGenAI = trackGemini(genAI, {
  generationName: RECIPE_UPDATER_PROMPT.name,
  traceMetadata: {
    tags: RECIPE_UPDATER_PROMPT.tags,
    ...RECIPE_UPDATER_PROMPT.metadata,
  },
});

const responseSchema = z.toJSONSchema(recipeExtractionSchema) as Schema;

// Process voice update (audio base64)
export async function processVoiceRecipeUpdate(params: {
  currentRecipe: RecipeState;
  audioBase64: string;
}): Promise<RecipeExtraction> {
  const { currentRecipe, audioBase64 } = params;

  const systemPrompt = RECIPE_UPDATER_PROMPT.prompt
    .replace("{{{currentRecipe}}}", JSON.stringify(currentRecipe, null, 2))
    .replace("{{{userInput}}}", "[Audio input - listen and apply changes]");

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
  const result = recipeExtractionSchema.parse(parsed);

  // Log field changes for debugging
  const changes: string[] = [];
  if (result.title !== currentRecipe.title) changes.push("title");
  if (result.description !== currentRecipe.description) changes.push("description");
  if (result.ingredients.length !== currentRecipe.ingredients.length) changes.push("ingredients count");

  return result;
}

// Process text update
export async function processTextRecipeUpdate(params: {
  currentRecipe: RecipeState;
  text: string;
}): Promise<RecipeExtraction> {
  const { currentRecipe, text } = params;

  const systemPrompt = RECIPE_UPDATER_PROMPT.prompt
    .replace("{{{currentRecipe}}}", JSON.stringify(currentRecipe, null, 2))
    .replace("{{{userInput}}}", text);

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
  const result = recipeExtractionSchema.parse(parsed);

  // Log field changes for debugging
  const changes: string[] = [];
  if (result.title !== currentRecipe.title) changes.push("title");
  if (result.description !== currentRecipe.description) changes.push("description");
  if (result.ingredients.length !== currentRecipe.ingredients.length) changes.push("ingredients count");

  return result;
}
