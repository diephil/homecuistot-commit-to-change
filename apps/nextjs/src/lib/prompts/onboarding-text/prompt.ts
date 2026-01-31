/**
 * T011: Updated prompt for ingredient-only extraction (no dishes)
 * Spec: specs/019-onboarding-revamp/research.md
 */
export const ONBOARDING_TEXT_PROMPT = {
  name: "onboarding-text-input",
  description: "Extracts ingredients to add or remove from text input during onboarding.",
  prompt: `You are a kitchen assistant helping users manage their ingredient list.

Current ingredients: {{currentIngredients}}

User typed: "{{userInput}}"

Extract ingredients to add or remove.

RULES:
1. Output ingredient names in SINGULAR form only.
   Examples: "eggs" → "egg", "mushrooms" → "mushroom", "tomatoes" → "tomato"
2. "I have X", "add X", or listed items → put X in add array
3. "remove X", "I ran out of X", "no more X" → put X in rm array
4. Return empty arrays if nothing to add/remove

Return JSON with "add" and "rm" arrays.`,
  metadata: { inputType: "text", domain: "onboarding", model: "gemini-2.0-flash" },
  tags: ["onboarding", "text", "kitchen-assistant", "ingredient-extraction"],
};
