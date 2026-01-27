// Gemini Integration for Inventory Updates
// Feature: 014-inventory-page-rework

import { z } from "zod";
import { GoogleGenAI, type Schema } from "@google/genai";
import { trackGemini } from "opik-gemini";
import {
  inventoryUpdateExtractionSchema,
  type InventoryUpdateExtraction,
} from "@/types/inventory";
import { INVENTORY_UPDATE_PROMPT } from "./prompt";

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

const trackedGenAI = trackGemini(genAI, {
  generationName: INVENTORY_UPDATE_PROMPT.name,
  traceMetadata: {
    tags: [...INVENTORY_UPDATE_PROMPT.tags],
    ...INVENTORY_UPDATE_PROMPT.metadata,
  },
});

const responseSchema = z.toJSONSchema(
  inventoryUpdateExtractionSchema,
) as Schema;

// Process voice input (audio base64)
export async function processVoiceInventory(params: {
  audioBase64: string;
}): Promise<InventoryUpdateExtraction> {
  const { audioBase64 } = params;

  const systemPrompt = INVENTORY_UPDATE_PROMPT.prompt.replace(
    "{{input}}",
    "<Audio input - listen and extract inventory updates>",
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
  return inventoryUpdateExtractionSchema.parse(parsed);
}

// Process text input
export async function processTextInventory(params: {
  text: string;
}): Promise<InventoryUpdateExtraction> {
  const { text } = params;

  const systemPrompt = INVENTORY_UPDATE_PROMPT.prompt.replace(
    "{{{input}}}",
    text,
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
  return inventoryUpdateExtractionSchema.parse(parsed);
}
