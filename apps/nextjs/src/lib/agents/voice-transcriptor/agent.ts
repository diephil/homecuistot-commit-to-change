/**
 * Voice Transcriptor Agent with Opik Tracing
 *
 * Transcribes audio input to text using Gemini, with full observability.
 * Handles multilingual input with English translation.
 */

import { GoogleGenAI } from "@google/genai";
import { trackGemini } from "opik-gemini";
import { type Trace } from "opik";
import { getOpikClient } from "@/lib/tracing/opik-agent";
import { PROMPT } from "./prompt";

const client = getOpikClient();

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
