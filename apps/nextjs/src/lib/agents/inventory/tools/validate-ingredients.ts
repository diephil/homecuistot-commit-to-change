/**
 * Validate Ingredients Tool for ADK Inventory Manager Agent
 *
 * Uses matchIngredients() from services layer to validate
 * extracted ingredient names against database.
 *
 * Sets endInvocation=true to return result directly as agent answer.
 */

import { FunctionTool, type ToolContext } from '@google/adk';
import { z } from 'zod';
import { adminDb } from '@/db/client';
import { matchIngredients } from '@/lib/services/ingredient-matcher';
import type { InventoryUpdateProposal, ValidatedInventoryUpdate } from '@/types/inventory';

// Input schema with short field names for token efficiency
const ValidateIngredientsInput = z.object({
  up: z.array(z.object({
    name: z.string().describe('Ingredient name (lowercase, singular)'),
    qty: z.number().min(0).max(3).describe('Quantity: 0=out, 1=low, 2=some, 3=full'),
  })).describe('Ingredient updates'),
});

type ValidateInput = z.infer<typeof ValidateIngredientsInput>;

// Demo user ID for standalone script testing
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export function createValidateIngredientsTool(params?: { userId?: string }) {
  const userId = params?.userId ?? DEMO_USER_ID;

  return new FunctionTool({
    name: 'validate_ingredients',
    description: `Match ingredient names against database and return validated updates.
Call with extracted ingredients and quantity levels from user input.`,
    parameters: ValidateIngredientsInput,
    execute: async (input: ValidateInput, toolContext?: ToolContext) => {
      const { up: updates } = input;

      if (!updates || updates.length === 0) {
        return { recognized: [], unrecognized: [] };
      }

      // Create quantity lookup map
      const quantityMap = new Map(
        updates.map((u) => [u.name.toLowerCase().trim(), u.qty])
      );

      // Run matchIngredients
      const matchResult = await adminDb.transaction(async (tx) => {
        return await matchIngredients({
          names: updates.map((u) => u.name),
          userId,
          tx,
        });
      });

      // Build recognized updates
      const recognized: ValidatedInventoryUpdate[] = matchResult.ingredients.map((ing) => ({
        ingredientId: ing.id,
        ingredientName: ing.name,
        previousQuantity: null,
        proposedQuantity: quantityMap.get(ing.name.toLowerCase()) ?? 3,
        confidence: 'high' as const,
      }));

      // Agent only returns recognized items (unrecognized hardcoded empty)
      const proposal: InventoryUpdateProposal = { recognized, unrecognized: [] };

      // End invocation - return proposal as agent's final answer
      if (toolContext) {
        toolContext.invocationContext.endInvocation = true;
      }

      return proposal;
    },
  });
}
