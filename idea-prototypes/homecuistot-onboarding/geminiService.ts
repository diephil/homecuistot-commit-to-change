
import { GoogleGenAI, Type } from "@google/genai";
import { VoiceUpdate } from "./types";

const API_KEY = process.env.API_KEY || '';

export async function processVoiceInput(audioBase64: string, currentContext: string): Promise<VoiceUpdate | null> {
  if (!API_KEY) {
    console.error("Gemini API key is missing");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `
    Analyze the user's speech. They are managing their kitchen assistant app HomeCuistot.
    The user will mention dishes they can cook, ingredients in their fridge, or items in their pantry to add or remove.
    
    Current state of their inventory is provided as context: ${currentContext}.
    
    If they say something like "Add milk", put it in 'add.fridge'. 
    If they say "I can make Tacos", put it in 'add.dishes'.
    If they say "Remove rice", put it in 'remove.pantry'.
    If they say "I don't have butter anymore", put it in 'remove.fridge'.
    
    Categorize logically:
    - dishes: Full meals or recipes.
    - fridge: Perishables, dairy, fresh produce.
    - pantry: Dry goods, spices, oils, canned items.

    Respond ONLY with the JSON matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: prompt },
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
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result as VoiceUpdate;
  } catch (error) {
    console.error("Error processing voice input:", error);
    return null;
  }
}
