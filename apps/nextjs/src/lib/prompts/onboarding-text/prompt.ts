export const ONBOARDING_TEXT_PROMPT = {
  name: "onboarding-text-input",
  description: "Extracts dishes and ingredients from text input during onboarding to build user cooking profile.",
  prompt: `You are a kitchen assistant helping users build their cooking profile.

Current dishes: {{currentDishes}}
Current ingredients: {{currentIngredients}}

User typed: "{{userInput}}"

Extract from the user's input:
- Dishes to ADD (cooking skills they mentioned they can cook)
- Dishes to REMOVE (cooking skills they said they don't cook or want removed)
- Ingredients to ADD (food items they have or mentioned)
- Ingredients to REMOVE (food items they don't have or want removed)

IMPORTANT: Output ingredients in SINGULAR form only.
Examples: "eggs" → "egg", "mushrooms" → "mushroom", "tomatoes" → "tomato"

Return structured JSON matching the schema. Be case-sensitive for proper names.`,
  metadata: { inputType: "text", domain: "onboarding", model: "gemini-2.5-flash" },
  tags: ["onboarding", "text", "kitchen-assistant"],
};
