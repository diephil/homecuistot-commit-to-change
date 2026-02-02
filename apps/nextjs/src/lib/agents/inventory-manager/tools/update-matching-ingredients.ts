/**
 * Update Matching Ingredients Tool for ADK Inventory Manager Agent
 *
 * Uses matchIngredients() from services layer to match
 * extracted ingredient names against database.
 *
 * Sets endInvocation=true to return result directly as agent answer.
 */

import { FunctionTool, type ToolContext } from "@google/adk";
import { z } from "zod";
import { adminDb } from "@/db/client";
import { matchIngredients } from "@/lib/services/ingredient-matcher";
import type {
  InventoryUpdateProposal,
  ValidatedInventoryUpdate,
} from "@/types/inventory";
import { Trace } from "opik";

/** Minimal inventory item for session state lookup */
export interface InventorySessionItem {
  id: string; // user_inventory.id
  ingredientId: string; // ingredients.id
  quantityLevel: number;
  isPantryStaple: boolean;
  name: string;
  category: string;
}

// Input schema with short field names for token efficiency
const UpdateMatchingIngredientsInput = z.object({
  up: z
    .array(
      z.object({
        name: z.string().describe("Ingredient name (lowercase, singular)"),
        qty: z
          .number()
          .min(0)
          .max(3)
          .describe("Quantity: 0=out, 1=low, 2=some, 3=full"),
        staple: z
          .boolean()
          .optional()
          .describe(
            "Pantry staple intent. Staples are basic/important foods always considered available in recipe matching. true=add to staples, false=remove from staples, omit=no change",
          ),
      }),
    )
    .describe("Ingredient updates"),
});

type UpdateInput = z.infer<typeof UpdateMatchingIngredientsInput>;

// Demo user ID for standalone script testing
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export function createUpdateMatchingIngredientsTool(params: {
  userId?: string;
  opikTrace: Trace;
}) {
  const userId = params?.userId ?? DEMO_USER_ID;

  return new FunctionTool({
    name: "update_matching_ingredients",
    description: `Match ingredient names against database and return validated updates.
Call with extracted ingredients and quantity levels from user input.`,
    parameters: UpdateMatchingIngredientsInput,
    execute: async (input: UpdateInput, toolContext?: ToolContext) => {
      const { up: updates } = input;
      const span = params.opikTrace.span({
        name: "update_matching_ingredients",
        type: "tool",
        input,
      });

      if (!updates || updates.length === 0) {
        const result = { recognized: [], unrecognized: [] };
        span.update({
          output: result as unknown as Record<string, unknown>,
          tags: ["nothing_to_update"],
        });
        span.end();
        return result;
      }

      // Get currentInventory from session state for previousQuantity lookup
      const currentInventory =
        (toolContext?.state?.get(
          "currentInventory",
        ) as InventorySessionItem[]) ?? [];

      // Build previous state lookups from session (by ingredientId)
      const prevQtyMap = new Map(
        currentInventory.map((item) => [item.ingredientId, item.quantityLevel]),
      );
      const prevStapleMap = new Map(
        currentInventory.map((item) => [
          item.ingredientId,
          item.isPantryStaple,
        ]),
      );

      // Create proposed state lookup maps (by lowercase name)
      const quantityMap = new Map(
        updates.map((u) => [u.name.toLowerCase().trim(), u.qty]),
      );
      const stapleMap = new Map(
        updates
          .filter((u) => u.staple !== undefined)
          .map((u) => [u.name.toLowerCase().trim(), u.staple]),
      );

      // Run matchIngredients
      const matchResult = await adminDb.transaction(async (tx) => {
        return await matchIngredients({
          names: updates.map((u) => u.name),
          userId,
          tx,
        });
      });

      // Build recognized updates with previous state from session
      const recognized: ValidatedInventoryUpdate[] =
        matchResult.ingredients.map((ing) => {
          const nameLower = ing.name.toLowerCase();
          const proposedStaple = stapleMap.get(nameLower);
          const prevStaple = prevStapleMap.get(ing.id);

          return {
            ingredientId: ing.id,
            ingredientName: ing.name,
            previousQuantity: prevQtyMap.get(ing.id) ?? null,
            proposedQuantity: quantityMap.get(nameLower) ?? 3,
            previousPantryStaple: prevStaple,
            proposedPantryStaple: proposedStaple,
            confidence: "high" as const,
          };
        });

      // Build unrecognized from match result (existing + new)
      const unrecognized: string[] = [
        ...matchResult.unrecognizedItems.map((item) => item.rawText),
        ...matchResult.unrecognizedItemsToCreate,
      ];

      const proposal: InventoryUpdateProposal = {
        recognized,
        unrecognized,
      };

      // End invocation - return proposal as agent's final answer
      if (toolContext) {
        toolContext.invocationContext.endInvocation = true;
      }

      span.update({
        output: { proposal } as unknown as Record<string, unknown>,
        metadata: unrecognized.length > 0 ? { unrecognized } : {},
        tags:
          unrecognized.length > 0 ? ["unrecognized_items"] : ["all_recognized"],
      });
      span.end();

      return proposal;
    },
  });
}
