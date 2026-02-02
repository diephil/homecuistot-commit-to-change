/**
 * Voice Transcriptor Agent with Opik Tracing
 *
 * Transcribes audio input to text using Gemini or OpenAI Whisper, with full observability.
 * Handles multilingual input with English translation.
 */

import { GoogleGenAI } from "@google/genai";
import { trackGemini } from "opik-gemini";
import OpenAI from "openai";
import { trackOpenAI } from "opik-openai";
import { type Trace } from "opik";
import { getOpikClient } from "@/lib/tracing/opik-agent";
import { PROMPT } from "./prompt";

const client = getOpikClient();

export interface VoiceTranscriptorAgentParams {
  audioBase64: string;
  mimeType?: string;
  parentTrace: Trace;
  provider?: "google" | "openai";
}

export interface VoiceTranscriptorAgentResult {
  text: string;
}

export async function voiceTranscriptorAgent(
  params: VoiceTranscriptorAgentParams,
): Promise<VoiceTranscriptorAgentResult> {
  const {
    audioBase64,
    mimeType = "audio/webm",
    parentTrace,
    provider = "openai",
  } = params;

  if (provider === "google") {
    // Google Gemini transcription
    const genAI = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
    });

    const trackedGenAI = trackGemini(genAI, {
      parent: parentTrace,
      client,
      generationName: "voice_transcriptor_gemini",
      traceMetadata: {
        tags: ["transcription", "voice-input", "gemini"],
      },
    });

    const response = await trackedGenAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
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
  } else {
    // OpenAI Whisper transcription
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const trackedOpenAI = trackOpenAI(openai, {
      parent: parentTrace,
      client,
      generationName: "voice_transcriptor_whisper",
      traceMetadata: {
        tags: ["transcription", "voice-input", "whisper"],
      },
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

    // Call OpenAI Whisper API
    const response = await trackedOpenAI.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      prompt: PROMPT.prompt,
    });

    await trackedOpenAI.flush();
    const text = response.text?.trim() ?? "";

    if (!text) {
      throw new Error("Could not transcribe audio");
    }

    return { text };
  }
}
