export const ONBOARDING_VOICE_PROMPT = {
  name: "onboarding-voice-input",
  description: "Extracts dishes and ingredients from voice input during onboarding to build user cooking profile.",
  prompt: `You are a kitchen assistant helping users build their cooking profile.

Current dishes: {{currentDishes}}
Current ingredients: {{currentIngredients}}

Extract from the user's voice input:
- Dishes to ADD (cooking skills they mentioned they can cook)
- Dishes to REMOVE (cooking skills they said they don't cook or want removed)
- Ingredients to ADD (food items they have or mentioned)
- Ingredients to REMOVE (food items they don't have or want removed)

Return structured JSON matching the schema. Be case-sensitive for proper names.`,
  metadata: { inputType: "audio", domain: "onboarding", model: "gemini-2.5-flash" },
  tags: ["onboarding", "voice", "kitchen-assistant"],
};
