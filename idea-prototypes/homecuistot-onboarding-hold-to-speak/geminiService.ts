
import { GoogleGenAI, Type } from "@google/genai";
import { VoiceUpdate } from "./types";

const API_KEY = process.env.API_KEY || '';

/**
 * High-speed voice processing service.
 * Uses gemini-3-flash-preview for low-latency audio-to-JSON extraction.
 */
export async function processVoiceInput(audioBase64: string, currentContext: string): Promise<VoiceUpdate | null> {
  if (!API_KEY) {
    console.error("Gemini API key is missing");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: `Current inventory: ${currentContext}. Extract additions/removals from audio.` },
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
        systemInstruction: "You are a high-speed inventory extractor for a kitchen app. Be extremely fast. Categorize as 'dishes', 'fridge' (perishables), or 'pantry' (dry goods). Output valid JSON only.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            add: {
              type: Type.OBJECT,
              properties: {
                dishes: { type: Type.ARRAY, items: { type: Type.STRING } },
                fridge: { type: Type.ARRAY, items: { type: Type.STRING } },
                pantry: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["dishes", "fridge", "pantry"],
            },
            remove: {
              type: Type.OBJECT,
              properties: {
                dishes: { type: Type.ARRAY, items: { type: Type.STRING } },
                fridge: { type: Type.ARRAY, items: { type: Type.STRING } },
                pantry: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["dishes", "fridge", "pantry"],
            },
          },
          required: ["add", "remove"],
        },
        temperature: 0.1, // Lower temperature for more consistent, faster output
      },
    });

    return JSON.parse(response.text || "{}") as VoiceUpdate;
  } catch (error) {
    console.error("Transcription Error:", error);
    return null;
  }
}
