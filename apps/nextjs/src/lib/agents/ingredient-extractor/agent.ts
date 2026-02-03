/**
 * Ingredient Extractor Agent with Opik Tracing
 *
 * Extracts ingredients to add/remove from text or voice input.
 * Supports multilingual voice with automatic transcription and translation.
 */

import { z } from "zod";
import { GoogleGenAI, type Schema } from "@google/genai";
import { trackGemini } from "opik-gemini";
import OpenAI from "openai";
import { type Trace, Opik } from "opik";
import {
  IngredientExtractionSchema,
  type IngredientExtractionResponse,
} from "@/types/onboarding";
import { PROMPT } from "./prompt";
import { getOpikClient } from "@/lib/tracing/opik-agent";

export interface IngredientExtractorAgentParams {
  text?: string;
  audioBase64?: string;
  mimeType?: string;
  currentIngredients: string[];
  parentTrace?: Trace;
  datasetName?: string;
  opikClient?: Opik;
  model?: "gemini-2.5-flash-lite" | "gemini-2.0-flash";
  voiceProvider?: "google" | "openai";
  userId?: string;
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
    model = "gemini-2.5-flash-lite",
    userId,
  } = params;

  if (!text && !audioBase64) {
    throw new Error("Either text or audioBase64 must be provided");
  }

  // Default voice provider: OpenAI for audio transcription
  const voiceProvider = params.voiceProvider ?? "openai";

  const userTag = userId ? [`user:${userId}`] : [];
  const client = opikClient ?? getOpikClient();

  // Step 1: Transcribe audio to text if needed
  let inputText: string;
  let useNativeAudio = false;

  if (audioBase64 && voiceProvider === "openai") {
    // Use OpenAI Whisper for transcription
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    // Convert base64 to Buffer
    const audioBuffer = Buffer.from(audioBase64, "base64");

    // Determine file extension from mimeType
    const extension =
      mimeType === "audio/webm"
        ? "webm"
        : mimeType === "audio/mp3"
          ? "mp3"
          : mimeType === "audio/wav"
            ? "wav"
            : "webm";

    // Create a File object from the buffer
    const audioFile = new File([audioBuffer], `audio.${extension}`, {
      type: mimeType,
    });

    const startTime = new Date();

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });

    inputText = transcription.text?.trim() ?? "";

    // Manual span for transcription
    if (parentTrace) {
      parentTrace.span({
        name: "voice_transcriptor_whisper",
        input: { mimeType, audioSizeBytes: audioBuffer.length },
        output: { text: inputText },
        type: "llm",
        model: "whisper-1",
        provider: "openai",
        tags: [...userTag, "transcription", "voice-input", "whisper"],
        startTime,
        endTime: new Date(),
      });
    }

    if (!inputText) {
      throw new Error("Could not transcribe audio");
    }
  } else if (audioBase64 && voiceProvider === "google") {
    // Use Gemini's native audio processing (no separate transcription)
    useNativeAudio = true;
    inputText = ""; // Will be provided as inline data to Gemini
  } else {
    inputText = text!;
  }

  // Step 2: Extract ingredients using Gemini
  const genAI = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
  });

  const trackedGenAI = trackGemini(genAI, {
    parent: parentTrace,
    client,
    generationName: "ingredient_extractor",
    traceMetadata: {
      tags: [
        ...userTag,
        "ingredient-extraction",
        audioBase64 ? "voice-input" : "text-input",
        ...(datasetName ? ["dataset", datasetName] : []),
      ],
    },
  });

  const responseSchema = z.toJSONSchema(IngredientExtractionSchema) as Schema;

  // Add current context
  const currentContext = `Current ingredients: ${currentIngredients.join(", ") || "none"}`;

  // Build content parts based on input type
  const contentParts: Array<{
    text?: string;
    inlineData?: { mimeType: string; data: string };
  }> = [];

  if (useNativeAudio) {
    // Native audio processing with Gemini
    contentParts.push(
      { text: currentContext },
      { inlineData: { mimeType, data: audioBase64! } },
    );
  } else {
    // Text input (either typed or transcribed)
    const userMessage = audioBase64
      ? `${currentContext}\nUser said: "${inputText}"`
      : `${currentContext}\nUser typed the following: "${inputText}"`;
    contentParts.push({ text: userMessage });
  }

  const response = await trackedGenAI.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: contentParts,
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
