/**
 * Component: Unrecognized Item Row
 * Feature: 021-unrecognized-items-display
 * FR-002: Visual distinction (reduced opacity, muted text)
 * FR-003, FR-004, FR-005: No quantity/pantry staple controls, non-clickable
 * FR-006: Delete action only
 * FR-010: Display rawText as name
 *
 * Reusable wrapper component per user instruction (components/shared/)
 * Vibrant neobrutalism styling per Constitution Principle VII
 */

'use client';

import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UnrecognizedInventoryItem } from '@/types/inventory.types';

interface UnrecognizedItemRowProps {
  item: UnrecognizedInventoryItem;
  onDelete: (itemId: string) => void;
}

/**
 * Display component for unrecognized inventory items
 *
 * Visual design:
 * - Reduced opacity (50%) per FR-002
 * - Muted text color (gray-500) per FR-002
 * - Gray border instead of black for disabled state
 * - No click handlers (pointer-events-none on container)
 * - Delete button only (pointer-events-auto to override)
 * - Vibrant neobrutalism: thick borders, box shadows
 * - Mobile-first responsive: smaller borders/shadows on mobile
 *
 * Interaction restrictions (FR-003, FR-004, FR-005):
 * - No quantity controls rendered
 * - No pantry staple checkbox rendered
 * - No click-to-edit functionality
 * - Delete button is the only interactive element
 */
export function UnrecognizedItemRow({
  item,
  onDelete,
}: UnrecognizedItemRowProps) {
  return (
    <div
      className={cn(
        'border-4 md:border-6 border-gray-400 p-4 mb-2',
        'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
        'opacity-50 text-gray-500', // FR-002: Visual distinction
        'pointer-events-none' // FR-005: Non-clickable
      )}
      aria-label="Unrecognized item (limited actions available)"
    >
      <div className="flex items-center justify-between">
        {/* Item name from unrecognized_items.rawText (FR-010) */}
        <span className="font-bold text-lg">
          {item.unrecognizedItem.rawText}
        </span>

        {/* Delete button - only available action (FR-006) */}
        <button
          onClick={() => onDelete(item.id)}
          className={cn(
            'p-2 rounded',
            'hover:bg-red-100 transition-colors',
            'pointer-events-auto' // Override parent pointer-events-none
          )}
          aria-label={`Delete ${item.unrecognizedItem.rawText}`}
          type="button"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Note: NO quantity controls rendered (FR-003) */}
      {/* Note: NO pantry staple checkbox rendered (FR-004) */}
    </div>
  );
}
