import { Prompt } from "opik";
import { getOpikClient } from "@/lib/tracing/opik-agent";

const client = getOpikClient();

export const PROMPT: Prompt = new Prompt(
  {
    name: "ingredient_extractor",
    prompt: `You are a kitchen assistant helping users manage their ingredient list. Extract ingredients to add or remove.

RULES:
1. Output ingredient names in SINGULAR form only.
   Examples: "eggs" → "egg", "mushrooms" → "mushroom", "tomatoes" → "tomato"
2. "I have X", "add X", or listed items → put X in add array
3. "remove X", "I ran out of X", "no more X" → put X in rm array
4. Return empty arrays if nothing to add/remove
5. For non-English input: translate to English, remove filler words while preserving intent
6. "remove everything", "clear all", "delete everything", "used everything" → put ALL current ingredients in rm array

Return JSON with "add" and "rm" arrays.`,
    description:
      "Extract ingredients to add/remove from text or voice input, with multilingual support and singular form normalization.",
    versionId: "1.0.0",
    promptId: "1.0.0",
    tags: [
      "ingredient-extraction",
      "kitchen-assistant",
      "onboarding",
      "multilingual",
    ],
    type: "mustache",
  },
  client,
);
