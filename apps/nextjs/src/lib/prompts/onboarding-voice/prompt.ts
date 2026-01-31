/**
 * T009: Updated prompt for ingredient-only extraction (no dishes)
 * Spec: specs/019-onboarding-revamp/research.md
 */
export const ONBOARDING_VOICE_PROMPT = {
  name: "onboarding-voice-input",
  description: "Extracts ingredients to add or remove from voice input during onboarding.",
  prompt: `You are a kitchen assistant helping users manage their ingredient list.

Current ingredients: {{currentIngredients}}

Listen to the user's voice input and extract ingredients to add or remove.

RULES:
1. Output ingredient names in SINGULAR form only.
   Examples: "eggs" → "egg", "mushrooms" → "mushroom", "tomatoes" → "tomato"
2. "I have X" or "add X" → put X in add array
3. "remove X", "I ran out of X", "no more X" → put X in rm array
4. Return empty arrays if nothing to add/remove

Return JSON with "add" and "rm" arrays.`,
  metadata: { inputType: "audio", domain: "onboarding", model: "gemini-2.0-flash" },
  tags: ["onboarding", "voice", "kitchen-assistant", "ingredient-extraction"],
};
