/**
 * API Contract: Delete Unrecognized Item Server Action
 *
 * Feature: 001-unrecognized-items-display
 * Functional Requirement: FR-007, FR-008, FR-014
 *
 * Purpose: Remove unrecognized item from user's inventory while preserving
 * the unrecognized_items table record for potential future matching.
 */

import { z } from 'zod';

// ============================================================================
// Request Schema
// ============================================================================

/**
 * Input parameters for deleting an unrecognized item from inventory
 *
 * Named parameter object per Constitution Principle VI (2+ parameters)
 */
export const DeleteUnrecognizedItemParamsSchema = z.object({
  /**
   * User ID who owns the inventory item
   * Required for authorization (user can only delete own items)
   */
  userId: z.string().uuid('User ID must be valid UUID'),

  /**
   * Inventory entry ID to delete (user_inventory.id)
   * NOT the unrecognized_items.id (that record is preserved)
   */
  inventoryId: z.string().uuid('Inventory ID must be valid UUID'),
});

/**
 * Derived TypeScript type from Zod schema (Constitution Principle V)
 */
export type DeleteUnrecognizedItemParams = z.infer<typeof DeleteUnrecognizedItemParamsSchema>;

// ============================================================================
// Response Schema
// ============================================================================

/**
 * Success response when unrecognized item is deleted
 */
export const DeleteUnrecognizedItemSuccessSchema = z.object({
  success: z.literal(true),

  /**
   * ID of the deleted inventory entry (for client-side cleanup)
   */
  deletedInventoryId: z.string().uuid(),
});

/**
 * Error response when deletion fails
 * Per clarification: error toast only, no retry action
 */
export const DeleteUnrecognizedItemErrorSchema = z.object({
  success: z.literal(false),

  /**
   * User-friendly error message (displayed in toast)
   * Examples:
   * - "Failed to delete item" (generic network/server error)
   * - "Item not found" (inventory entry doesn't exist)
   * - "Not authorized" (userId mismatch)
   */
  error: z.string().min(1),

  /**
   * Error code for client-side handling (optional, for post-MVP analytics)
   */
  code: z.enum(['NOT_FOUND', 'UNAUTHORIZED', 'NETWORK_ERROR', 'DATABASE_ERROR']).optional(),
});

/**
 * Union response type (success OR error)
 */
export const DeleteUnrecognizedItemResultSchema = z.discriminatedUnion('success', [
  DeleteUnrecognizedItemSuccessSchema,
  DeleteUnrecognizedItemErrorSchema,
]);

/**
 * Derived TypeScript type from Zod schema (Constitution Principle V)
 */
export type DeleteUnrecognizedItemResult = z.infer<typeof DeleteUnrecognizedItemResultSchema>;

// ============================================================================
// Server Action Signature
// ============================================================================

/**
 * Server Action: Delete unrecognized item from user inventory
 *
 * Location: apps/nextjs/src/app/actions/inventory.actions.ts
 *
 * Implementation Notes:
 * 1. Validate userId matches authenticated user (security)
 * 2. Delete from user_inventory WHERE id = inventoryId AND unrecognizedItemId IS NOT NULL
 * 3. Do NOT delete from unrecognized_items table (FK constraint onDelete: restrict enforces this)
 * 4. Call revalidatePath('/app/inventory') to refresh server component data
 * 5. Return success with deletedInventoryId OR error with message
 *
 * @example
 * // Client usage with optimistic update
 * 'use client';
 * import { deleteUnrecognizedItem } from '@/app/actions/inventory.actions';
 *
 * const handleDelete = async (itemId: string) => {
 *   // Optimistic UI update
 *   const optimisticInventory = inventory.filter(item => item.id !== itemId);
 *   setInventory(optimisticInventory);
 *
 *   try {
 *     const result = await deleteUnrecognizedItem({ userId, inventoryId: itemId });
 *
 *     if (!result.success) {
 *       // Rollback optimistic update
 *       setInventory(inventory);
 *       toast.error(result.error); // Per clarification: error toast only
 *       return;
 *     }
 *
 *     toast.success('Item deleted');
 *   } catch (error) {
 *     // Network error (server action threw exception)
 *     setInventory(inventory);
 *     toast.error('Failed to delete item');
 *   }
 * };
 */
export type DeleteUnrecognizedItemAction = (
  params: DeleteUnrecognizedItemParams
) => Promise<DeleteUnrecognizedItemResult>;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate request parameters (use in server action)
 */
export function validateDeleteParams(params: unknown): DeleteUnrecognizedItemParams {
  return DeleteUnrecognizedItemParamsSchema.parse(params);
}

/**
 * Create success response (use in server action)
 */
export function createDeleteSuccess(inventoryId: string): DeleteUnrecognizedItemResult {
  return {
    success: true,
    deletedInventoryId: inventoryId,
  };
}

/**
 * Create error response (use in server action)
 */
export function createDeleteError(
  message: string,
  code?: DeleteUnrecognizedItemResult extends { success: false } ? DeleteUnrecognizedItemResult['code'] : never
): DeleteUnrecognizedItemResult {
  return {
    success: false,
    error: message,
    code,
  };
}

// ============================================================================
// Database Query Pattern (Reference)
// ============================================================================

/**
 * Drizzle ORM query pattern for server action implementation
 *
 * @example
 * import { db } from '@/db';
 * import { userInventory } from '@/db/schema';
 * import { and, eq, isNotNull } from 'drizzle-orm';
 *
 * // In server action:
 * const result = await db.delete(userInventory)
 *   .where(and(
 *     eq(userInventory.id, params.inventoryId),
 *     eq(userInventory.userId, params.userId),
 *     isNotNull(userInventory.unrecognizedItemId) // Safety: only delete unrecognized items
 *   ))
 *   .returning({ id: userInventory.id });
 *
 * if (result.length === 0) {
 *   return createDeleteError('Item not found', 'NOT_FOUND');
 * }
 *
 * revalidatePath('/app/inventory');
 * return createDeleteSuccess(result[0].id);
 */

// ============================================================================
// Error Cases
// ============================================================================

/**
 * Possible error scenarios:
 *
 * 1. NOT_FOUND:
 *    - Inventory entry doesn't exist
 *    - Inventory entry belongs to different user
 *    - Inventory entry is a recognized item (ingredientId NOT NULL)
 *
 * 2. UNAUTHORIZED:
 *    - userId in params doesn't match authenticated user session
 *
 * 3. DATABASE_ERROR:
 *    - Database connection failure
 *    - Foreign key constraint violation (shouldn't happen with onDelete: restrict)
 *
 * 4. NETWORK_ERROR:
 *    - Client-server communication failure (caught in try/catch on client)
 *
 * Per clarification: All errors display generic "Failed to delete item" toast.
 * Error codes are for internal logging/analytics only (post-MVP).
 */
