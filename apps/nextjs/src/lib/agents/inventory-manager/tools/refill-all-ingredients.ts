/**
 * Refill All Ingredients Tool for ADK Inventory Manager Agent
 *
 * Sets all inventory items to maximum quantity (3) for the specified user.
 *
 * Sets endInvocation=true to return result directly as agent answer.
 */

import { FunctionTool, type ToolContext } from "@google/adk";
import { z } from "zod";
import { adminDb } from "@/db/client";
import { userInventory } from "@/db/schema/user-inventory";
import { eq } from "drizzle-orm";
import type { Trace } from "opik";
import type {
  InventoryUpdateProposal,
  ValidatedInventoryUpdate,
} from "@/types/inventory";
import type { InventorySessionItem } from "./update-matching-ingredients";

// Input schema - no parameters needed
const RefillAllIngredientsInput = z.object({});

type RefillInput = z.infer<typeof RefillAllIngredientsInput>;

export function createRefillAllIngredientsTool(params: {
  userId: string;
  opikTrace: Trace;
}) {
  const { userId, opikTrace } = params;

  return new FunctionTool({
    name: "refill_all_ingredients",
    description: `Set all inventory items to maximum quantity (full stock). This updates all ingredients to quantity level 3.`,
    parameters: RefillAllIngredientsInput,
    execute: async (input: RefillInput, toolContext?: ToolContext) => {
      const span = opikTrace.span({
        name: "refill_all_ingredients",
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

        // Build proposal showing items being refilled
        const recognized: ValidatedInventoryUpdate[] = currentInventory
          .filter((item) => item.ingredientId) // Only recognized items
          .map((item) => ({
            ingredientId: item.ingredientId,
            ingredientName: item.name,
            previousQuantity: item.quantityLevel,
            proposedQuantity: 3, // Refill to maximum
            previousPantryStaple: item.isPantryStaple,
            proposedPantryStaple: undefined, // No change to staple status
            confidence: "high" as const,
          }));

        // Unrecognized items cannot be refilled (no database ingredient_id)
        const unrecognized: string[] = currentInventory
          .filter((item) => !item.ingredientId)
          .map((item) => item.name);

        // Update currentInventory in session state
        if (toolContext) {
          const updatedInventory = currentInventory.map((item) => ({
            ...item,
            quantityLevel: 3,
          }));
          toolContext.state?.set("currentInventory", updatedInventory);
        }

        const proposal: InventoryUpdateProposal = {
          recognized,
          unrecognized,
        };

        // End invocation - return proposal as agent's final answer
        if (toolContext) {
          toolContext.invocationContext.endInvocation = true;
        }

        span.update({
          output: {
            proposal,
          } as unknown as Record<string, unknown>,
          metadata: unrecognized.length > 0 ? { unrecognized } : {},
          tags:
            unrecognized.length > 0
              ? [`user:${userId}`, "refill", "unrecognized_items"]
              : [`user:${userId}`, "refill", "all_recognized"],
        });
        span.end();

        return proposal;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        span.update({
          output: { error: errorMessage } as Record<string, unknown>,
          tags: [`user:${userId}`, "refill_error"],
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
