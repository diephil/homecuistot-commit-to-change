// Types for Inventory Page
// Feature: 014-inventory-page-rework

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
  previousPantryStaple?: boolean; // undefined if new to inventory
  proposedPantryStaple?: boolean; // undefined = no change
  confidence: "high" | "medium" | "low";
}

// Full proposal after validation
export interface InventoryUpdateProposal {
  recognized: ValidatedInventoryUpdate[];
  unrecognized: string[];
}
