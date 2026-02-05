"use client";

import { Button } from "@/components/shared/Button";
import { InventoryItemBadge } from "@/components/shared/InventoryItemBadge";
import {
  SCENE_TEXT,
  SARAH_TRACKED_INGREDIENTS,
  SARAH_PANTRY_STAPLES,
} from "@/lib/story-onboarding/constants";

interface Scene3StoreKitchenProps {
  onContinue: () => void;
}

export function Scene3StoreKitchen({ onContinue }: Scene3StoreKitchenProps) {
  // Delay accumulator for staggered fade-in
  const introLen = SCENE_TEXT.scene3Intro.length;
  const kitchenDelay = (introLen + 1) * 0.4; // +1 for SARAH'S KITCHEN heading

  return (
    <div className="flex flex-col items-center min-h-[80vh] px-6 py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Store intro */}
        {SCENE_TEXT.scene3Intro.map((segment, i) => (
          <p
            key={i}
            className="text-lg font-bold leading-relaxed animate-[fadeIn_0.5s_ease-in_both]"
            style={{ animationDelay: `${i * 0.4}s` }}
          >
            {segment}
          </p>
        ))}

        {/* Kitchen heading */}
        <h2
          className="text-2xl font-black tracking-tight animate-[fadeIn_0.5s_ease-in_both]"
          style={{ animationDelay: `${introLen * 0.4}s` }}
        >
          SARAH&apos;S KITCHEN
        </h2>

        {/* Tracked ingredients */}
        <div
          className="space-y-2 animate-[fadeIn_0.5s_ease-in_both]"
          style={{ animationDelay: `${kitchenDelay}s` }}
        >
          <h3 className="text-lg font-black">Tracked Ingredients</h3>
          <div className="flex flex-wrap gap-2">
            {SARAH_TRACKED_INGREDIENTS.map((item, i) => (
              <InventoryItemBadge
                key={i}
                name={item.name}
                level={item.quantityLevel}
                isStaple={false}
                useWord
              />
            ))}
          </div>
        </div>

        {/* Staples */}
        <div
          className="space-y-2 animate-[fadeIn_0.5s_ease-in_both]"
          style={{ animationDelay: `${kitchenDelay + 0.4}s` }}
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

        {/* Outro */}
        {SCENE_TEXT.scene3Outro.map((segment, i) => (
          <p
            key={i}
            className="text-lg font-bold leading-relaxed animate-[fadeIn_0.5s_ease-in_both]"
            style={{ animationDelay: `${kitchenDelay + 0.8 + i * 0.4}s` }}
          >
            {segment}
          </p>
        ))}

        {/* Continue */}
        <div
          className="pt-4 animate-[fadeIn_0.5s_ease-in_both]"
          style={{ animationDelay: `${kitchenDelay + 1.2}s` }}
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
