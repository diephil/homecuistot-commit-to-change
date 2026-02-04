"use client";

import { Button } from "@/components/shared/Button";
import { InventoryItemBadge } from "@/components/shared/InventoryItemBadge";
import { RecipeAvailabilityCard } from "@/components/app/RecipeAvailabilityCard";
import {
  SCENE_TEXT,
  SARAH_TRACKED_INGREDIENTS,
  SARAH_PANTRY_STAPLES,
  CARBONARA_RECIPE,
} from "@/lib/story-onboarding/constants";
import { toRecipeWithAvailability } from "@/lib/story-onboarding/transforms";

interface Scene2InventoryProps {
  onContinue: () => void;
}

export function Scene2Inventory({ onContinue }: Scene2InventoryProps) {
  const recipeData = toRecipeWithAvailability({
    recipe: CARBONARA_RECIPE,
    inventory: [...SARAH_TRACKED_INGREDIENTS, ...SARAH_PANTRY_STAPLES],
  });

  return (
    <div className="flex flex-col items-center min-h-[80vh] px-6 py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Intro text — first segment is context, rest are headings */}
        {SCENE_TEXT.scene2Intro.map((segment, i) =>
          i === 0 ? (
            <p
              key={i}
              className="text-lg font-bold leading-relaxed animate-[fadeIn_0.5s_ease-in_both]"
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              {segment}
            </p>
          ) : (
            <h2
              key={i}
              className="text-2xl font-black tracking-tight animate-[fadeIn_0.5s_ease-in_both]"
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              {segment}
            </h2>
          ),
        )}

        {/* Tracked ingredients — read-only badges (no action buttons) */}
        <div
          className="space-y-2 animate-[fadeIn_0.5s_ease-in_both]"
          style={{ animationDelay: "0.8s" }}
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

        {/* Staples — read-only badges */}
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

        {/* Recipe card */}
        <div
          className="animate-[fadeIn_0.5s_ease-in_both]"
          style={{ animationDelay: "1.6s" }}
        >
          <h3 className="text-lg font-black mb-2">Tonight&apos;s Options</h3>
          <RecipeAvailabilityCard
            recipe={recipeData}
            variant="almost-available"
          />
        </div>

        {/* Outro text — {word} tokens rendered as highlighted inline badges */}
        {SCENE_TEXT.scene2Outro.map((segment, i) => (
          <p
            key={i}
            className="text-lg font-bold leading-relaxed animate-[fadeIn_0.5s_ease-in_both]"
            style={{ animationDelay: `${2.0 + i * 0.4}s` }}
          >
            {segment.split(/(\{[^}]+\})/).map((part, j) => {
              const match = part.match(/^\{(.+)\}$/);
              if (match) {
                return (
                  <span
                    key={j}
                    className="inline-block bg-red-100 border-2 border-red-400 rounded px-1.5 py-0.5 text-red-700 font-black"
                  >
                    {match[1]}
                  </span>
                );
              }
              return <span key={j}>{part}</span>;
            })}
          </p>
        ))}

        <div
          className="pt-4 animate-[fadeIn_0.5s_ease-in_both]"
          style={{ animationDelay: "2.4s" }}
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
