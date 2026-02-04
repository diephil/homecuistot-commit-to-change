"use client";

import { Button } from "@/components/shared/Button";
import { InventoryItemBadge } from "@/components/shared/InventoryItemBadge";
import {
  CARBONARA_RECIPE,
  SARAH_PANTRY_STAPLES,
} from "@/lib/story-onboarding/constants";
import type { DemoInventoryItem } from "@/lib/story-onboarding/types";

interface Scene6CookedProps {
  preDecrementInventory: DemoInventoryItem[];
  postDecrementInventory: DemoInventoryItem[];
  onContinue: () => void;
}

export function Scene6Cooked({
  preDecrementInventory,
  postDecrementInventory,
  onContinue,
}: Scene6CookedProps) {
  const preMap = new Map(
    preDecrementInventory.map((i) => [i.name.toLowerCase(), i]),
  );

  // Build set of all recipe ingredient names (anchor + optional) for diff display
  const recipeIngredientNames = new Set(
    CARBONARA_RECIPE.ingredients.map((ing) => ing.name.toLowerCase()),
  );

  const trackedItems = postDecrementInventory.filter(
    (item) => !item.isPantryStaple,
  );

  return (
    <div className="flex flex-col items-center min-h-[80vh] px-6 py-8">
      <div className="max-w-md w-full space-y-6">
        <h2
          className="text-2xl font-black tracking-tight animate-[fadeIn_0.5s_ease-in_both]"
          style={{ animationDelay: "0s" }}
        >
          Carbonara: cooked!
        </h2>

        <p
          className="text-base font-semibold text-black/70 animate-[fadeIn_0.5s_ease-in_both]"
          style={{ animationDelay: "0.4s" }}
        >
          Here&apos;s what changed in Sarah&apos;s inventory after cooking the recipe:
        </p>

        {/* Tracked ingredients with diff badges on decremented items */}
        <div
          className="space-y-2 animate-[fadeIn_0.5s_ease-in_both]"
          style={{ animationDelay: "0.8s" }}
        >
          <div className="flex flex-wrap gap-2">
            {trackedItems.map((item, i) => {
              const pre = preMap.get(item.name.toLowerCase());
              const wasDecremented =
                recipeIngredientNames.has(item.name.toLowerCase()) &&
                pre &&
                pre.quantityLevel !== item.quantityLevel;

              return (
                <InventoryItemBadge
                  key={i}
                  name={item.name}
                  level={item.quantityLevel}
                  isStaple={false}
                  useWord
                  changeIndicator={
                    wasDecremented
                      ? {
                          type: "quantity",
                          previousQuantity: pre.quantityLevel,
                          proposedQuantity: item.quantityLevel,
                        }
                      : undefined
                  }
                />
              );
            })}
          </div>
        </div>

        {/* Staples */}
        <div
          className="space-y-2 animate-[fadeIn_0.5s_ease-in_both]"
          style={{ animationDelay: "1.2s" }}
        >
          <h3 className="text-lg font-black">Staples (always available)</h3>
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

        <div
          className="pt-4 animate-[fadeIn_0.5s_ease-in_both]"
          style={{ animationDelay: "2.0s" }}
        >
          <Button
            variant="default"
            size="lg"
            className="w-full justify-center"
            onClick={onContinue}
          >
            Got it &rarr;
          </Button>
        </div>
      </div>
    </div>
  );
}
