"use client";

import { InventoryItemBadge } from "./inventory-item-badge";
import { InventoryDisplayItem, QuantityLevel } from "@/types/inventory";

interface InventorySectionProps {
  title: string;
  description?: string;
  items: InventoryDisplayItem[];
  isPantrySection?: boolean;
  onQuantityChange: (params: { itemId: string; quantity: QuantityLevel }) => void;
  onToggleStaple: (itemId: string) => void;
  onDelete: (itemId: string) => void;
}

export function InventorySection({
  title,
  description,
  items,
  isPantrySection = false,
  onQuantityChange,
  onToggleStaple,
  onDelete,
}: InventorySectionProps) {
  // Empty state
  if (items.length === 0) {
    return (
      <section className="space-y-4 pb-8">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
        </div>
        <p className="text-sm text-gray-500 italic">No items yet</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 pb-8">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <InventoryItemBadge
            key={item.id}
            name={item.name}
            level={isPantrySection ? 3 : item.quantityLevel}
            isStaple={isPantrySection}
            onLevelChange={(newLevel) => {
              onQuantityChange({ itemId: item.id, quantity: newLevel });
            }}
            onToggleStaple={() => onToggleStaple(item.id)}
            onDismiss={() => onDelete(item.id)}
          />
        ))}
      </div>
    </section>
  );
}
