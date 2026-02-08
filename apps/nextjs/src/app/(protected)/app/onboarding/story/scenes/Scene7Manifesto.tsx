"use client";

import { Button } from "@/components/shared/Button";
import { SCENE_TEXT } from "@/lib/story-onboarding/constants";
import type { DemoInventoryItem, DemoRecipe } from "@/lib/story-onboarding/types";

interface Scene7ManifestoProps {
  inventory: DemoInventoryItem[];
  demoRecipes: DemoRecipe[];
  onContinue: () => void;
  onRestart?: () => void;
}

export function Scene7Manifesto({
  inventory,
  demoRecipes,
  onContinue,
  onRestart,
}: Scene7ManifestoProps) {
  // Compute stagger delays (adjusted for shortened content)
  const scene8Len = SCENE_TEXT.scene8.length;
  const manifestoStart = scene8Len * 0.3;
  const manifestoLen = SCENE_TEXT.scene8Manifesto.length;
  const oppositionStart = manifestoStart + manifestoLen * 0.3 + 0.2;
  const oppositionLen = SCENE_TEXT.scene8Opposition.length;
  const closingStart = oppositionStart + oppositionLen * 0.4 + 0.2;
  const closingLen = SCENE_TEXT.scene8Closing.length;
  const ctaDelay = closingStart + closingLen * 0.3;

  return (
    <div className="flex flex-col items-center min-h-[80vh] px-6 py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Reflection */}
        {SCENE_TEXT.scene8.map((segment, i) => (
          <p
            key={`r-${i}`}
            className="text-lg font-bold leading-relaxed animate-[fadeIn_0.5s_ease-in_both]"
            style={{ animationDelay: `${i * 0.3}s` }}
          >
            {segment}
          </p>
        ))}

        {/* Manifesto — emphasized */}
        {SCENE_TEXT.scene8Manifesto.map((segment, i) => (
          <p
            key={`m-${i}`}
            className="text-xl font-black leading-snug animate-[fadeIn_0.5s_ease-in_both]"
            style={{ animationDelay: `${manifestoStart + i * 0.3}s` }}
          >
            {segment}
          </p>
        ))}

        {/* Opposition — alternating contrast pairs */}
        <div className="space-y-2 py-2">
          {SCENE_TEXT.scene8Opposition.map((segment, i) => {
            const isOtherApps = i % 2 === 0;
            return (
              <p
                key={`o-${i}`}
                className={`animate-[fadeIn_0.5s_ease-in_both] ${
                  isOtherApps
                    ? "text-base text-black/65 line-through decoration-black/50"
                    : "text-lg font-black text-black"
                }`}
                style={{ animationDelay: `${oppositionStart + i * 0.4}s` }}
              >
                {segment}
              </p>
            );
          })}
        </div>

        {/* Closing */}
        {SCENE_TEXT.scene8Closing.map((segment, i) => (
          <p
            key={`c-${i}`}
            className="text-lg font-bold leading-relaxed animate-[fadeIn_0.5s_ease-in_both]"
            style={{ animationDelay: `${closingStart + i * 0.3}s` }}
          >
            {segment}
          </p>
        ))}

        {/* CTAs */}
        <div
          className="space-y-3 pt-4 animate-[fadeIn_0.5s_ease-in_both]"
          style={{ animationDelay: `${ctaDelay}s` }}
        >
          <Button
            variant="default"
            size="lg"
            className="w-full justify-center"
            onClick={onContinue}
          >
            Add your go-to recipes
          </Button>

          {/* Restart demo (only shown if onRestart provided) */}
          {onRestart && (
            <button
              onClick={onRestart}
              className="w-full text-sm text-black/40 hover:text-black/70 font-semibold py-2 cursor-pointer"
            >
              Restart demo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
