// Types for Inventory Page Rework
// Feature: 014-inventory-page-rework

import { z } from "zod";

// ============================================================
// Zod Schemas (source of truth)
// ============================================================

// Single ingredient update from LLM
export const inventoryItemUpdateSchema = z.object({
  ingredientName: z.string().min(1).max(100),
  quantityLevel: z.number().int().min(0).max(3),
  // confidence: z.enum(['high', 'medium', 'low']),
});

// Full LLM response
export const inventoryUpdateExtractionSchema = z.object({
  updates: z.array(inventoryItemUpdateSchema).min(1).max(50),
});

// ============================================================
// Derived Types
// ============================================================

export type InventoryItemUpdate = z.infer<typeof inventoryItemUpdateSchema>;
export type InventoryUpdateExtraction = z.infer<
  typeof inventoryUpdateExtractionSchema
>;

// ============================================================
// Application Types
// ============================================================

// Quantity level (strict 0-3)
export type QuantityLevel = 0 | 1 | 2 | 3;

// Display item combining user_inventory + ingredients data
export interface InventoryDisplayItem {
  id: string; // user_inventory.id
  ingredientId: string; // ingredients.id
  name: string; // ingredients.name
  category: string; // ingredients.category
  quantityLevel: QuantityLevel;
  isPantryStaple: boolean;
  updatedAt: Date;
}

// Grouped for display
export interface InventoryGroups {
  available: InventoryDisplayItem[];
  pantryStaples: InventoryDisplayItem[];
}

// Validated update with database ingredient match
export interface ValidatedInventoryUpdate {
  ingredientId: string;
  ingredientName: string;
  previousQuantity: number | null; // null if new to inventory
  proposedQuantity: number;
  confidence: "high" | "medium" | "low";
}

// Full proposal after validation
export interface InventoryUpdateProposal {
  recognized: ValidatedInventoryUpdate[];
  unrecognized: string[];
}

// Modal state
export type ModalStage = "input" | "processing" | "confirmation";
export type InputMode = "voice" | "text";
