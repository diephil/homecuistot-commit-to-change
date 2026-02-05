"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStoryState } from "./hooks/useStoryState";
import { useFadeTransition } from "./hooks/useFadeTransition";
import { StoryProgressBar } from "./StoryProgressBar";
import { Scene1Dilemma } from "./scenes/Scene1Dilemma";
import { Scene2RecipeVoice } from "./scenes/Scene2RecipeVoice";
import { Scene3StoreKitchen } from "./scenes/Scene3StoreKitchen";
import { Scene4Voice } from "./scenes/Scene4Voice";
import { Scene5Ready } from "./scenes/Scene5Ready";
import { Scene6Cooked } from "./scenes/Scene6Cooked";
import { Scene8YourRecipes } from "./scenes/Scene8YourRecipes";
import { Scene7Manifesto } from "./scenes/Scene7Manifesto";
import { LOCALSTORAGE_KEY, COMPLETION_FLAG_KEY } from "@/lib/story-onboarding/constants";
import type { StoryOnboardingState, DemoInventoryItem } from "@/lib/story-onboarding/types";
import type { QuantityLevel } from "@/types/inventory";

export function StoryOnboarding() {
  const router = useRouter();
  const { state, hydrated, goToScene, updateInventory, updateDemoRecipe, setDemoRecipes, reset } = useStoryState();
  const { className: fadeClassName, triggerTransition } = useFadeTransition();
  const [preDecrementInventory, setPreDecrementInventory] = useState<DemoInventoryItem[]>([]);
  const [completingOnboarding, setCompletingOnboarding] = useState(false);

  const handleNavigate = (scene: StoryOnboardingState["currentScene"]) => {
    triggerTransition(() => {
      goToScene(scene);
      window.scrollTo({ top: 0 });
    });
  };

  // Scene 8: Complete onboarding and redirect to app
  const handleCompleteOnboarding = async () => {
    setCompletingOnboarding(true);

    try {
      // demoRecipes contains user recipes from scene 8
      const payload = {
        ingredients: state.demoInventory
          .filter((i) => !i.isPantryStaple)
          .map((i) => ({ name: i.name, quantityLevel: i.quantityLevel })),
        pantryStaples: state.demoInventory
          .filter((i) => i.isPantryStaple)
          .map((i) => ({ name: i.name, quantityLevel: i.quantityLevel })),
        recipes: state.demoRecipes.map((r) => ({
          name: r.name,
          description: r.description,
          ingredients: r.ingredients,
        })),
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

      router.push("/app");
    } catch (err) {
      console.error("Onboarding completion failed:", err);
      setCompletingOnboarding(false);
      // Error will be visible in console, user can retry
    }
  };

  // Scene 5 → 6: "I made this" applies decrement logic
  const handleMarkAsCooked = () => {
    // Save pre-decrement snapshot for Scene 6 display
    setPreDecrementInventory(state.demoInventory.map((item) => ({ ...item })));

    // Apply decrement: non-staple recipe ingredients lose 1 level (floor at 0)
    const recipeIngredientNames = new Set(
      state.demoRecipe.ingredients.map((ing) => ing.name.toLowerCase()),
    );

    const decremented = state.demoInventory.map((item) => {
      if (!item.isPantryStaple && recipeIngredientNames.has(item.name.toLowerCase())) {
        return {
          ...item,
          quantityLevel: Math.max(0, item.quantityLevel - 1) as QuantityLevel,
          isNew: undefined,
        };
      }
      return { ...item, isNew: undefined };
    });

    updateInventory(decremented);
    handleNavigate(6);
  };

  // Wait for localStorage hydration before rendering
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Loading screen during onboarding completion
  if (completingOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6 text-center px-6">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-2xl font-black">Setting up your kitchen...</h2>
          <p className="text-base font-semibold text-black/70 leading-relaxed">
            We&apos;re adding your ingredients and recipes to your account so
            you can start cooking right away.
          </p>
          <p className="text-sm text-black/50">
            You can always add more recipes by voice anytime, and update or
            remove items from your inventory later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <StoryProgressBar currentScene={state.currentScene} />

      <div className={fadeClassName}>
        {state.currentScene === 1 && (
          <Scene1Dilemma onContinue={() => handleNavigate(2)} />
        )}
        {state.currentScene === 2 && (
          <Scene2RecipeVoice
            onUpdateDemoRecipe={updateDemoRecipe}
            onContinue={() => handleNavigate(3)}
          />
        )}
        {state.currentScene === 3 && (
          <Scene3StoreKitchen
            onContinue={() => handleNavigate(4)}
          />
        )}
        {state.currentScene === 4 && (
          <Scene4Voice
            inventory={state.demoInventory}
            onUpdateInventory={updateInventory}
            onContinue={() => handleNavigate(5)}
          />
        )}
        {state.currentScene === 5 && (
          <Scene5Ready
            inventory={state.demoInventory}
            onContinue={handleMarkAsCooked}
          />
        )}
        {state.currentScene === 6 && (
          <Scene6Cooked
            preDecrementInventory={preDecrementInventory}
            postDecrementInventory={state.demoInventory}
            onContinue={() => handleNavigate(7)}
          />
        )}
        {state.currentScene === 7 && (
          <Scene7Manifesto
            inventory={state.demoInventory}
            demoRecipes={state.demoRecipes}
            onContinue={() => handleNavigate(8)}
          />
        )}
        {state.currentScene === 8 && (
          <Scene8YourRecipes
            userRecipes={state.demoRecipes}
            onSetUserRecipes={setDemoRecipes}
            onContinue={handleCompleteOnboarding}
            onRestart={() => {
              reset();
              handleNavigate(1);
            }}
          />
        )}
      </div>
    </div>
  );
}
