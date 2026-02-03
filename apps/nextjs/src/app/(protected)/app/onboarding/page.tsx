"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { InfoCard } from "@/components/shared/InfoCard";
import { PageContainer } from "@/components/PageContainer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loader2, HelpCircle } from "lucide-react";
import { IngredientChip, VoiceTextInput, HelpModal, HelpSection } from "@/components/shared";
import { COMMON_INGREDIENTS } from "@/constants/onboarding";
import { toast } from "sonner";
import type { IngredientExtractionResponse } from "@/types/onboarding";

/**
 * Voice-Enabled Kitchen Onboarding Flow (Revamped)
 * Spec: specs/019-onboarding-revamp/spec.md
 * Tasks: T013-T051
 */

interface OnboardingState {
  currentStep: 1 | 2 | 3 | 4;
  selectedIngredients: string[];
  voiceAddedIngredients: string[]; // Track ingredients added via voice/text in Step 3
  hasVoiceChanges: boolean;
}

const initialState: OnboardingState = {
  currentStep: 1,
  selectedIngredients: [],
  voiceAddedIngredients: [],
  hasVoiceChanges: false,
};

function OnboardingPageContent() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>(initialState);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [lastTranscription, setLastTranscription] = useState<string | undefined>();

  // T009: Advance to step 2
  const handleGetStarted = () => {
    setState((prev) => ({ ...prev, currentStep: 2 }));
  };

  // T019: Toggle ingredient selection
  const toggleIngredient = (name: string) => {
    setState((prev) => {
      const isSelected = prev.selectedIngredients.includes(name);
      return {
        ...prev,
        selectedIngredients: isSelected
          ? prev.selectedIngredients.filter((n) => n !== name)
          : [...prev.selectedIngredients, name],
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

        // Update transcription if available
        if (result.transcribedText) {
          setLastTranscription(result.transcribedText);
        }

        // T048: Handle empty response
        if (result.add.length === 0 && result.rm.length === 0) {
          toast("No updates were detected");
          return;
        }

        // Apply updates
        setState((prev) => {
          // Add new ingredients (case-insensitive dedupe)
          const newIngredients = result.add.filter(
            (name) =>
              !prev.selectedIngredients.some(
                (existing) => existing.toLowerCase() === name.toLowerCase()
              )
          );

          // Remove ingredients (case-insensitive match)
          // T033: Silently ignore removal of items not in list
          const updatedIngredients = prev.selectedIngredients.filter(
            (existing) =>
              !result.rm.some(
                (toRemove) => toRemove.toLowerCase() === existing.toLowerCase()
              )
          );

          // Track newly voice-added ingredients, remove voice-tracked ones that got removed
          const updatedVoiceAdded = prev.voiceAddedIngredients.filter(
            (name) =>
              !result.rm.some(
                (toRemove) => toRemove.toLowerCase() === name.toLowerCase()
              )
          );

          return {
            ...prev,
            selectedIngredients: [...updatedIngredients, ...newIngredients],
            voiceAddedIngredients: [...updatedVoiceAdded, ...newIngredients],
            hasVoiceChanges: true,
          };
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
    [state.selectedIngredients]
  );

  // T022: Go back to step 2
  const handleBackToStep2 = () => {
    setState((prev) => ({ ...prev, currentStep: 2 }));
  };

  // T046: Complete setup with persistence
  const handleCompleteSetup = async () => {
    setState((prev) => ({ ...prev, currentStep: 4 }));
    const startTime = Date.now();

    try {
      const response = await fetch("/api/onboarding/persist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: state.selectedIngredients,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("[onboarding] Persist error:", errorData);
      }
    } catch (error) {
      console.error("[onboarding] Persist failed:", error);
    }

    // Ensure minimum 2.5-second display
    const elapsed = Date.now() - startTime;
    if (elapsed < 2500) {
      await new Promise((r) => setTimeout(r, 2500 - elapsed));
    }

    router.push("/app/inventory");
  };

  // Derived state
  const canProceedToStep3 = state.selectedIngredients.length >= 1;
  const canCompleteSetup = state.selectedIngredients.length >= 1;

  return (
    <PageContainer
      maxWidth="2xl"
      gradientFrom="from-pink-50"
      gradientVia="via-yellow-50"
      gradientTo="to-cyan-50"
    >
      {/* FR-041-043: Help modal rendered outside transform container */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} title="Your initial selection">
        {/* <HelpSection emoji="🍳" title="Basic" bgColor="bg-yellow-100">
          <p className="text-sm">
            We&apos;ll seed your account with <strong>8 simple recipes</strong> that are
            quick and easy to prepare.
          </p>
        </HelpSection>

        <HelpSection emoji="👨‍🍳" title="Advanced" bgColor="bg-cyan-100">
          <p className="text-sm">
            We&apos;ll seed your account with <strong>16 recipes</strong>, including
            more complex dishes that take a bit more time and technique.
          </p>
        </HelpSection> */}

        <HelpSection emoji="✨" title="Don't Worry!" bgColor="bg-pink-100">
          <p className="text-sm">
            <strong>Everything can be changed later.</strong> You can still manage everything after the onboarding is complete. There&apos;s no wrong choice here!
          </p>
        </HelpSection>
      </HelpModal>

      {/* Progress indicator banner */}
      <div className="bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 border-4 md:border-6 border-black px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6">
        <p
          className="text-sm font-black uppercase text-center"
          role="status"
          aria-live="polite"
          aria-label={`Step ${state.currentStep} of ${state.currentStep === 4 ? 4 : 3}`}
        >
          {state.currentStep === 4 ? "Finishing up..." : `Step ${state.currentStep} of 3`}
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
            {/* FR-041: Help button (top-right, Step 2 only) */}
            <button
              onClick={() => setIsHelpOpen(true)}
              className="absolute top-4 right-4 border-4 border-black bg-yellow-300 p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px] cursor-pointer hover:bg-yellow-400"
              aria-label="Open help"
            >
              <HelpCircle className="h-6 w-6 stroke-[3px]" />
            </button>

            {/* Ingredients Section */}
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-black uppercase pr-16 md:pr-0">
                What ingredients do you usually have?
              </h2>
              <p className="text-sm text-gray-600">Select all that apply</p>

              <div className="flex flex-wrap gap-2">
                {COMMON_INGREDIENTS.map((ingredient) => (
                  <IngredientChip
                    key={ingredient.name}
                    name={ingredient.name}
                    selected={state.selectedIngredients.includes(ingredient.name)}
                    onToggle={() => toggleIngredient(ingredient.name)}
                  />
                ))}
              </div>

              {canProceedToStep3 && (
                <p className="text-sm text-gray-500 italic animate-in fade-in duration-200">
                  No worries, you can add more ingredients in later steps!
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

            {/* T024: Step 2 ingredients as read-only display */}
            <div className="md:rotate-1">
              <h3 className="text-lg font-black uppercase mb-2">Your ingredients</h3>
              {state.selectedIngredients.length === 0 ? (
                <p className="text-gray-500 italic">No ingredients selected</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {state.selectedIngredients.map((name) => {
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
                <p>&quot;Add eggs, butter, and mushrooms&quot;</p>
                <p>&quot;I ran out of mushrooms, remove it&quot;</p>
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

            {/* T025: Complete Setup button (enabled when 1+ ingredients) */}
            <div className="flex justify-between items-center mt-6 gap-4">
              <Button
                onClick={handleBackToStep2}
                variant="outline"
                size="lg"
                className="min-h-[44px] cursor-pointer"
              >
                Back
              </Button>
              <Button
                onClick={handleCompleteSetup}
                disabled={!canCompleteSetup}
                variant="default"
                size="lg"
                className={`min-h-[44px] ${canCompleteSetup ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
              >
                Complete Setup
              </Button>
            </div>

            {!canCompleteSetup && (
              <p className="text-sm text-gray-500 text-center" role="status" aria-live="polite">
                Add at least one ingredient to continue
              </p>
            )}
          </div>

          {/* Step 4 - Completion Screen */}
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

export default function OnboardingPage() {
  return (
    <ErrorBoundary>
      <OnboardingPageContent />
    </ErrorBoundary>
  );
}
