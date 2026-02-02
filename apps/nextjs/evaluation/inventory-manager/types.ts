/**
 * Type Definitions: Inventory Manager Evaluation Dataset
 */

import type { ValidatedInventoryUpdate } from "@/types/inventory";

/**
 * Current inventory item for session state context
 * Matches InventorySessionItem from update-matching-ingredients.ts
 */
export interface CurrentInventoryItem {
  id: string; // user_inventory.id
  ingredientId: string; // ingredients.id
  name: string;
  quantityLevel: number;
  isPantryStaple: boolean;
}

/**
 * Dataset item for evaluation
 */
export interface DatasetItem {
  input: string; // User utterance
  expected_output: {
    recognized: ValidatedInventoryUpdate[];
    unrecognized: string[];
  };
  metadata: {
    currentInventory: CurrentInventoryItem[]; // State context
    input_locale: string; // en, fr
    comment: string; // Scenario description
    version: number; // 1
  };
}
