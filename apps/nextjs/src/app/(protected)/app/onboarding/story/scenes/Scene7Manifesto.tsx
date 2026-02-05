"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { Loader2 } from "lucide-react";
import { SCENE_TEXT, LOCALSTORAGE_KEY, COMPLETION_FLAG_KEY } from "@/lib/story-onboarding/constants";
import type { DemoInventoryItem, DemoRecipe } from "@/lib/story-onboarding/types";

interface Scene7ManifestoProps {
  inventory: DemoInventoryItem[];
  recipe: DemoRecipe;
  onRestart: () => void;
}

export function Scene7Manifesto({
  inventory,
  recipe,
  onRestart,
}: Scene7ManifestoProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ingredients: inventory
          .filter((i) => !i.isPantryStaple)
          .map((i) => ({ name: i.name, quantityLevel: i.quantityLevel })),
        pantryStaples: inventory
          .filter((i) => i.isPantryStaple)
          .map((i) => ({ name: i.name, quantityLevel: i.quantityLevel })),
        recipes: [
          {
            name: recipe.name,
            description: recipe.description,
            ingredients: recipe.ingredients,
          },
        ],
      };

      const minDelay = new Promise((resolve) => setTimeout(resolve, 6000));

      const [response] = await Promise.all([
        fetch("/api/onboarding/story/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        minDelay,
      ]);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong.");
      }

      // Set completion flag (persists across resets)
      localStorage.setItem(COMPLETION_FLAG_KEY, "true");

      // Clear story state on successful completion
      localStorage.removeItem(LOCALSTORAGE_KEY);

      router.push("/app/recipes");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
      setLoading(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 py-8">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-2xl font-black">Setting up your kitchen...</h2>
          <p className="text-base font-semibold text-black/70 leading-relaxed">
            We&apos;re adding the ingredients and recipe from Sarah&apos;s story
            to your account so you can start cooking right away.
          </p>
          <p className="text-sm text-black/50">
            Don&apos;t worry — you can add your own recipes by voice anytime,
            and update or remove these items from your inventory later.
          </p>
        </div>
      </div>
    );
  }

  // Compute stagger delays
  const scene7Len = SCENE_TEXT.scene7.length;
  const manifestoStart = scene7Len * 0.4;
  const manifestoLen = SCENE_TEXT.scene7Manifesto.length;
  const closingStart = manifestoStart + manifestoLen * 0.4 + 0.4;
  const closingLen = SCENE_TEXT.scene7Closing.length;
  const ctaDelay = closingStart + closingLen * 0.4;

  return (
    <div className="flex flex-col items-center min-h-[80vh] px-6 py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Reflection */}
        {SCENE_TEXT.scene7.map((segment, i) => (
          <p
            key={`r-${i}`}
            className="text-lg font-bold leading-relaxed animate-[fadeIn_0.5s_ease-in_both]"
            style={{ animationDelay: `${i * 0.4}s` }}
          >
            {segment}
          </p>
        ))}

        {/* Manifesto — emphasized */}
        {SCENE_TEXT.scene7Manifesto.map((segment, i) => (
          <p
            key={`m-${i}`}
            className="text-xl font-black leading-snug animate-[fadeIn_0.5s_ease-in_both]"
            style={{ animationDelay: `${manifestoStart + i * 0.4}s` }}
          >
            {segment}
          </p>
        ))}

        {/* Closing */}
        {SCENE_TEXT.scene7Closing.map((segment, i) => (
          <p
            key={`c-${i}`}
            className="text-lg font-bold leading-relaxed animate-[fadeIn_0.5s_ease-in_both]"
            style={{ animationDelay: `${closingStart + i * 0.4}s` }}
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
            onClick={handleComplete}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Get started \u2192"
            )}
          </Button>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 font-semibold text-center">
              {error}
            </p>
          )}

          {/* Restart demo */}
          <button
            onClick={onRestart}
            className="w-full text-sm text-black/40 hover:text-black/70 font-semibold py-2 cursor-pointer"
          >
            Restart demo
          </button>
        </div>
      </div>
    </div>
  );
}
