import { z } from "zod";

// Ingredient with optional flag from LLM extraction
export const recipeIngredientSchema = z.object({
  name: z.string().min(1).describe("lowercase, singular form"),
  isOptional: z.boolean().describe("true if ingredient can be omitted"),
});

// Recipe extraction output from LLM
export const recipeExtractionSchema = z.object({
  title: z.string().min(1).max(100).describe("recipe title, max 100 chars"),
  description: z
    .string()
    .min(1)
    .max(200)
    .describe("brief description, max 200 chars"),
  ingredients: z
    .array(recipeIngredientSchema)
    .min(1)
    .max(20)
    .describe("1-20 ingredients"),
});

// Validation result for ingredient matching
export const validationResultSchema = z.object({
  matched: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      isOptional: z.boolean(),
    })
  ),
  unrecognized: z.array(z.string()),
});

// Recipe state for updates (current recipe being edited)
export const recipeStateSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(200),
  ingredients: z.array(recipeIngredientSchema).min(1).max(20),
});

// Recipe update request schemas
export const recipeUpdateVoiceRequestSchema = z.object({
  currentRecipe: recipeStateSchema,
  audioBase64: z.string().describe("base64-encoded audio/webm"),
});

export const recipeUpdateTextRequestSchema = z.object({
  currentRecipe: recipeStateSchema,
  text: z.string().min(1).describe("user's update instruction"),
});

// Type exports
export type RecipeIngredient = z.infer<typeof recipeIngredientSchema>;
export type RecipeExtraction = z.infer<typeof recipeExtractionSchema>;
export type ValidationResult = z.infer<typeof validationResultSchema>;
export type RecipeState = z.infer<typeof recipeStateSchema>;
export type RecipeUpdateVoiceRequest = z.infer<typeof recipeUpdateVoiceRequestSchema>;
export type RecipeUpdateTextRequest = z.infer<typeof recipeUpdateTextRequestSchema>;
