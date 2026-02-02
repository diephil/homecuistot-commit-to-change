import { Prompt } from "opik";
import { getOpikClient } from "@/lib/tracing/opik-agent";

const client = getOpikClient();

export const PROMPT: Prompt = new Prompt(
  {
    name: "voice_transcriptor",
    prompt: `Translate non-English to English. Transcribe this audio as spoken, return only the transcription, no additional text. Remove filler words while preserving intent. IMPORTANT NOTE: If nothing is heard in the audio, return an empty string.`,
    description:
      "Transcribe audio to text, translate non-English to English, remove filler words while preserving intent.",
    versionId: "1.0.0",
    promptId: "1.0.0",
    tags: ["transcription", "voice", "gemini", "multilingual"],
    type: "mustache",
  },
  client,
);
