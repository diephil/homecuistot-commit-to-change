"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { VoiceTextInput } from "@/components/shared/VoiceTextInput";
import { RecipeAvailabilityCard } from "@/components/app/RecipeAvailabilityCard";
import { Button } from "@/components/shared/Button";
import {
  SCENE_TEXT,
  SAM_INITIAL_INVENTORY,
  CARBONARA_RECIPE,
} from "@/lib/story-onboarding/constants";
import {
  hasRequiredRecipeItems,
  toDemoRecipeFromApiResponse,
  toRecipeWithAvailability,
} from "@/lib/story-onboarding/transforms";
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

interface Scene2RecipeVoiceProps {
  onUpdateDemoRecipe: (recipe: DemoRecipe) => void;
  onContinue: () => void;
}

export function Scene2RecipeVoice({
  onUpdateDemoRecipe,
  onContinue,
}: Scene2RecipeVoiceProps) {
  const [processing, setProcessing] = useState(false);
  const [extractedRecipe, setExtractedRecipe] = useState<DemoRecipe | null>(
    null,
  );
  const [lastTranscription, setLastTranscription] = useState<string>();
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [gatePass, setGatePass] = useState(false);
  const [assisted, setAssisted] = useState(false);

  const MAX_FAILED_ATTEMPTS = 2;

  // Deferred fallback: show user's failed result first, then assist after 2s
  useEffect(() => {
    if (failedAttempts >= MAX_FAILED_ATTEMPTS && !gatePass) {
      const timer = setTimeout(() => {
        setExtractedRecipe(CARBONARA_RECIPE);
        setGatePass(true);
        setAssisted(true);
        onUpdateDemoRecipe(CARBONARA_RECIPE);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [failedAttempts, gatePass, onUpdateDemoRecipe]);

  const processInput = useCallback(
    async (
      input: { type: "voice"; audioBlob: Blob } | { type: "text"; text: string },
    ) => {
      setProcessing(true);

      try {
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
            trackedRecipes: [],
            additionalTags: ["onboarding-story-scene2"],
          };
        } else {
          body = {
            text: input.text,
            trackedRecipes: [],
            additionalTags: ["onboarding-story-scene2"],
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

        // Extract first recipe from response
        if (data.recipes && data.recipes.length > 0) {
          const apiRecipe = data.recipes[0];
          const demoRecipe = toDemoRecipeFromApiResponse(apiRecipe);
          setExtractedRecipe(demoRecipe);

          // Validate recipe against required ingredients
          const passesGate = hasRequiredRecipeItems(demoRecipe);

          if (passesGate) {
            setGatePass(true);
            onUpdateDemoRecipe(demoRecipe);
            toast.success("Perfect! Recipe extracted successfully", {
              description: "All required ingredients detected",
            });
          } else {
            setFailedAttempts((prev) => prev + 1);
            toast.warning("Recipe incomplete", {
              description:
                "Make sure to mention: pasta, bacon, egg, and parmesan",
            });
          }
        } else {
          setFailedAttempts((prev) => prev + 1);
          toast.error("No recipe detected", {
            description: "Try describing your carbonara recipe again",
          });
        }
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Something went wrong. Try again.",
          { description: "Please try again" }
        );
      } finally {
        setProcessing(false);
      }
    },
    [onUpdateDemoRecipe],
  );

  return (
    <div className="flex flex-col items-center min-h-[80vh] px-6 py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Setting */}
        <p
          className="text-sm font-mono font-semibold uppercase tracking-widest text-black/50 animate-[fadeIn_0.5s_ease-in_both]"
          style={{ animationDelay: "0s" }}
        >
          Sam&apos;s Recipe
        </p>

        {/* Narrative intro */}
        {SCENE_TEXT.scene2RecipeIntro.map((segment, i) => (
          <p
            key={i}
            className="text-lg font-bold leading-relaxed animate-[fadeIn_0.5s_ease-in_both]"
            style={{ animationDelay: `${(i + 1) * 0.4}s` }}
          >
            {segment}
          </p>
        ))}

        {/* Instructions with prompted sentence */}
        <div
          className="space-y-1 animate-[fadeIn_0.5s_ease-in_both]"
          style={{
            animationDelay: `${SCENE_TEXT.scene2RecipeIntro.length * 0.4}s`,
          }}
        >
          {SCENE_TEXT.scene2RecipeInstructions.map((segment, i) => (
            <p
              key={i}
              className={
                i === 2
                  ? "text-xl font-black italic text-pink-600"
                  : "text-base font-semibold text-black/70"
              }
            >
              {segment}
            </p>
          ))}
        </div>

        {/* Voice/text input */}
        <div
          className="animate-[fadeIn_0.5s_ease-in_both]"
          style={{
            animationDelay: `${(SCENE_TEXT.scene2RecipeIntro.length + 1) * 0.4}s`,
          }}
        >
          <VoiceTextInput
            onSubmit={processInput}
            processing={processing}
            disabled={gatePass}
            voiceLabel={extractedRecipe ? "Try again" : "Hold to record"}
            textPlaceholder="e.g. My carbonara uses pasta, bacon, egg, parmesan..."
            lastTranscription={lastTranscription}
          />

          {/* Success banner when gate passes */}
          {gatePass && !assisted && (
            <div className="mt-4 bg-green-100 border-4 border-green-600 p-4 rounded-none animate-[fadeIn_0.5s_ease-in_both] shadow-[4px_4px_0px_0px_rgba(22,163,74,1)]">
              <p className="text-lg font-black text-green-600 text-center">
                ✅ Perfect! Recipe extracted successfully!
              </p>
              <p className="text-sm font-semibold text-green-700 text-center mt-2">
                All required ingredients detected
              </p>
            </div>
          )}

          {/* Assisted banner — we provided the recipe after 2 failed attempts */}
          {assisted && (
            <div className="mt-4 bg-amber-100 border-4 border-amber-600 p-4 rounded-none animate-[fadeIn_0.5s_ease-in_both] shadow-[4px_4px_0px_0px_rgba(217,119,6,1)]">
              <p className="text-lg font-black text-amber-700 text-center">
                🤝 No worries, we got you!
              </p>
              <p className="text-sm font-semibold text-amber-800 text-center mt-2">
                Here&apos;s Sam&apos;s carbonara recipe to continue the story
              </p>
            </div>
          )}
        </div>

        {/* Extracted recipe display — shown against Sam's current kitchen */}
        {extractedRecipe && (
          <div className="animate-[fadeIn_0.5s_ease-in_both]">
            <RecipeAvailabilityCard
              recipe={toRecipeWithAvailability({
                recipe: extractedRecipe,
                inventory: SAM_INITIAL_INVENTORY,
              })}
              variant="almost-available"
            />
          </div>
        )}

        {/* Outro text — shown when gate passes */}
        {gatePass && (
          <p className="text-lg font-bold leading-relaxed animate-[fadeIn_0.5s_ease-in_both]">
            {SCENE_TEXT.scene2Outro[0].split(/(\{[^}]+\})/).map((part, j) => {
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
        )}

        {/* Continue button — gated on recipe validation */}
        <div className="pt-4">
          <Button
            variant="default"
            size="lg"
            className={`w-full justify-center transition-all ${
              !gatePass
                ? "opacity-40"
                : "animate-pulse shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            }`}
            onClick={onContinue}
            disabled={!gatePass}
          >
            {gatePass
              ? "Continue →"
              : "Describe recipe with required ingredients"}
          </Button>
        </div>
      </div>
    </div>
  );
}
