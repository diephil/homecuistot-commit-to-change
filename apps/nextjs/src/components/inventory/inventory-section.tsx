"use client";

import { IngredientBadge } from "@/components/retroui/IngredientBadge";
import { InventoryDisplayItem, QuantityLevel } from "@/types/inventory";
import { Star, StarOff, X } from "lucide-react";

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
              level={item.quantityLevel}
              variant="dots"
              size="md"
              interactive={!isPantrySection}
              onLevelChange={(newLevel) => {
                onQuantityChange({ itemId: item.id, quantity: newLevel });
              }}
            />
            <div className="absolute -top-1 -right-1 flex gap-0.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStaple(item.id);
                }}
                className="h-5 w-5 rounded-full bg-yellow-300 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center transition-all"
                title={isPantrySection ? "Move to Available" : "Move to Pantry Staples"}
              >
                {isPantrySection ? (
                  <StarOff className="h-3 w-3" />
                ) : (
                  <Star className="h-3 w-3 fill-yellow-600 text-yellow-600" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="h-5 w-5 rounded-full bg-red-300 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center transition-all"
                title="Delete ingredient"
              >
                <X className="h-3 w-3 text-red-700" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
