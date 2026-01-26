import { z } from 'zod';

/**
 * T004: Recipe generation Zod schemas
 * Used for LLM response validation
 */

export const RecipeDetailSchema = z.object({
  dishName: z.string(),
  description: z.string().max(100),
  ingredients: z.array(z.string()).min(1).max(6),
});

export const RecipeBatchSchema = z.array(RecipeDetailSchema);

export type RecipeDetail = z.infer<typeof RecipeDetailSchema>;
export type RecipeBatch = z.infer<typeof RecipeBatchSchema>;
