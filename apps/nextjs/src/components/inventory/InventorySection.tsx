"use client";

import { InventoryItemBadge } from "@/components/shared/InventoryItemBadge";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { INGREDIENT_CATEGORIES } from "@/db/schema/enums";
import { InventoryDisplayItem, QuantityLevel } from "@/types/inventory";
import { Toggle } from "@/components/ui/toggle";
import { List, LayoutGrid, CircleOff } from "lucide-react";

interface InventorySectionProps {
  title: string;
  description?: string;
  items: InventoryDisplayItem[];
  isPantrySection?: boolean;
  groupByCategory?: boolean;
  showEmptyOnly?: boolean;
  onToggleView?: (grouped: boolean) => void;
  onToggleEmpty?: (empty: boolean) => void;
  onQuantityChange: (params: { itemId: string; quantity: QuantityLevel }) => void;
  onToggleStaple: (itemId: string) => void;
  onDelete: (itemId: string) => void;
}

function groupItemsByCategory(items: InventoryDisplayItem[]) {
  const grouped = new Map<string, InventoryDisplayItem[]>();

  for (const item of items) {
    const cat = item.category;
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(item);
  }

  // Sort each group alphabetically
  for (const [, groupItems] of grouped) {
    groupItems.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Return in INGREDIENT_CATEGORIES order, skip empty
  return INGREDIENT_CATEGORIES.filter((cat) => grouped.has(cat)).map((cat) => ({
    category: cat,
    items: grouped.get(cat)!,
  }));
}

function renderItems(params: {
  items: InventoryDisplayItem[];
  isPantrySection: boolean;
  highlightEmpty: boolean;
  onQuantityChange: (params: { itemId: string; quantity: QuantityLevel }) => void;
  onToggleStaple: (itemId: string) => void;
  onDelete: (itemId: string) => void;
}) {
  const { items, isPantrySection, highlightEmpty, onQuantityChange, onToggleStaple, onDelete } = params;

  return items.map((item) => (
    <InventoryItemBadge
      key={item.id}
      name={item.name}
      level={isPantrySection ? 3 : item.quantityLevel}
      isStaple={isPantrySection}
      dimmed={highlightEmpty && item.quantityLevel > 0}
      onLevelChange={(newLevel) => {
        onQuantityChange({ itemId: item.id, quantity: newLevel });
      }}
      onToggleStaple={() => onToggleStaple(item.id)}
      onDismiss={() => onDelete(item.id)}
    />
  ));
}

export function InventorySection({
  title,
  description,
  items,
  isPantrySection = false,
  groupByCategory = true,
  showEmptyOnly = false,
  onToggleView,
  onToggleEmpty,
  onQuantityChange,
  onToggleStaple,
  onDelete,
}: InventorySectionProps) {
  const showToggles = !isPantrySection && items.length > 0;

  const toggleActions = showToggles ? (
    <div className="flex items-center gap-2">
      {onToggleEmpty && (
        <Toggle
          pressed={showEmptyOnly}
          onPressedChange={onToggleEmpty}
          aria-label="Show empty only"
          size="sm"
          className="cursor-pointer border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-md bg-white data-[state=on]:bg-red-200 data-[state=on]:text-black"
        >
          <CircleOff className="h-4 w-4" />
        </Toggle>
      )}
      {onToggleView && (
        <ToggleGroup
          type="single"
          value={groupByCategory ? "grouped" : "flat"}
          onValueChange={(value) => {
            if (value) onToggleView(value === "grouped");
          }}
          className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-md bg-white"
        >
          <ToggleGroupItem
            value="flat"
            aria-label="List view"
            className="cursor-pointer rounded-none border-r-2 border-black data-[state=on]:bg-yellow-300 data-[state=on]:text-black"
            size="sm"
          >
            <List className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="grouped"
            aria-label="Grouped by category"
            className="cursor-pointer rounded-none data-[state=on]:bg-yellow-300 data-[state=on]:text-black"
            size="sm"
          >
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      )}
    </div>
  ) : undefined;

  // Empty state
  if (items.length === 0) {
    return (
      <section className="space-y-4 pb-8">
        <SectionHeader title={title} description={description} />
        <p className="text-sm text-gray-500 italic">No items yet</p>
      </section>
    );
  }

  const highlightEmpty = showEmptyOnly && !isPantrySection;

  const itemRenderParams = { isPantrySection, highlightEmpty, onQuantityChange, onToggleStaple, onDelete };

  return (
    <section className="space-y-4 pb-8">
      <SectionHeader title={title} description={description} action={toggleActions} />

      {groupByCategory && !isPantrySection ? (
        <div className="space-y-3">
          {groupItemsByCategory(items).map((group) => (
            <div key={group.category} className="flex flex-wrap gap-2 items-center">
              <span className="h-2 w-2 rounded-full bg-gray-300 shrink-0" aria-hidden="true" />
              {renderItems({ items: group.items, ...itemRenderParams })}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {renderItems({ items, ...itemRenderParams })}
        </div>
      )}
    </section>
  );
}
