"use client";

import { Button } from "@/components/shared/Button";
import { InventoryItemBadge } from "@/components/shared/InventoryItemBadge";
import { RecipeAvailabilityCard } from "@/components/app/RecipeAvailabilityCard";
import {
  SCENE_TEXT,
  SARAH_PANTRY_STAPLES,
  CARBONARA_RECIPE,
} from "@/lib/story-onboarding/constants";
import { toRecipeWithAvailability } from "@/lib/story-onboarding/transforms";
import type { DemoInventoryItem } from "@/lib/story-onboarding/types";

interface Scene5ReadyProps {
  inventory: DemoInventoryItem[];
  onContinue: () => void;
}

export function Scene5Ready({ inventory, onContinue }: Scene5ReadyProps) {
  const recipeData = toRecipeWithAvailability({
    recipe: CARBONARA_RECIPE,
    inventory,
  });

  const trackedItems = inventory.filter((item) => !item.isPantryStaple);

  return (
    <div className="flex flex-col items-center min-h-[80vh] px-6 py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Narrative */}
        {SCENE_TEXT.scene5.map((segment, i) => (
          <p
            key={i}
            className="text-lg font-bold leading-relaxed animate-[fadeIn_0.5s_ease-in_both]"
            style={{ animationDelay: `${i * 0.4}s` }}
          >
            {segment}
          </p>
        ))}

        {/* Recipe card — now available */}
        <div
          className="animate-[fadeIn_0.5s_ease-in_both]"
          style={{ animationDelay: `${SCENE_TEXT.scene5.length * 0.4}s` }}
        >
          <RecipeAvailabilityCard
            recipe={recipeData}
            variant="available"
            onMarkAsCooked={() => onContinue()}
            pulseButton={true}
          />
        </div>

        {/* Inventory with "NEW" badges */}
        <div
          className="space-y-2 animate-[fadeIn_0.5s_ease-in_both]"
          style={{
            animationDelay: `${(SCENE_TEXT.scene5.length + 1) * 0.4}s`,
          }}
        >
          <h3 className="text-lg font-black">Inventory</h3>
          <div className="flex flex-wrap gap-2">
            {trackedItems.map((item, i) => (
              <InventoryItemBadge
                key={i}
                name={item.name}
                level={item.quantityLevel}
                isStaple={false}
                useWord
                changeIndicator={item.isNew ? { type: "new" } : undefined}
              />
            ))}
          </div>

          <h3 className="text-lg font-black mt-4">
            Staples (always available)
          </h3>
          <div className="flex flex-wrap gap-2">
            {SARAH_PANTRY_STAPLES.map((item, i) => (
              <InventoryItemBadge
                key={i}
                name={item.name}
                level={3}
                isStaple
                useWord
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
