/**
 * Voice Transcriptor Agent with Opik Tracing
 *
 * Transcribes audio input to text using Gemini, with full observability.
 * Handles multilingual input with English translation.
 */

import { GoogleGenAI } from "@google/genai";
import { trackGemini } from "opik-gemini";
import { Prompt, type Trace } from "opik";
import { getOpikClient } from "@/lib/tracing/opik-agent";

const client = getOpikClient();

export const PROMPT: Prompt = new Prompt(
  {
    name: "voice_transcriptor",
    prompt: `Transcribe this audio exactly as spoken. Return only the transcription, no additional text. The user should be speaking about food. If they speak another language than English, translate what they say into english. Remove filling words, hesitations, while preserving the initial intent of the user.
IMPORTANT NOTE: If nothing is heard in the audio, return an empty string. PRESERVE THE ORIGINAL INTENT OF THE USER, if nothing is heard, DO NOT INVENT CONTENT AND RETURN AN EMPTY STRING.`,
    description:
      "Transcribe audio to text, translate non-English to English, remove filler words while preserving intent.",
    versionId: "1.0.0",
    promptId: "1.0.0",
    tags: ["transcription", "voice", "gemini", "multilingual"],
    type: "mustache",
  },
  client,
);

export interface VoiceTranscriptorAgentParams {
  audioBase64: string;
  mimeType?: string;
  parentTrace: Trace;
}

export interface VoiceTranscriptorAgentResult {
  text: string;
}

export async function voiceTranscriptorAgent(
  params: VoiceTranscriptorAgentParams,
): Promise<VoiceTranscriptorAgentResult> {
  const { audioBase64, mimeType = "audio/webm", parentTrace } = params;

  const genAI = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
  });

  const trackedGenAI = trackGemini(genAI, {
    parent: parentTrace,
    client,
    generationName: "voice_transcriptor",
    traceMetadata: {
      tags: ["transcription", "voice-input"],
    },
  });

  const response = await trackedGenAI.models.generateContent({
    model: "gemini-2.0-flash",
    config: {
      systemInstruction: PROMPT.prompt,
    },
    contents: [
      {
        role: "user",
        parts: [{ inlineData: { mimeType, data: audioBase64 } }],
      },
    ],
  });

  await trackedGenAI.flush();
  const text = response.text?.trim() ?? "";

  if (!text) {
    throw new Error("Could not transcribe audio");
  }

  return { text };
}
