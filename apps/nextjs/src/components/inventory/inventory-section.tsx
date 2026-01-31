"use client";

import { IngredientBadge } from "@/components/retroui/IngredientBadge";
import { SmallActionButton } from "@/components/retroui/SmallActionButton";
import { InventoryDisplayItem, QuantityLevel } from "@/types/inventory";
import { Infinity, X } from "lucide-react";

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
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && (
            <p className="text-sm text-gray-600 max-w-md">{description}</p>
          )}
        </div>
        <p className="text-sm text-gray-500 italic">No items yet</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && isPantrySection && (
          <p className="text-sm text-gray-600 max-w-md">{description}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div key={item.id} className="relative inline-flex">
            <IngredientBadge
              name={item.name}
              level={isPantrySection ? 3 : item.quantityLevel}
              variant="dots"
              size="md"
              interactive={!isPantrySection}
              onLevelChange={(newLevel) => {
                onQuantityChange({ itemId: item.id, quantity: newLevel });
              }}
            />
            <div className="absolute -top-1 -right-1 flex gap-0.5">
              {/* Feature 021: FR-011 - Infinity icon for pantry staples */}
              <SmallActionButton
                icon={Infinity}
                variant="yellow"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStaple(item.id);
                }}
                title={isPantrySection ? "Move to Available" : "Move to Pantry Staples"}
              />
              <SmallActionButton
                icon={X}
                variant="red"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                title="Delete ingredient"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
