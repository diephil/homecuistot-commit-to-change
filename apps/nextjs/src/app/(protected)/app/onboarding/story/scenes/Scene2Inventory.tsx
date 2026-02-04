"use client";

import { Button } from "@/components/shared/Button";
import { InventorySection } from "@/components/inventory/InventorySection";
import { RecipeAvailabilityCard } from "@/components/app/RecipeAvailabilityCard";
import {
  SCENE_TEXT,
  SARAH_TRACKED_INGREDIENTS,
  SARAH_PANTRY_STAPLES,
  CARBONARA_RECIPE,
} from "@/lib/story-onboarding/constants";
import { toInventoryDisplayItem, toRecipeWithAvailability } from "@/lib/story-onboarding/transforms";

interface Scene2InventoryProps {
  onContinue: () => void;
}

// No-op callbacks for read-only InventorySection
const noop = () => {};
const noopQuantity = () => {};

export function Scene2Inventory({ onContinue }: Scene2InventoryProps) {
  const trackedDisplayItems = SARAH_TRACKED_INGREDIENTS.map((item, i) =>
    toInventoryDisplayItem({ item, index: i }),
  );
  const stapleDisplayItems = SARAH_PANTRY_STAPLES.map((item, i) =>
    toInventoryDisplayItem({ item, index: i + 100 }),
  );
  const recipeData = toRecipeWithAvailability({
    recipe: CARBONARA_RECIPE,
    inventory: [...SARAH_TRACKED_INGREDIENTS, ...SARAH_PANTRY_STAPLES],
  });

  return (
    <div className="flex flex-col items-center min-h-[80vh] px-6 py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Intro text */}
        {SCENE_TEXT.scene2Intro.map((segment, i) => (
          <h2
            key={i}
            className="text-2xl font-black tracking-tight opacity-0 animate-[fadeIn_0.5s_ease-in_forwards]"
            style={{ animationDelay: `${i * 0.4}s` }}
          >
            {segment}
          </h2>
        ))}

        {/* Inventory sections */}
        <div
          className="opacity-0 animate-[fadeIn_0.5s_ease-in_forwards]"
          style={{ animationDelay: "0.4s" }}
        >
          <InventorySection
            title="Tracked Ingredients"
            items={trackedDisplayItems}
            groupByCategory={false}
            useWord={true}
            onQuantityChange={noopQuantity}
            onToggleStaple={noop}
            onDelete={noop}
          />
        </div>

        <div
          className="opacity-0 animate-[fadeIn_0.5s_ease-in_forwards]"
          style={{ animationDelay: "0.8s" }}
        >
          <InventorySection
            title="Staples (always available)"
            items={stapleDisplayItems}
            isPantrySection
            groupByCategory={false}
            useWord={true}
            onQuantityChange={noopQuantity}
            onToggleStaple={noop}
            onDelete={noop}
          />
        </div>

        {/* Recipe card */}
        <div
          className="opacity-0 animate-[fadeIn_0.5s_ease-in_forwards]"
          style={{ animationDelay: "1.2s" }}
        >
          <h3 className="text-lg font-black mb-2">Tonight&apos;s Options</h3>
          <RecipeAvailabilityCard
            recipe={recipeData}
            variant="almost-available"
          />
        </div>

        {/* Outro text */}
        {SCENE_TEXT.scene2Outro.map((segment, i) => (
          <p
            key={i}
            className="text-lg font-bold leading-relaxed opacity-0 animate-[fadeIn_0.5s_ease-in_forwards]"
            style={{ animationDelay: `${1.6 + i * 0.4}s` }}
          >
            {segment}
          </p>
        ))}

        <div
          className="pt-4 opacity-0 animate-[fadeIn_0.5s_ease-in_forwards]"
          style={{ animationDelay: "2.0s" }}
        >
          <Button
            variant="default"
            size="lg"
            className="w-full justify-center"
            onClick={onContinue}
          >
            Continue →
          </Button>
        </div>
      </div>
    </div>
  );
}
