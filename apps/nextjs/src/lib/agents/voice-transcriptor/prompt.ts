import { Prompt } from "opik";
import { getOpikClient } from "@/lib/tracing/opik-agent";

const client = getOpikClient();

export const PROMPT: Prompt = new Prompt(
  {
    name: "voice_transcriptor",
    prompt: `Transcribe and translate the audio into clear, fluent English. If the speaker uses any non-English language, translate general speech to English BUT preserve food/dish names in their original language when they are culturally-specific terms or proper nouns (e.g., "blanquette de veau", "pad thai", "ratatouille", "kimchi jjigae"). Only translate ingredient names if they have common English equivalents (e.g., "beurre" → "butter", "œufs" → "eggs"). Remove hesitations and filler words while preserving intent. Accept pronunciation mistakes while preserving intent. e.g., "I have butter, ache, tomatoes" → "I have butter, eggs, tomatoes". Speaker is likely talking about food. IMPORTANT NOTE: If there is no clear human speech, output nothing, return an empty string.`,
    description:
      "Transcribe audio to text, translate non-English to English, preserve native food names, remove filler words while preserving intent.",
    versionId: "1.1.0",
    promptId: "1.1.0",
    tags: ["transcription", "voice", "multilingual"],
    type: "mustache",
  },
  client,
);
