import { Prompt } from "opik";
import { getOpikClient } from "@/lib/tracing/opik-agent";

const client = getOpikClient();

export const PROMPT: Prompt = new Prompt(
  {
    name: "voice_transcriptor",
    prompt: `Transcribe and translate the audio into clear, fluent English. If the speaker uses any non-English language, translate it to English. Do not include the original language. IMPORTANT NOTE: If there is no clear human speech, output nothing, return an empty string. Do not guess, do not hallucinate`,
    description:
      "Transcribe audio to text, translate non-English to English, remove filler words while preserving intent.",
    versionId: "1.0.0",
    promptId: "1.0.0",
    tags: ["transcription", "voice", "multilingual"],
    type: "mustache",
  },
  client,
);
