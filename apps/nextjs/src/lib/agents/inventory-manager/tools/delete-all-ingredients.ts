/**
 * Delete All Ingredients Tool for ADK Inventory Manager Agent
 *
 * Deletes all inventory items for the specified user.
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
const DeleteAllIngredientsInput = z.object({});

type DeleteInput = z.infer<typeof DeleteAllIngredientsInput>;

// Demo user ID for standalone script testing
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export function createDeleteAllIngredientsTool(params: {
  userId?: string;
  opikTrace: Trace;
}) {
  const userId = params?.userId ?? DEMO_USER_ID;

  return new FunctionTool({
    name: "delete_all_ingredients",
    description: `Delete all inventory items for the current user. This removes all ingredients from the user's inventory.`,
    parameters: DeleteAllIngredientsInput,
    execute: async (input: DeleteInput, toolContext?: ToolContext) => {
      const span = params.opikTrace.span({
        name: "delete_all_ingredients",
        type: "tool",
        input,
      });

      try {
        // Get currentInventory from session state
        const currentInventory =
          (toolContext?.state?.get(
            "currentInventory",
          ) as InventorySessionItem[]) ?? [];

        // Build proposal showing items to be deleted
        const recognized: ValidatedInventoryUpdate[] = currentInventory
          .filter((item) => item.ingredientId) // Only recognized items
          .map((item) => ({
            ingredientId: item.ingredientId,
            ingredientName: item.name,
            previousQuantity: item.quantityLevel,
            proposedQuantity: 0, // Deletion means quantity -> 0
            previousPantryStaple: item.isPantryStaple,
            proposedPantryStaple: false,
            confidence: "high" as const,
          }));

        // Unrecognized items being deleted (items without ingredientId)
        const unrecognized: string[] = currentInventory
          .filter((item) => !item.ingredientId)
          .map((item) => item.name);

        // Clear currentInventory from session state
        if (toolContext) {
          toolContext.state?.set("currentInventory", []);
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
              ? ["delete", "unrecognized_items"]
              : ["delete", "all_recognized"],
        });
        span.end();

        return proposal;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        span.update({
          output: { error: errorMessage } as Record<string, unknown>,
          tags: ["deletion_error"],
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
