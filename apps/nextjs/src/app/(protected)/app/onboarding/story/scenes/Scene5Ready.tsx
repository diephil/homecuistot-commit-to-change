"use client";

import { RecipeAvailabilityCard } from "@/components/app/RecipeAvailabilityCard";
import { SCENE_TEXT, CARBONARA_RECIPE } from "@/lib/story-onboarding/constants";
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
      </div>
    </div>
  );
}
