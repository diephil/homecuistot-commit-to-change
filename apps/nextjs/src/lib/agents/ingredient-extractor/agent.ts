/**
 * Ingredient Extractor Agent with Opik Tracing
 *
 * Extracts ingredients to add/remove from text or voice input.
 * Supports multilingual voice with automatic transcription and translation.
 */

import { z } from "zod";
import { GoogleGenAI, type Schema } from "@google/genai";
import { trackGemini } from "opik-gemini";
import { type Trace, Opik } from "opik";
import {
  IngredientExtractionSchema,
  type IngredientExtractionResponse,
} from "@/types/onboarding";
import { PROMPT } from "./prompt";

export interface IngredientExtractorAgentParams {
  text?: string;
  audioBase64?: string;
  mimeType?: string;
  currentIngredients: string[];
  parentTrace?: Trace;
  datasetName?: string;
  opikClient?: Opik;
}

export async function ingredientExtractorAgent(
  params: IngredientExtractorAgentParams,
): Promise<IngredientExtractionResponse> {
  const {
    text,
    audioBase64,
    mimeType = "audio/webm",
    currentIngredients,
    parentTrace,
    datasetName,
    opikClient,
  } = params;

  if (!text && !audioBase64) {
    throw new Error("Either text or audioBase64 must be provided");
  }

  const genAI = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
  });

  const trackedGenAI = trackGemini(genAI, {
    parent: parentTrace,
    client: opikClient,
    generationName: "ingredient_extractor",
    traceMetadata: {
      tags: [
        "ingredient-extraction",
        audioBase64 ? "voice-input" : "text-input",
        ...(datasetName ? ["dataset", datasetName] : []),
      ],
    },
  });

  const responseSchema = z.toJSONSchema(IngredientExtractionSchema) as Schema;

  // Build user content based on input type
  const userContentParts: Array<{
    text?: string;
    inlineData?: { mimeType: string; data: string };
  }> = [];

  // Add current context
  const currentContext = `Current ingredients: ${currentIngredients.join(", ") || "none"}`;

  if (text) {
    userContentParts.push({
      text: `${currentContext}\nUser typed the following: "${text}"`,
    });
  } else if (audioBase64) {
    userContentParts.push(
      { text: currentContext },
      { inlineData: { mimeType, data: audioBase64 } },
    );
  }

  const response = await trackedGenAI.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: [
      {
        role: "user",
        parts: userContentParts,
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema,
      systemInstruction: PROMPT.prompt,
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
