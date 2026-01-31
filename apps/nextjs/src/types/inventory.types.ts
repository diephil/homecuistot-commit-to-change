/**
 * Type Definitions: Unrecognized Items Display
 * Feature: 021-unrecognized-items-display
 *
 * All types derived from Drizzle schema per Constitution Principle V (no manual duplication)
 */

import type { userInventory, ingredients, unrecognizedItems } from '@/db/schema';

// ============================================================================
// Base Types (Drizzle Schema Inference)
// ============================================================================

/**
 * Base inventory entry type from Drizzle schema
 */
type UserInventoryEntry = typeof userInventory.$inferSelect;

/**
 * Ingredient type from Drizzle schema
 */
type Ingredient = typeof ingredients.$inferSelect;

/**
 * Unrecognized item type from Drizzle schema
 */
type UnrecognizedItem = typeof unrecognizedItems.$inferSelect;

// ============================================================================
// Composite Types (With Relations)
// ============================================================================

/**
 * Inventory item with relations (from Drizzle query.userInventory.findMany with relations)
 * Used for inventory page display where we fetch both recognized and unrecognized items
 */
export type InventoryItemWithRelations = UserInventoryEntry & {
  ingredient: Ingredient | null;
  unrecognizedItem: UnrecognizedItem | null;
};

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard: Check if inventory item is an unrecognized item
 * FR-002: Used to apply visual distinction (reduced opacity, muted text)
 * FR-003, FR-004, FR-005: Used to disable quantity/pantry staple controls
 */
export function isUnrecognizedItem(
  item: InventoryItemWithRelations
): item is UnrecognizedInventoryItem {
  return item.unrecognizedItemId !== null && item.unrecognizedItem !== null;
}

/**
 * Type guard: Check if inventory item is a recognized ingredient
 */
export function isRecognizedItem(
  item: InventoryItemWithRelations
): item is RecognizedInventoryItem {
  return item.ingredientId !== null && item.ingredient !== null;
}

// ============================================================================
// Narrowed Types (XOR Constraint Enforcement)
// ============================================================================

/**
 * Unrecognized inventory item (XOR constraint enforced: ingredientId is null)
 * FR-001: These items appear at end of inventory list
 * FR-002: Displayed with reduced opacity and muted text
 * FR-006: Only delete action available
 */
export type UnrecognizedInventoryItem = InventoryItemWithRelations & {
  unrecognizedItemId: string; // NOT NULL
  unrecognizedItem: NonNullable<InventoryItemWithRelations['unrecognizedItem']>; // NOT NULL
  ingredientId: null;
  ingredient: null;
};

/**
 * Recognized inventory item (XOR constraint enforced: unrecognizedItemId is null)
 * Standard inventory items with full functionality
 */
export type RecognizedInventoryItem = InventoryItemWithRelations & {
  ingredientId: string; // NOT NULL
  ingredient: NonNullable<InventoryItemWithRelations['ingredient']>; // NOT NULL
  unrecognizedItemId: null;
  unrecognizedItem: null;
};

// ============================================================================
// Service Function Parameter Types (Named Parameters per Constitution VI)
// ============================================================================

/**
 * Parameters for deleting an unrecognized item from inventory
 * Named parameter object per Constitution Principle VI (2+ parameters)
 * FR-007: Delete from user_inventory table
 * FR-008: Preserve unrecognized_items table record
 */
export type DeleteUnrecognizedItemParams = {
  userId: string;
  inventoryId: string;
};

/**
 * Success result from delete operation
 */
export type DeleteUnrecognizedItemSuccess = {
  success: true;
  deletedInventoryId: string;
};

/**
 * Error result from delete operation
 * FR-014: Display error toast on failure
 */
export type DeleteUnrecognizedItemError = {
  success: false;
  error: string;
  code?: 'NOT_FOUND' | 'UNAUTHORIZED' | 'NETWORK_ERROR' | 'DATABASE_ERROR';
};

/**
 * Union result type (success OR error)
 */
export type DeleteUnrecognizedItemResult =
  | DeleteUnrecognizedItemSuccess
  | DeleteUnrecognizedItemError;

// ============================================================================
// Display/Sorting Types
// ============================================================================

/**
 * Separated inventory items for display rendering
 * FR-001: Unrecognized items appear at end of list
 */
export type SortedInventory = {
  recognized: RecognizedInventoryItem[];
  unrecognized: UnrecognizedInventoryItem[];
};
