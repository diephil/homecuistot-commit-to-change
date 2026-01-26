/**
 * T003: Recipe generation prompt template
 * Used to generate recipe descriptions and ingredient lists from dish names
 */

export const RECIPE_GENERATION_PROMPT = {
  name: 'recipe-generation',
  description: 'Generates recipe details (description + ingredients) from dish names during onboarding',
  prompt: `You are a culinary assistant helping users set up their cooking profile.

Generate recipe details for each dish provided.

Dishes to process:
{{dishes}}

For each dish, provide:
1. dishName: The exact dish name as provided
2. description: One sentence, max 15 words, describing what the dish is
3. ingredients: 1-6 main ingredient names (common names, lowercase, singular form)

Guidelines:
- Use common ingredient names (e.g., "egg" not "eggs", "chicken" not "chicken breast")
- Focus on anchor/essential ingredients, not seasonings
- Keep descriptions concise and appetizing
- Return valid JSON array matching the schema

Example output for "Pasta Carbonara":
{
  "dishName": "Pasta Carbonara",
  "description": "Creamy Italian pasta with eggs, cheese, and crispy bacon bits.",
  "ingredients": ["pasta", "egg", "bacon", "parmesan", "black pepper"]
}`,
  metadata: {
    inputType: 'dishes',
    domain: 'onboarding',
    model: 'gemini-2.0-flash',
  },
  tags: ['onboarding', 'recipes', 'llm'],
};
