import { z } from "zod";
import { GoogleGenAI, type Schema } from "@google/genai";
import { trackGemini } from "opik-gemini";
import { RecipeBatchSchema, type RecipeBatch } from "./schema";
import { RECIPE_GENERATION_PROMPT } from "./prompt";

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

const trackedGenAI = trackGemini(genAI, {
  generationName: RECIPE_GENERATION_PROMPT.name,
  traceMetadata: {
    tags: RECIPE_GENERATION_PROMPT.tags,
    ...RECIPE_GENERATION_PROMPT.metadata,
  },
});

const responseSchema = z.toJSONSchema(RecipeBatchSchema) as Schema;

interface GenerateRecipeDetailsParams {
  dishes: string[];
}

/**
 * T005: Generate recipe details (description + ingredients) from dish names via LLM
 *
 * @param params.dishes - Array of dish names to generate details for
 * @returns Array of recipe details with description and ingredients
 * @throws Error if LLM call fails or response is invalid
 */
export async function generateRecipeDetails(
  params: GenerateRecipeDetailsParams,
): Promise<RecipeBatch> {
  const { dishes } = params;

  if (dishes.length === 0) {
    return [];
  }

  const prompt = RECIPE_GENERATION_PROMPT.prompt.replace(
    "{{dishes}}",
    dishes.map((d, i) => `${i + 1}. ${d}`).join("\n"),
  );

  const response = await trackedGenAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
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
  return RecipeBatchSchema.parse(parsed);
}
