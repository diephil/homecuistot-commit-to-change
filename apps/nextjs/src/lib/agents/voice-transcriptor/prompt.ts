import { Prompt } from "opik";
import { getOpikClient } from "@/lib/tracing/opik-agent";

const client = getOpikClient();

export const PROMPT: Prompt = new Prompt(
  {
    name: "voice_transcriptor",
    prompt: `Transcribe this audio exactly as spoken. Return only the transcription, no additional text. If they speak another language than English, translate what they say into english. IMPORTANT NOTE: If nothing is heard in the audio, return an empty string. DO NOT INVENT CONTENT AND RETURN AN EMPTY STRING WHEN NOTHING IS HEARD OR IF YOU HAVE DOUBTS.`,
    description:
      "Transcribe audio to text, translate non-English to English, remove filler words while preserving intent.",
    versionId: "1.0.0",
    promptId: "1.0.0",
    tags: ["transcription", "voice", "gemini", "multilingual"],
    type: "mustache",
  },
  client,
);
