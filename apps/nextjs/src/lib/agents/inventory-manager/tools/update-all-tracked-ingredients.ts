/**
 * Update All Tracked Ingredients Tool for ADK Inventory Manager Agent
 *
 * Updates all inventory items to a specified quantity level (0-3).
 * Combines functionality of delete-all and refill-all into a single tool.
 *
 * Sets endInvocation=true to return result directly as agent answer.
 */

import { FunctionTool, type ToolContext } from "@google/adk";
import { z } from "zod";
import type { Trace } from "opik";
import type {
  InventoryUpdateProposal,
  ValidatedInventoryUpdate,
} from "@/types/inventory";
import type { InventorySessionItem } from "./update-matching-ingredients";

// Input schema with quantity level and optional pantry staple filter
const UpdateAllTrackedIngredientsInput = z.object({
  qty: z
    .number()
    .min(0)
    .max(3)
    .describe(
      "Target quantity level for all items. 0=delete all, 1=low, 2=some, 3=full",
    ),
  isPantryStaple: z
    .boolean()
    .optional()
    .describe(
      "Filter items by pantry staple status. true=only pantry staples, false=only non-staples, omit=all items",
    ),
  // TODO: support update by category of ingredients
});

type UpdateAllInput = z.infer<typeof UpdateAllTrackedIngredientsInput>;

export function createUpdateAllTrackedIngredientsTool(params: {
  userId: string;
  opikTrace: Trace;
}) {
  const { userId, opikTrace } = params;

  return new FunctionTool({
    name: "update_all_tracked_ingredients",
    description: `Update all inventory items to a specific quantity level.
Use qty=0 to delete all items, qty=1 for low stock, qty=2 for some stock, qty=3 for full stock.
Optional: filter by pantry staple status (isPantryStaple: true for staples only, false for non-staples only, omit for all).`,
    parameters: UpdateAllTrackedIngredientsInput,
    execute: async (input: UpdateAllInput, toolContext?: ToolContext) => {
      const { qty, isPantryStaple } = input;
      const span = opikTrace.span({
        name: "update_all_tracked_ingredients",
        type: "tool",
        input,
        tags: [`user:${userId}`],
      });

      try {
        // Get currentInventory from session state
        const currentInventory =
          (toolContext?.state?.get(
            "currentInventory",
          ) as InventorySessionItem[]) ?? [];

        // Apply pantry staple filter if specified
        const filteredInventory =
          isPantryStaple !== undefined
            ? currentInventory.filter(
                (item) => item.isPantryStaple === isPantryStaple,
              )
            : currentInventory;

        // Build proposal showing items being updated
        const recognized: ValidatedInventoryUpdate[] = filteredInventory
          .filter((item) => item.ingredientId) // Only recognized items
          .map((item) => ({
            ingredientId: item.ingredientId,
            ingredientName: item.name,
            previousQuantity: item.quantityLevel,
            proposedQuantity: qty,
            previousPantryStaple: item.isPantryStaple,
            // If qty=0 (delete), clear pantry staple. Otherwise, no change.
            proposedPantryStaple: qty === 0 ? false : undefined,
            confidence: "high" as const,
          }));

        // Unrecognized items (items without ingredientId, filtered)
        const unrecognized: string[] = filteredInventory
          .filter((item) => !item.ingredientId)
          .map((item) => item.name);

        // Update session state based on quantity and filter
        if (toolContext) {
          if (qty === 0) {
            // Remove filtered items when qty=0 (delete)
            const remainingInventory = currentInventory.filter((item) => {
              // Keep items that don't match the filter
              if (isPantryStaple !== undefined) {
                return item.isPantryStaple !== isPantryStaple;
              }
              // If no filter, delete all
              return false;
            });
            toolContext.state?.set("currentInventory", remainingInventory);
          } else {
            // Update filtered items to new quantity level
            const updatedInventory = currentInventory.map((item) => {
              // Only update items matching the filter
              const shouldUpdate =
                isPantryStaple !== undefined
                  ? item.isPantryStaple === isPantryStaple
                  : true;

              return shouldUpdate ? { ...item, quantityLevel: qty } : item;
            });
            toolContext.state?.set("currentInventory", updatedInventory);
          }
        }

        const proposal: InventoryUpdateProposal = {
          recognized,
          unrecognized,
        };

        // End invocation - return proposal as agent's final answer
        if (toolContext) {
          toolContext.invocationContext.endInvocation = true;
        }

        const filterTag =
          isPantryStaple !== undefined
            ? isPantryStaple
              ? "staples_only"
              : "non_staples_only"
            : "all_items";

        span.update({
          output: {
            proposal,
          } as unknown as Record<string, unknown>,
          metadata: unrecognized.length > 0 ? { unrecognized } : {},
          tags:
            unrecognized.length > 0
              ? [
                  `user:${userId}`,
                  `update_all_qty_${qty}`,
                  filterTag,
                  "unrecognized_items",
                ]
              : [
                  `user:${userId}`,
                  `update_all_qty_${qty}`,
                  filterTag,
                  "all_recognized",
                ],
        });
        span.end();

        return proposal;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        span.update({
          output: { error: errorMessage } as Record<string, unknown>,
          tags: [`user:${userId}`, "update_all_error"],
        });
        span.end();

        // End invocation even on error
        if (toolContext) {
          toolContext.invocationContext.endInvocation = true;
        }

        // Return empty proposal on error
        return {
          recognized: [],
          unrecognized: [],
        };
      }
    },
  });
}
