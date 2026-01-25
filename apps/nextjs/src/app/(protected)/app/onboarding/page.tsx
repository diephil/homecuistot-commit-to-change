"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/retroui/Badge";
import { Button } from "@/components/retroui/Button";
import { PageContainer } from "@/components/PageContainer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Mic, Loader2 } from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { SUGGESTED_ITEMS } from "@/constants/onboarding";
import type { OnboardingState, OnboardingUpdate } from "@/types/onboarding";
import { initialOnboardingState } from "@/types/onboarding";

/**
 * Voice-Enabled Kitchen Onboarding Flow
 * Spec: specs/004-onboarding-flow/spec.md
 * Tasks: T007-T067 (Phases 3-9)
 */

function OnboardingPageContent() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>(initialOnboardingState);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');

  const {
    state: voiceState,
    duration,
    error: voiceError,
    permissionDenied,
    start,
    stop,
    consumeAudio,
  } = useVoiceInput();

  // Track if we're waiting for audio to be ready after stop
  const pendingProcessRef = useRef(false);

  // T037-T039: Handle microphone permission denied
  useEffect(() => {
    if (permissionDenied) {
      setInputMode('text');
    }
  }, [permissionDenied]);

  // Process audio when voice state transitions to 'stopped'
  useEffect(() => {
    if (voiceState === "stopped" && pendingProcessRef.current) {
      pendingProcessRef.current = false;
      const blob = consumeAudio();
      if (blob) {
        processAudioBlob(blob);
      }
    }
  }, [voiceState, consumeAudio]);

  // T009: Advance to step 2
  const handleGetStarted = () => {
    setState((prev) => ({ ...prev, currentStep: 2 }));
  };

  // T010: Skip to suggestions
  const handleSkipSetup = () => {
    router.push("/app/suggestions");
  };

  // T017: Toggle badge selection
  const toggleItem = (item: string, category: "dishes" | "fridge" | "pantry") => {
    setState((prev) => {
      const currentList = prev[category];
      const isSelected = currentList.includes(item);

      return {
        ...prev,
        [category]: isSelected
          ? currentList.filter((i) => i !== item)
          : [...currentList, item],
      };
    });
  };

  // T018: Clear all selections
  const handleClearAll = () => {
    setState((prev) => ({
      ...prev,
      dishes: [],
      fridge: [],
      pantry: [],
    }));
  };

  // T019-T020: Continue to step 3, merge fridge+pantry
  const handleContinueToStep3 = () => {
    setState((prev) => ({
      ...prev,
      currentStep: 3,
      ingredients: [...prev.fridge, ...prev.pantry],
    }));
  };

  // Handle recording start
  const handleRecordStart = useCallback(() => {
    if (isProcessing) return;
    setErrorMessage(null);
    start();
  }, [isProcessing, start]);

  // Handle recording stop - mark pending process
  const handleRecordStop = useCallback(() => {
    if (voiceState === "recording") {
      pendingProcessRef.current = true;
      stop();
    }
  }, [voiceState, stop]);

  // Process audio blob
  const processAudioBlob = async (blob: Blob) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Convert blob to base64
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      // T048: 15s timeout enforced by API maxDuration
      const response = await fetch("/api/onboarding/process-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioBase64: base64,
          text: undefined,
          currentContext: {
            dishes: state.dishes,
            ingredients: state.ingredients,
          },
        }),
      });

      // T049-T051: Enhanced error handling with specific messages
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

      const result: OnboardingUpdate = await response.json();

      // T030: Apply voice update
      applyOnboardingUpdate(result);

      // T035: Reset failure count on success
      setState((prev) => ({ ...prev, voiceFailureCount: 0 }));

    } catch (error) {
      console.error("[onboarding] Voice processing error:", error);
      handleProcessingError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // T028: Process text input
  const handleProcessText = async () => {
    if (!textInput.trim() || isProcessing) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/onboarding/process-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textInput.trim(),
          currentContext: {
            dishes: state.dishes,
            ingredients: state.ingredients,
          },
        }),
      });

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

      const result: OnboardingUpdate = await response.json();
      applyOnboardingUpdate(result);
      setState((prev) => ({ ...prev, voiceFailureCount: 0 }));
      setTextInput("");

    } catch (error) {
      console.error("[onboarding] Text processing error:", error);
      handleProcessingError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle processing errors
  const handleProcessingError = (error: unknown) => {
    const isTimeout = error instanceof Error && error.message.startsWith("timeout:");
    const isParseFail = error instanceof Error && error.message.startsWith("parse:");

    // T040-T042: Voice failure tracking
    setState((prev) => {
      const newCount = prev.voiceFailureCount + 1;
      return {
        ...prev,
        voiceFailureCount: newCount,
      };
    });

    // T049-T050: Display appropriate error messages
    if (error instanceof Error) {
      if (isTimeout) {
        setErrorMessage(error.message.replace("timeout:", ""));
      } else if (isParseFail) {
        setErrorMessage(error.message.replace("parse:", ""));
      } else if (state.voiceFailureCount === 0) {
        setErrorMessage("Couldn't understand. Try again.");
      } else if (state.voiceFailureCount === 1) {
        setErrorMessage("Still having trouble. Would you like to type instead?");
      } else {
        setErrorMessage("Please use text input below.");
      }
    } else {
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  // T030-T032: Apply onboarding update with duplicate detection
  const applyOnboardingUpdate = (update: OnboardingUpdate) => {
    setState((prev) => {
      // T031: Duplicate detection (case-insensitive)
      const newDishes = update.add.dishes.filter(
        (dish) =>
          !prev.dishes.some((existing) => existing.toLowerCase() === dish.toLowerCase())
      );
      const newIngredients = update.add.ingredients.filter(
        (ingredient) =>
          !prev.ingredients.some(
            (existing) => existing.toLowerCase() === ingredient.toLowerCase()
          )
      );

      // T032: Log duplicates
      const duplicates = [
        ...update.add.dishes.filter((dish) =>
          prev.dishes.some((existing) => existing.toLowerCase() === dish.toLowerCase())
        ),
        ...update.add.ingredients.filter((ingredient) =>
          prev.ingredients.some(
            (existing) => existing.toLowerCase() === ingredient.toLowerCase()
          )
        ),
      ];

      if (duplicates.length > 0) {
        console.log(`Duplicates detected: ${duplicates.join(", ")}`);
      }

      // Remove items (case-insensitive)
      const updatedDishes = prev.dishes.filter(
        (dish) =>
          !update.remove.dishes.some(
            (remove) => remove.toLowerCase() === dish.toLowerCase()
          )
      );
      const updatedIngredients = prev.ingredients.filter(
        (ingredient) =>
          !update.remove.ingredients.some(
            (remove) => remove.toLowerCase() === ingredient.toLowerCase()
          )
      );

      // T033: Mark has voice changes
      const hasChanges =
        newDishes.length > 0 ||
        newIngredients.length > 0 ||
        update.remove.dishes.length > 0 ||
        update.remove.ingredients.length > 0;

      return {
        ...prev,
        dishes: [...updatedDishes, ...newDishes],
        ingredients: [...updatedIngredients, ...newIngredients],
        hasVoiceChanges: hasChanges || prev.hasVoiceChanges,
      };
    });
  };

  // T062-T064: Complete setup (enabled only after voice changes)
  const handleCompleteSetup = () => {
    router.push("/app/suggestions");
  };

  // T065: Format recording duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Derived state for UI
  const isRecording = voiceState === "recording";
  const showRecordingUI = isRecording && !isProcessing;

  return (
    <PageContainer
      maxWidth="2xl"
      gradientFrom="from-pink-50"
      gradientVia="via-yellow-50"
      gradientTo="to-cyan-50"
    >
      {/* T054-T061: Neobrutalism design system */}
      <div className="border-4 md:border-6 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        {/* T011: Progress indicator with T068 ARIA label */}
        <div className="bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 border-b-4 md:border-b-6 border-black px-6 py-3">
          <p className="text-sm font-black uppercase text-center" role="status" aria-live="polite" aria-label={`Step ${state.currentStep} of 3`}>
            Step {state.currentStep} of 3
          </p>
        </div>

        {/* T065: Sliding transition */}
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${(state.currentStep - 1) * 100}%)` }}
        >
          {/* T007-T011: Step 1 - Welcome Screen */}
          <div className="min-w-full p-8 flex flex-col items-center gap-6 text-center">
            <h1 className="text-3xl md:text-4xl font-black uppercase">
              Welcome to HomeCuistot!
            </h1>
            <p className="text-lg text-gray-700 max-w-md">
              Let&apos;s set up your kitchen profile. This helps us suggest recipes
              based on what you have and what you like to cook.
            </p>

            {/* T009: Get Started button */}
            <Button
              onClick={handleGetStarted}
              variant="default"
              size="lg"
              className="mt-4 min-h-[44px] min-w-[44px]"
            >
              Get Started
            </Button>

            {/* T010: Skip Setup link */}
            <button
              onClick={handleSkipSetup}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Skip Setup
            </button>
          </div>

          {/* T012-T020: Step 2 - Badge Selection */}
          <div className="min-w-full p-8 flex flex-col gap-6 overflow-x-hidden">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl md:text-3xl font-black uppercase">
                What do you have?
              </h2>
              {/* T018: Clear All button */}
              <Button onClick={handleClearAll} variant="outline" size="sm">
                Clear All
              </Button>
            </div>

            {/* T014: Dishes section */}
            <div className="space-y-3 md:rotate-1 md:origin-top-left">
              <h3 className="text-lg font-black uppercase">Dishes You Can Cook</h3>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_ITEMS.dishes.map((dish) => (
                  <Badge
                    key={dish.id}
                    variant={state.dishes.includes(dish.name) ? "solid" : "outline"}
                    className="cursor-pointer min-h-[44px] min-w-[44px] border-4 md:border-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                    onClick={() => toggleItem(dish.name, "dishes")}
                  >
                    {dish.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* T015: Fridge section */}
            <div className="space-y-3 md:-rotate-1">
              <h3 className="text-lg font-black uppercase">Fridge Items</h3>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_ITEMS.fridgeItems.map((item) => (
                  <Badge
                    key={item.id}
                    variant={state.fridge.includes(item.name) ? "solid" : "outline"}
                    className="cursor-pointer min-h-[44px] min-w-[44px] border-4 md:border-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                    onClick={() => toggleItem(item.name, "fridge")}
                  >
                    {item.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* T016: Pantry section */}
            <div className="space-y-3 md:rotate-1">
              <h3 className="text-lg font-black uppercase">Pantry Items</h3>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_ITEMS.pantryItems.map((item) => (
                  <Badge
                    key={item.id}
                    variant={state.pantry.includes(item.name) ? "solid" : "outline"}
                    className="cursor-pointer min-h-[44px] min-w-[44px] border-4 md:border-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                    onClick={() => toggleItem(item.name, "pantry")}
                  >
                    {item.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* T019: Continue button (no back button - forward-only) */}
            <div className="flex justify-end mt-4">
              <Button
                onClick={handleContinueToStep3}
                variant="default"
                size="lg"
                className="min-h-[44px]"
              >
                Continue
              </Button>
            </div>
          </div>

          {/* T021-T047: Step 3 - Voice Input & Review */}
          <div className="min-w-full p-8 flex flex-col gap-6 overflow-x-hidden">
            <h2 className="text-2xl md:text-3xl font-black uppercase text-center">
              Review & Refine
            </h2>

            {/* T021: Display current selections */}
            <div className="space-y-4">
              <div className="md:-rotate-1">
                <h3 className="text-lg font-black uppercase mb-2">Your Dishes</h3>
                {state.dishes.length === 0 ? (
                  <p className="text-gray-500 italic">No dishes selected</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {state.dishes.map((dish, idx) => (
                      <Badge key={idx} variant="solid" className="border-4 md:border-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {dish}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:rotate-1">
                <h3 className="text-lg font-black uppercase mb-2">Your Ingredients</h3>
                {state.ingredients.length === 0 ? (
                  <p className="text-gray-500 italic">No ingredients selected</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {state.ingredients.map((ingredient, idx) => (
                      <Badge key={idx} variant="solid" className="border-4 md:border-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* T022-T029: Voice input button (if permission not denied and voice mode active) */}
            {inputMode === 'voice' && !permissionDenied && (
              <div className="flex flex-col items-center gap-4 mt-6">
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="text-sm font-bold text-gray-700">
                    Hold the button and speak naturally
                  </p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>💬 &quot;I know how to make fried rice and a peanut butter sandwich. I also have rice, chicken, and cream.&quot;</p>
                    <p>💬 &quot;I can cook scrambled eggs and pasta carbonara. I have eggs, milk, and bacon, and... oh no... I ran out of bacon!&quot;</p>
                  </div>
                </div>

                {/* T022-T024: Hold-to-speak button */}
                <button
                  onMouseDown={handleRecordStart}
                  onMouseUp={handleRecordStop}
                  onTouchStart={handleRecordStart}
                  onTouchEnd={handleRecordStop}
                  disabled={isProcessing}
                  className={`
                    relative rounded-full p-6 min-h-[80px] min-w-[80px]
                    border-4 md:border-6 border-black bg-pink-400
                    shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                    hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]
                    active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
                    transition-all
                    ${showRecordingUI ? "animate-pulse ring-4 ring-red-500" : ""}
                    ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  {isProcessing ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}

                  {/* T024: Recording duration display */}
                  {showRecordingUI && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-bold bg-red-500 text-white px-2 py-1 rounded">
                      {formatDuration(duration)}
                    </span>
                  )}
                </button>

                {/* T068: ARIA live regions for status updates */}
                {showRecordingUI && (
                  <p className="text-sm font-bold text-red-600" role="status" aria-live="polite">
                    Recording...
                  </p>
                )}
                {isProcessing && (
                  <p className="text-sm font-bold text-blue-600" role="status" aria-live="polite">
                    Processing...
                  </p>
                )}

                {/* Toggle to text input */}
                <button
                  onClick={() => setInputMode('text')}
                  className="text-sm text-gray-600 hover:text-gray-900 underline mt-2"
                >
                  Prefer to type instead?
                </button>
              </div>
            )}

            {/* T039-T042: Error messages with T068 ARIA live region */}
            {errorMessage && (
              <div
                className="bg-red-100 border-2 border-red-500 p-3 rounded text-sm text-red-700 text-center"
                role="alert"
                aria-live="assertive"
              >
                {errorMessage}
              </div>
            )}

            {/* T036-T047: Text input */}
            {(inputMode === 'text' || permissionDenied) && (
              <div className="space-y-3">
                {/* Toggle back to voice (if permission granted) */}
                {!permissionDenied && (
                  <div className="text-center">
                    <button
                      onClick={() => setInputMode('voice')}
                      className="text-sm text-gray-600 hover:text-gray-900 underline"
                    >
                      Use voice instead?
                    </button>
                  </div>
                )}

                {permissionDenied && (
                  <p className="text-sm text-gray-600 text-center">
                    Microphone access denied. Please use text input below.
                  </p>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isProcessing) {
                        handleProcessText();
                      }
                    }}
                    placeholder="Add eggs and butter"
                    className="flex-1 px-4 py-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-pink-500 min-h-[44px]"
                    disabled={isProcessing}
                  />
                  <Button
                    onClick={handleProcessText}
                    disabled={isProcessing || !textInput.trim()}
                    className="min-h-[44px]"
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
                  </Button>
                </div>
              </div>
            )}

            {/* T062-T064: Complete Setup button */}
            <div className="flex justify-end mt-6">
              <Button
                onClick={handleCompleteSetup}
                disabled={state.dishes.length < 1 || state.ingredients.length < 1}
                variant="default"
                size="lg"
                className="min-h-[44px]"
              >
                Complete Setup
              </Button>
            </div>

            {/* T068: ARIA live region for completion status */}
            {(state.dishes.length < 1 || state.ingredients.length < 1) && (
              <p className="text-sm text-gray-500 text-center" role="status" aria-live="polite">
                Add at least one dish and one ingredient to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

/**
 * T052: Wrapped with ErrorBoundary for unexpected React errors
 */
export default function OnboardingPage() {
  return (
    <ErrorBoundary>
      <OnboardingPageContent />
    </ErrorBoundary>
  );
}
