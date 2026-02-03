"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { PageContainer } from "@/components/PageContainer";
import { Loader2 } from "lucide-react";
import { IngredientChip, VoiceTextInput, InfoCard, OnboardingRecipeCard } from "@/components/shared";
import { COMMON_INGREDIENTS, PANTRY_STAPLES } from "@/constants/onboarding";
import { toast } from "sonner";
import type { IngredientExtractionResponse } from "@/types/onboarding";

interface OnboardingRecipe {
  id: string;
  name: string;
  description?: string;
  ingredients: Array<{
    id: string;
    name: string;
    type: 'anchor' | 'optional';
  }>;
}

/**
 * Voice-Enabled Kitchen Onboarding Flow (Revamped)
 * Spec: specs/019-onboarding-revamp/spec.md
 * Tasks: T013-T051
 */

interface OnboardingState {
  currentStep: 1 | 2 | 3 | 4 | 5;
  selectedIngredients: string[];
  selectedPantryStaples: string[];
  voiceAddedIngredients: string[]; // Track ingredients added via voice/text in Step 3
  hasVoiceChanges: boolean;
  recipes: OnboardingRecipe[];
}

const initialState: OnboardingState = {
  currentStep: 1,
  selectedIngredients: [],
  selectedPantryStaples: [],
  voiceAddedIngredients: [],
  hasVoiceChanges: false,
  recipes: [],
};

export function OnboardingPageContent() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>(initialState);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastTranscription, setLastTranscription] = useState<string | undefined>();

  // T009: Advance to step 2
  const handleGetStarted = () => {
    setState((prev) => ({ ...prev, currentStep: 2 }));
  };

  // T019: Toggle ingredient selection with deduplication
  const toggleIngredient = (name: string) => {
    setState((prev) => {
      const isSelected = prev.selectedIngredients.includes(name);
      // Check if exists in pantry staples (case-insensitive)
      const existsInPantry = prev.selectedPantryStaples.some(
        (n) => n.toLowerCase() === name.toLowerCase()
      );

      // If already selected in this array, remove it
      if (isSelected) {
        return {
          ...prev,
          selectedIngredients: prev.selectedIngredients.filter((n) => n !== name),
        };
      }

      // If exists in other array, don't add (prevent duplicates)
      if (existsInPantry) {
        return prev;
      }

      // Add to ingredients
      return {
        ...prev,
        selectedIngredients: [...prev.selectedIngredients, name],
      };
    });
  };

  // Toggle pantry staple selection with deduplication
  const togglePantryStaple = (name: string) => {
    setState((prev) => {
      const isSelected = prev.selectedPantryStaples.includes(name);
      // Check if exists in ingredients (case-insensitive)
      const existsInIngredients = prev.selectedIngredients.some(
        (n) => n.toLowerCase() === name.toLowerCase()
      );

      // If already selected in this array, remove it
      if (isSelected) {
        return {
          ...prev,
          selectedPantryStaples: prev.selectedPantryStaples.filter((n) => n !== name),
        };
      }

      // If exists in other array, don't add (prevent duplicates)
      if (existsInIngredients) {
        return prev;
      }

      // Add to pantry staples
      return {
        ...prev,
        selectedPantryStaples: [...prev.selectedPantryStaples, name],
      };
    });
  };

  // T022: Continue to step 3, preserving selections
  const handleContinueToStep3 = () => {
    setState((prev) => ({
      ...prev,
      currentStep: 3,
    }));
  };

  // T028-T037: Handle voice/text submission
  const handleVoiceTextSubmit = useCallback(
    async (input: { type: "voice"; audioBlob: Blob } | { type: "text"; text: string }) => {
      setIsProcessing(true);
      setErrorMessage(null);

      try {
        let response: Response;

        if (input.type === "voice") {
          // Convert blob to base64
          const arrayBuffer = await input.audioBlob.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString("base64");

          response = await fetch("/api/onboarding/process-voice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              audioBase64: base64,
              currentContext: {
                ingredients: state.selectedIngredients,
                pantryStaples: state.selectedPantryStaples,
              },
            }),
          });
        } else {
          response = await fetch("/api/onboarding/process-text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: input.text,
              currentContext: {
                ingredients: state.selectedIngredients,
                pantryStaples: state.selectedPantryStaples,
              },
            }),
          });
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          if (response.status === 408) {
            throw new Error("timeout:Connection issue. Try again.");
          }
          if (response.status === 500 && errorData.error?.includes("Invalid response format")) {
            throw new Error("parse:Couldn't understand. Try again.");
          }
          throw new Error(errorData.error || "Failed to process input");
        }

        const result: IngredientExtractionResponse = await response.json();

        // DEBUG: Log API response
        console.log("[onboarding] API result:", { add: result.add, rm: result.rm });

        // Update transcription if available
        if (result.transcribedText) {
          setLastTranscription(result.transcribedText);
        }

        // T048: Handle empty response
        if (result.add.length === 0 && result.rm.length === 0) {
          // Show unrecognized items if any, even if no updates
          if (result.unrecognized && result.unrecognized.length > 0) {
            toast(`Couldn't find: ${result.unrecognized.join(", ")}`);
          } else {
            toast("No updates were detected");
          }
          return;
        }

        // Show toast for unrecognized items
        if (result.unrecognized && result.unrecognized.length > 0) {
          toast(`Couldn't find: ${result.unrecognized.join(", ")}`);
        }

        // Apply updates - simplified for merged list in Step 3
        setState((prev) => {
          // DEBUG: Log current state before update
          console.log("[onboarding] Before update:", {
            selectedIngredients: prev.selectedIngredients,
            selectedPantryStaples: prev.selectedPantryStaples,
          });
          // Create merged list for duplicate checking
          const allCurrentIngredients = [
            ...prev.selectedIngredients,
            ...prev.selectedPantryStaples,
          ];

          // Add new ingredients (case-insensitive dedupe across merged list)
          const newIngredients = result.add.filter(
            (name) =>
              !allCurrentIngredients.some(
                (existing) => existing.toLowerCase() === name.toLowerCase()
              )
          );

          // Remove from both lists (case-insensitive match)
          // T033: Silently ignore removal of items not in list
          const updatedIngredients = prev.selectedIngredients.filter(
            (existing) =>
              !result.rm.some(
                (toRemove) => toRemove.toLowerCase() === existing.toLowerCase()
              )
          );

          const updatedPantryStaples = prev.selectedPantryStaples.filter(
            (existing) =>
              !result.rm.some(
                (toRemove) => toRemove.toLowerCase() === existing.toLowerCase()
              )
          );

          // Track voice-added ingredients (simplified to single list)
          const updatedVoiceAdded = prev.voiceAddedIngredients.filter(
            (name) =>
              !result.rm.some(
                (toRemove) => toRemove.toLowerCase() === name.toLowerCase()
              )
          );

          const newState = {
            ...prev,
            selectedIngredients: [...updatedIngredients, ...newIngredients],
            selectedPantryStaples: updatedPantryStaples,
            voiceAddedIngredients: [...updatedVoiceAdded, ...newIngredients],
            hasVoiceChanges: true,
          };

          // DEBUG: Log new state after update
          console.log("[onboarding] After update:", {
            updatedIngredients,
            updatedPantryStaples,
            newIngredients,
            finalSelectedIngredients: newState.selectedIngredients,
            finalSelectedPantryStaples: newState.selectedPantryStaples,
          });

          return newState;
        });

        // T030, T037: Show toast
        toast("Ingredient list has been updated");
      } catch (error) {
        console.error("[onboarding] Processing error:", error);

        if (error instanceof Error) {
          const isTimeout = error.message.startsWith("timeout:");
          const isParseFail = error.message.startsWith("parse:");

          if (isTimeout) {
            setErrorMessage(error.message.replace("timeout:", ""));
          } else if (isParseFail) {
            setErrorMessage(error.message.replace("parse:", ""));
          } else {
            setErrorMessage("Couldn't understand. Try again.");
          }
        } else {
          setErrorMessage("Something went wrong. Please try again.");
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [state.selectedIngredients, state.selectedPantryStaples]
  );

  // Continue to step 4
  const handleContinueToStep4 = () => {
    setState((prev) => ({ ...prev, currentStep: 4 }));
  };

  // Go back to step 3
  const handleBackToStep3 = () => {
    setState((prev) => ({ ...prev, currentStep: 3 }));
  };

  // Handler for recipe voice/text input
  const handleRecipeInput = async (
    input: { type: "voice"; audioBlob: Blob } | { type: "text"; text: string }
  ) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      let response: Response;

      if (input.type === "voice") {
        // Convert blob to base64
        const arrayBuffer = await input.audioBlob.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        response = await fetch("/api/onboarding/process-recipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioBase64: base64,
            trackedRecipes: state.recipes,
          }),
        });
      } else {
        response = await fetch("/api/onboarding/process-recipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: input.text,
            trackedRecipes: state.recipes,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to process recipe input");
      }

      interface RecipeInputResponse {
        recipes: OnboardingRecipe[];
        transcribedText?: string;
        assistantResponse?: string;
        noChangesDetected: boolean;
      }

      const result: RecipeInputResponse = await response.json();
      console.log("[onboarding] Recipe input processed:", result);

      // Update transcription if available
      if (result.transcribedText) {
        setLastTranscription(result.transcribedText);
      }

      // Handle no changes
      if (result.noChangesDetected) {
        toast("No recipe changes detected");
        return;
      }

      // Update tracked recipes
      setState((prev) => ({
        ...prev,
        recipes: result.recipes,
      }));

      // Show appropriate toast
      if (result.assistantResponse) {
        toast(result.assistantResponse);
      } else {
        toast("Recipes updated successfully");
      }
    } catch (error) {
      console.error("[onboarding] Recipe processing error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to process recipe input"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle ingredient toggle in recipes
  const handleIngredientToggle = (recipeId: string, ingredientId: string) => {
    setState((prev) => ({
      ...prev,
      recipes: prev.recipes.map((recipe) =>
        recipe.id === recipeId
          ? {
              ...recipe,
              ingredients: recipe.ingredients.map((ing) =>
                ing.id === ingredientId
                  ? {
                      ...ing,
                      type: ing.type === 'anchor' ? 'optional' : 'anchor',
                    }
                  : ing
              ),
            }
          : recipe
      ),
    }));
  };

  // T046: Complete setup with persistence
  const handleCompleteSetup = async () => {
    setState((prev) => ({ ...prev, currentStep: 5 }));
    const startTime = Date.now();

    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: state.selectedIngredients,
          pantryStaples: state.selectedPantryStaples,
          recipes: state.recipes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("[onboarding] Complete error:", errorData);
        toast.error("Some data may not have been saved");
      } else {
        const result = await response.json();
        console.log("[onboarding] Setup complete:", result);
      }
    } catch (error) {
      console.error("[onboarding] Complete failed:", error);
      toast.error("Some data may not have been saved");
    }

    // Ensure minimum 2.5-second display
    const elapsed = Date.now() - startTime;
    if (elapsed < 2500) {
      await new Promise((r) => setTimeout(r, 2500 - elapsed));
    }

    router.push("/app/inventory");
  };

  // Derived state
  const canProceedToStep3 =
    state.selectedIngredients.length >= 1 || state.selectedPantryStaples.length >= 1;
  const canCompleteSetup =
    state.selectedIngredients.length >= 1 || state.selectedPantryStaples.length >= 1;

  return (
    <PageContainer
      maxWidth="2xl"
      gradientFrom="from-pink-50"
      gradientVia="via-yellow-50"
      gradientTo="to-cyan-50"
    >
      {/* Progress indicator banner */}
      <div className="bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 border-4 md:border-6 border-black px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6">
        <p
          className="text-sm font-black uppercase text-center"
          role="status"
          aria-live="polite"
          aria-label={`Step ${state.currentStep} of ${state.currentStep === 5 ? 5 : 4}`}
        >
          {state.currentStep === 5 ? "Finishing up..." : `Step ${state.currentStep} of 4`}
        </p>
      </div>

      {/* Sliding transition container */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${(state.currentStep - 1) * 100}%)` }}
        >
          {/* Step 1 - Welcome Screen */}
          <div className="min-w-full p-4 md:p-8 flex flex-col items-center gap-6 text-center">
            <h1 className="text-3xl md:text-4xl font-black uppercase">Welcome to HomeCuistot!</h1>
            <p className="text-lg text-gray-700 max-w-md">
              Let&apos;s set up your kitchen profile in just a couple of steps.
            </p>
            <Button
              onClick={handleGetStarted}
              variant="default"
              size="lg"
              className="mt-4 min-h-[44px] min-w-[44px] cursor-pointer"
            >
              Get Started
            </Button>
          </div>

          {/* Step 2 - Skill + Ingredient Selection */}
          <div className="min-w-full p-4 md:p-8 flex flex-col gap-6 overflow-x-hidden relative">
            {/* Ingredients Section */}
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-black uppercase">
                What ingredients do you usually have?
              </h2>
              <p className="text-sm text-gray-600">Select all that apply</p>

              <div className="flex flex-wrap gap-2">
                {COMMON_INGREDIENTS.map((ingredient) => {
                  // Check if ingredient exists in either array (case-insensitive)
                  const isSelected =
                    state.selectedIngredients.some(
                      (n) => n.toLowerCase() === ingredient.name.toLowerCase()
                    ) ||
                    state.selectedPantryStaples.some(
                      (n) => n.toLowerCase() === ingredient.name.toLowerCase()
                    );

                  return (
                    <IngredientChip
                      key={ingredient.name}
                      name={ingredient.name}
                      selected={isSelected}
                      selectionColor="green"
                      onToggle={() => toggleIngredient(ingredient.name)}
                    />
                  );
                })}
                {/* Voice-added ingredients (not in predefined list) */}
                {state.selectedIngredients
                  .filter(
                    (name) =>
                      !COMMON_INGREDIENTS.some(
                        (ing) => ing.name.toLowerCase() === name.toLowerCase()
                      )
                  )
                  .map((name) => (
                    <IngredientChip
                      key={`voice-${name}`}
                      name={name}
                      selected={true}
                      selectionColor="green"
                      onToggle={() => toggleIngredient(name)}
                      variant="voice"
                    />
                  ))}
              </div>
            </div>

            {/* Pantry Staples Section */}
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-black uppercase">
                What ingredients do you always have at all times?
              </h2>
              <p className="text-sm text-gray-600">Select all that apply</p>

              <div className="flex flex-wrap gap-2">
                {PANTRY_STAPLES.map((ingredient) => {
                  // Check if ingredient exists in either array (case-insensitive)
                  const isSelected =
                    state.selectedIngredients.some(
                      (n) => n.toLowerCase() === ingredient.name.toLowerCase()
                    ) ||
                    state.selectedPantryStaples.some(
                      (n) => n.toLowerCase() === ingredient.name.toLowerCase()
                    );

                  return (
                    <IngredientChip
                      key={ingredient.name}
                      name={ingredient.name}
                      selected={isSelected}
                      selectionColor="blue"
                      onToggle={() => togglePantryStaple(ingredient.name)}
                    />
                  );
                })}
                {/* Voice-added pantry staples (not in predefined list) */}
                {state.selectedPantryStaples
                  .filter(
                    (name) =>
                      !PANTRY_STAPLES.some(
                        (ing) => ing.name.toLowerCase() === name.toLowerCase()
                      )
                  )
                  .map((name) => (
                    <IngredientChip
                      key={`voice-pantry-${name}`}
                      name={name}
                      selected={true}
                      selectionColor="blue"
                      onToggle={() => togglePantryStaple(name)}
                      variant="voice"
                    />
                  ))}
              </div>

              {canProceedToStep3 && (
                <p className="text-sm text-gray-500 italic animate-in fade-in duration-200">
                  No worries, you can add more ingredients in later steps!
                </p>
              )}

              {/* Legend for voice-added ingredients */}
              {(state.selectedIngredients.some(
                  (name) =>
                    !COMMON_INGREDIENTS.some(
                      (ing) => ing.name.toLowerCase() === name.toLowerCase()
                    )
                ) ||
                state.selectedPantryStaples.some(
                  (name) =>
                    !PANTRY_STAPLES.some(
                      (ing) => ing.name.toLowerCase() === name.toLowerCase()
                    )
                )) && (
                <p className="text-xs text-gray-500 mt-2 italic">
                  <span className="inline-block w-3 h-3 bg-cyan-300 border-2 border-black rounded mr-1" />
                  Added via voice/text in later steps
                </p>
              )}
            </div>

            {/* T020: Next Step button (enabled when skill + 1+ ingredients) */}
            <div className="flex justify-end mt-4">
              <Button
                onClick={handleContinueToStep3}
                disabled={!canProceedToStep3}
                variant="default"
                size="lg"
                className={`min-h-[44px] ${canProceedToStep3 ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
              >
                Next Step
              </Button>
            </div>
          </div>

          {/* Step 3 - Add More Ingredients */}
          <div className="min-w-full p-4 md:p-8 flex flex-col gap-6 overflow-x-hidden">
            {/* T023: Title */}
            <div>
              <h2 className="text-2xl md:text-3xl font-black uppercase">
                Add more ingredients
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Don&apos;t worry—everything can be modified later
              </p>
            </div>

            {/* T024: All ingredients display (merged view) */}
            <div className="md:rotate-1">
              <h3 className="text-lg font-black uppercase mb-2">All Ingredients</h3>
              {state.selectedIngredients.length === 0 && state.selectedPantryStaples.length === 0 ? (
                <p className="text-gray-500 italic">No ingredients selected</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {/* Merged list: all ingredients from both lists */}
                    {[...state.selectedIngredients, ...state.selectedPantryStaples].map((name) => {
                      const isVoiceAdded = state.voiceAddedIngredients.includes(name);
                      return (
                        <IngredientChip
                          key={name}
                          name={name}
                          readOnly
                          variant={isVoiceAdded ? "voice" : "default"}
                        />
                      );
                    })}
                  </div>
                  {/* Legend for visual differentiation */}
                  {state.voiceAddedIngredients.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2 italic">
                      <span className="inline-block w-3 h-3 bg-cyan-200 border border-cyan-500 rounded mr-1" />
                      Added following user instructions
                    </p>
                  )}
                </>
              )}
            </div>

            {/* T031, T034: Instructions with add/remove examples */}
            <InfoCard variant="cyan" emoji="💬" heading="Speak to update the list">
              <div className="space-y-1 text-sm">
                <p>&quot;Add sausage, mustard and ketchup&quot;</p>
                <p>&quot;Actually I ran out of steack, I do have chicken breast&quot;</p>
              </div>
            </InfoCard>

            {/* T028-T036: Voice/Text Input */}
            <VoiceTextInput
              onSubmit={handleVoiceTextSubmit}
              disabled={isProcessing}
              processing={isProcessing}
              textPlaceholder="Add eggs and butter, remove bacon..."
              lastTranscription={lastTranscription}
            />

            {/* Error message */}
            {errorMessage && (
              <div
                className="bg-red-100 border-2 border-red-500 p-3 rounded text-sm text-red-700 text-center"
                role="alert"
                aria-live="assertive"
              >
                {errorMessage}
              </div>
            )}

            {/* T025: Next Step button (enabled when 1+ ingredients) */}
            <div className="flex justify-end mt-6">
              <Button
                onClick={handleContinueToStep4}
                disabled={!canCompleteSetup}
                variant="default"
                size="lg"
                className={`min-h-[44px] ${canCompleteSetup ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
              >
                Next Step
              </Button>
            </div>

            {!canCompleteSetup && (
              <p className="text-sm text-gray-500 text-center" role="status" aria-live="polite">
                Add at least one ingredient or pantry staple to continue
              </p>
            )}
          </div>

          {/* Step 4 - Recipe Preferences */}
          <div className="min-w-full p-4 md:p-8 flex flex-col gap-6 overflow-x-hidden">
            <div>
              <h2 className="text-2xl md:text-3xl font-black uppercase">
                What kind of recipes do you usually make at home?
              </h2>
            </div>

            {/* Instructions with recipe examples */}
            <InfoCard variant="cyan" emoji="💬" heading="Describe 2-3 recipes you regularly cook">
              <div className="space-y-3">
                <p className="text-sm">&quot;I make scrambled eggs with eggs and butter. Sometimes I add black pepper.&quot;</p>
                <div className="max-w-sm">
                  <OnboardingRecipeCard
                    name="Scrambled Eggs"
                    description="Simple and fluffy eggs cooked in a pan, perfect for breakfast."
                    ingredients={[
                      { id: 'ing-1', name: 'Eggs', type: 'anchor' },
                      { id: 'ing-2', name: 'Butter', type: 'anchor' },
                      { id: 'ing-3', name: 'Black Pepper', type: 'optional' },
                    ]}
                  />
                </div>
                <p className="text-sm">&quot;Actually, I sometimes use chives and I always use black pepper.&quot;</p>
                <div className="max-w-sm">
                  <OnboardingRecipeCard
                    name="Scrambled Eggs"
                    description="Simple and fluffy eggs cooked in a pan, perfect for breakfast."
                    ingredients={[
                      { id: 'ing-1', name: 'Eggs', type: 'anchor' },
                      { id: 'ing-2', name: 'Butter', type: 'anchor' },
                      { id: 'ing-3', name: 'Black Pepper', type: 'optional' },
                      { id: 'ing-4', name: 'Chive', type: 'optional' },
                    ]}
                  />
                </div>
              </div>
            </InfoCard>

            {/* User's added recipes display */}
            <div className="md:rotate-1">
              <h3 className="text-lg font-black uppercase mb-2">All the recipes you told me about</h3>
              {state.recipes.length === 0 ? (
                <p className="text-gray-500 italic">No recipes added yet</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {state.recipes.map((recipe) => (
                    <OnboardingRecipeCard
                      key={recipe.id}
                      name={recipe.name}
                      description={recipe.description}
                      ingredients={recipe.ingredients}
                      onIngredientToggle={(ingredientId) =>
                        handleIngredientToggle(recipe.id, ingredientId)
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Voice/Text Input */}
            <VoiceTextInput
              onSubmit={handleRecipeInput}
              disabled={isProcessing}
              processing={isProcessing}
              textPlaceholder="Describe the recipes you make..."
            />

            {/* Error message */}
            {errorMessage && (
              <div
                className="bg-red-100 border-2 border-red-500 p-3 rounded text-sm text-red-700 text-center"
                role="alert"
                aria-live="assertive"
              >
                {errorMessage}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-6 gap-4">
              <Button
                onClick={handleBackToStep3}
                variant="outline"
                size="lg"
                className="min-h-[44px] cursor-pointer"
              >
                Back
              </Button>
              <Button
                onClick={handleCompleteSetup}
                disabled={state.recipes.length === 0}
                variant="default"
                size="lg"
                className={`min-h-[44px] ${state.recipes.length > 0 ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
              >
                Complete Setup
              </Button>
            </div>

            {state.recipes.length === 0 && (
              <p className="text-sm text-gray-500 text-center" role="status" aria-live="polite">
                Add at least one recipe to complete setup
              </p>
            )}
          </div>

          {/* Step 5 - Completion Screen */}
          <div className="min-w-full p-4 md:p-8 flex flex-col items-center justify-center gap-6 min-h-[400px]">
            <h2 className="text-3xl md:text-4xl font-black uppercase text-center">Congrats!</h2>
            <p className="text-lg text-gray-700 text-center max-w-md">
              We&apos;re preparing your Home cook gears, one moment please.
            </p>
            <div className="flex gap-4 mt-4">
              <div
                className="w-12 h-12 bg-pink-400 border-4 border-black rotate-12 animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-12 h-12 bg-yellow-400 border-4 border-black -rotate-12 animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-12 h-12 bg-cyan-400 border-4 border-black rotate-6 animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-4" role="status" aria-live="polite">
              <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
              Saving your preferences...
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
