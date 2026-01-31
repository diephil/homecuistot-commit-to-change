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

Extract from the user's input:
- ingredients_to_add: Food items they mentioned having or want to add
- ingredients_to_remove: Food items they don't have anymore or want removed

IMPORTANT RULES:
1. Output ingredient names in SINGULAR form only.
   Examples: "eggs" → "egg", "mushrooms" → "mushroom", "tomatoes" → "tomato"
2. If user says "I have X", "add X", or simply lists items → put X in ingredients_to_add
3. If user says "remove X", "I ran out of X", "no more X" → put X in ingredients_to_remove
4. If user mentions both adding and removing, include both arrays appropriately
5. If nothing to add, return empty array for ingredients_to_add
6. If nothing to remove, return empty array for ingredients_to_remove

Return structured JSON matching the schema.`,
  metadata: { inputType: "text", domain: "onboarding", model: "gemini-2.0-flash" },
  tags: ["onboarding", "text", "kitchen-assistant", "ingredient-extraction"],
};
