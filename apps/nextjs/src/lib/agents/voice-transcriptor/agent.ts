/**
 * Voice Transcriptor Agent with Opik Tracing
 *
 * Transcribes audio input to text using Gemini or OpenAI Whisper, with full observability.
 * Handles multilingual input with English translation.
 */

import { GoogleGenAI } from "@google/genai";
import { trackGemini } from "opik-gemini";
import OpenAI from "openai";
import { type Trace } from "opik";
import { getOpikClient } from "@/lib/tracing/opik-agent";
import { PROMPT } from "./prompt";

const client = getOpikClient();

export interface VoiceTranscriptorAgentParams {
  audioBase64: string;
  mimeType?: string;
  parentTrace: Trace;
  provider?: "google" | "openai";
  userId?: string;
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
    userId,
  } = params;

  const userTag = userId ? [`user:${userId}`] : [];

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
        tags: [...userTag, "transcription", "voice-input", "gemini"],
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
    // OpenAI Whisper transcription with manual tracing
    // (opik-openai doesn't parse Whisper response format)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    // Convert base64 to Buffer
    const audioBuffer = Buffer.from(audioBase64, "base64");

    // Determine file extension from mimeType (supports iOS formats)
    const getMimeTypeExtension = (mime: string): string => {
      // Handle base MIME types and variants with codecs
      const baseType = mime.split(";")[0].trim();

      const mapping: Record<string, string> = {
        "audio/webm": "webm",
        "audio/mp4": "mp4",
        "audio/m4a": "m4a",
        "audio/mpeg": "mp3",
        "audio/mp3": "mp3",
        "audio/wav": "wav",
        "audio/wave": "wav",
        "audio/ogg": "ogg",
      };

      return mapping[baseType] || "mp4"; // Default to mp4 for iOS compatibility
    };

    const extension = getMimeTypeExtension(mimeType);

    // Create a File object from the buffer
    const audioFile = new File([audioBuffer], `audio.${extension}`, {
      type: mimeType,
    });

    const startTime = new Date();

    // Call OpenAI Whisper API
    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      prompt: PROMPT.prompt,
    });

    const text = response.text?.trim() ?? "";

    // Manual span to capture transcription output
    parentTrace.span({
      name: "voice_transcriptor_whisper",
      input: { mimeType, audioSizeBytes: audioBuffer.length, prompt: PROMPT.prompt },
      output: { text },
      type: "llm",
      model: "whisper-1",
      provider: "openai",
      tags: [...userTag, "transcription", "voice-input", "whisper"],
      startTime,
      endTime: new Date(),
    });

    await client.flush();

    if (!text) {
      throw new Error("Could not transcribe audio");
    }

    return { text };
  }
}
