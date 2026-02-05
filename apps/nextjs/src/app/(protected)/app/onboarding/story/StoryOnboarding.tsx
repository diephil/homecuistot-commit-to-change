"use client";

import { useState } from "react";
import { useStoryState } from "./hooks/useStoryState";
import { useFadeTransition } from "./hooks/useFadeTransition";
import { StoryProgressBar } from "./StoryProgressBar";
import { Scene1Dilemma } from "./scenes/Scene1Dilemma";
import { Scene2RecipeVoice } from "./scenes/Scene2RecipeVoice";
import { Scene3StoreKitchen } from "./scenes/Scene3StoreKitchen";
import { Scene4Voice } from "./scenes/Scene4Voice";
import { Scene5Ready } from "./scenes/Scene5Ready";
import { Scene6Cooked } from "./scenes/Scene6Cooked";
import { Scene7YourRecipes } from "./scenes/Scene7YourRecipes";
import { Scene8Manifesto } from "./scenes/Scene8Manifesto";
import type { StoryOnboardingState, DemoInventoryItem } from "@/lib/story-onboarding/types";
import type { QuantityLevel } from "@/types/inventory";

export function StoryOnboarding() {
  const { state, hydrated, goToScene, updateInventory, updateDemoRecipe, setDemoRecipes, reset } = useStoryState();
  const { className: fadeClassName, triggerTransition } = useFadeTransition();
  const [preDecrementInventory, setPreDecrementInventory] = useState<DemoInventoryItem[]>([]);

  const handleNavigate = (scene: StoryOnboardingState["currentScene"]) => {
    triggerTransition(() => {
      goToScene(scene);
      window.scrollTo({ top: 0 });
    });
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
          <Scene7YourRecipes
            userRecipes={state.demoRecipes}
            onSetUserRecipes={setDemoRecipes}
            onContinue={() => handleNavigate(8)}
          />
        )}
        {state.currentScene === 8 && (
          <Scene8Manifesto
            inventory={state.demoInventory}
            demoRecipes={state.demoRecipes}
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
