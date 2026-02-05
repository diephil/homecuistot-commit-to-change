"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { VoiceTextInput } from "@/components/shared/VoiceTextInput";
import { Button } from "@/components/shared/Button";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { SCENE_TEXT } from "@/lib/story-onboarding/constants";
import { toDemoRecipeFromApiResponse } from "@/lib/story-onboarding/transforms";
import type { DemoRecipe } from "@/lib/story-onboarding/types";

interface ProcessRecipeResponse {
  recipes: Array<{
    id: string;
    name: string;
    description?: string;
    ingredients: Array<{
      id: string;
      name: string;
      type: "anchor" | "optional";
    }>;
  }>;
  transcribedText?: string;
  assistantResponse?: string;
  noChangesDetected: boolean;
}

interface Scene7YourRecipesProps {
  userRecipes: DemoRecipe[];
  onSetUserRecipes: (recipes: DemoRecipe[]) => void;
  onContinue: () => void;
  onRestart: () => void;
}

export function Scene7YourRecipes({
  userRecipes,
  onSetUserRecipes,
  onContinue,
  onRestart,
}: Scene7YourRecipesProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTranscription, setLastTranscription] = useState<string>();

  // Stable recipe-to-UUID mapping for API calls (survives re-renders)
  const recipeIdMapRef = useRef(new Map<number, string>());

  const canContinue = userRecipes.length >= 1;

  const processInput = useCallback(
    async (
      input: { type: "voice"; audioBlob: Blob } | { type: "text"; text: string },
    ) => {
      setProcessing(true);
      setError(null);

      try {
        // Only send Scene 7 recipes — starts from scratch, no previous scene data
        const idMap = recipeIdMapRef.current;
        const trackedRecipes = userRecipes.map((r, i) => {
          if (!idMap.has(i)) idMap.set(i, crypto.randomUUID());
          return {
            id: idMap.get(i)!,
            name: r.name,
            description: r.description || undefined,
            ingredients: r.ingredients.map((ing) => ({
              id: crypto.randomUUID(),
              name: ing.name,
              type: ing.type,
            })),
          };
        });
        const sentIds = new Set(trackedRecipes.map((r) => r.id));

        let body: Record<string, unknown>;
        if (input.type === "voice") {
          const buffer = await input.audioBlob.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(buffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              "",
            ),
          );
          body = {
            audioBase64: base64,
            trackedRecipes,
            additionalTags: ["onboarding-story-scene7"],
          };
        } else {
          body = {
            text: input.text,
            trackedRecipes,
            additionalTags: ["onboarding-story-scene7"],
          };
        }

        const response = await fetch("/api/onboarding/process-recipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(
            data.error || "Processing failed. Please try again.",
          );
        }

        const data: ProcessRecipeResponse = await response.json();
        setLastTranscription(data.transcribedText);

        if (data.noChangesDetected) {
          toast.error("No recipe detected", {
            description: "Try describing a recipe you know how to make",
          });
          return;
        }

        // Replace Scene 7 recipes with full API response
        const updatedRecipes = (data.recipes ?? []).map((r) =>
          toDemoRecipeFromApiResponse(r),
        );
        onSetUserRecipes(updatedRecipes);

        // Update ID map for new recipes
        updatedRecipes.forEach((_, i) => {
          if (!idMap.has(i)) idMap.set(i, data.recipes[i].id);
        });

        // Toast feedback
        const newCount = data.recipes.filter((r) => !sentIds.has(r.id)).length;
        if (newCount > 0) {
          const newNames = data.recipes
            .filter((r) => !sentIds.has(r.id))
            .map((r) => r.name)
            .join(", ");
          toast.success(
            newCount === 1
              ? `"${newNames}" added!`
              : `${newCount} recipes added!`,
            {
              description:
                newCount === 1
                  ? `${data.recipes.find((r) => !sentIds.has(r.id))!.ingredients.length} ingredients detected`
                  : newNames,
            },
          );
        } else {
          toast.success("Recipe updated!");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Try again.",
        );
      } finally {
        setProcessing(false);
      }
    },
    [userRecipes, onSetUserRecipes],
  );

  return (
    <div className="flex flex-col items-center min-h-[80vh] px-6 py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Setting */}
        <p
          className="text-sm font-mono font-semibold uppercase tracking-widest text-black/50 animate-[fadeIn_0.5s_ease-in_both]"
          style={{ animationDelay: "0s" }}
        >
          Your Recipes
        </p>

        {/* Narrative */}
        {SCENE_TEXT.scene7YourRecipes.map((segment, i) => (
          <p
            key={i}
            className="text-lg font-bold leading-relaxed animate-[fadeIn_0.5s_ease-in_both]"
            style={{ animationDelay: `${(i + 1) * 0.4}s` }}
          >
            {segment}
          </p>
        ))}

        {/* Examples card */}
        {(() => {
          const { prompt, items, closing } = SCENE_TEXT.scene7YourRecipesExamples;
          const examplesDelay = (SCENE_TEXT.scene7YourRecipes.length + 1) * 0.4;
          return (
            <div
              className="bg-white/60 border-2 border-black/10 rounded-lg p-5 space-y-3 animate-[fadeIn_0.5s_ease-in_both]"
              style={{ animationDelay: `${examplesDelay}s` }}
            >
              <p className="text-base font-bold text-black/80">{prompt}</p>
              <ul className="space-y-2 pl-1">
                {items.map((item, i) => (
                  <li key={i} className="text-base italic text-black/60">
                    — {item}
                  </li>
                ))}
              </ul>
              <p className="text-base font-semibold text-black/50">{closing}</p>
            </div>
          );
        })()}

        {/* Voice/text input */}
        <div
          className="animate-[fadeIn_0.5s_ease-in_both]"
          style={{
            animationDelay: `${(SCENE_TEXT.scene7YourRecipes.length + 2) * 0.4}s`,
          }}
        >
          <VoiceTextInput
            onSubmit={processInput}
            processing={processing}
            voiceLabel="Hold to record"
            textPlaceholder="e.g. My spaghetti bolognese uses beef, tomatoes, onion, garlic..."
            lastTranscription={lastTranscription}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 font-semibold text-center">
            {error}
          </p>
        )}

        {/* Recipe list */}
        {userRecipes.length > 0 && (
          <div className="space-y-3 animate-[fadeIn_0.5s_ease-in_both]">
            <p className="text-sm font-mono font-semibold uppercase tracking-widest text-black/50">
              {userRecipes.length} recipe{userRecipes.length !== 1 ? "s" : ""} added
            </p>
            {userRecipes.map((recipe, i) => (
              <div key={i} className="animate-[fadeIn_0.3s_ease-in_both]">
                <RecipeCard
                  recipe={{
                    id: `demo-user-recipe-${i}`,
                    name: recipe.name,
                    description: recipe.description || null,
                    recipeIngredients: recipe.ingredients.map((ing, j) => ({
                      id: `demo-ring-${i}-${j}`,
                      ingredientType: ing.type,
                      ingredientId: `demo-ing-${i}-${j}`,
                      ingredient: {
                        id: `demo-ing-${i}-${j}`,
                        name: ing.name,
                        category: "non_classified",
                      },
                    })),
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Continue button */}
        <div className="pt-4 space-y-3">
          <Button
            variant="default"
            size="lg"
            className={`w-full justify-center transition-all ${
              !canContinue
                ? "opacity-40"
                : "bg-pink-400 text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            }`}
            onClick={onContinue}
            disabled={!canContinue}
          >
            {canContinue
              ? "Start cooking ! 🎉"
              : "Add at least one recipe to continue"}
          </Button>

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
