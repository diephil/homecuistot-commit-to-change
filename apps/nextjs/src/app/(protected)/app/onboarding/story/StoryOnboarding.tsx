"use client";

import { useState } from "react";
import { useStoryState } from "./hooks/useStoryState";
import { useFadeTransition } from "./hooks/useFadeTransition";
import { StoryProgressBar } from "./StoryProgressBar";
import { Scene1Dilemma } from "./scenes/Scene1Dilemma";
import { Scene2Inventory } from "./scenes/Scene2Inventory";
import { Scene3Store } from "./scenes/Scene3Store";
import { Scene4Voice } from "./scenes/Scene4Voice";
import { Scene5Ready } from "./scenes/Scene5Ready";
import { Scene6Cooked } from "./scenes/Scene6Cooked";
import { CARBONARA_RECIPE } from "@/lib/story-onboarding/constants";
import type { StoryOnboardingState, DemoInventoryItem } from "@/lib/story-onboarding/types";
import type { QuantityLevel } from "@/types/inventory";

export function StoryOnboarding() {
  const { state, hydrated, goToScene, updateInventory } = useStoryState();
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

    // Apply decrement: non-staple anchor ingredients lose 1 level (floor at 0)
    const anchorNames = new Set(
      CARBONARA_RECIPE.ingredients
        .filter((ing) => ing.type === "anchor")
        .map((ing) => ing.name.toLowerCase()),
    );

    const decremented = state.demoInventory.map((item) => {
      if (!item.isPantryStaple && anchorNames.has(item.name.toLowerCase())) {
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
          <Scene2Inventory onContinue={() => handleNavigate(3)} />
        )}
        {state.currentScene === 3 && (
          <Scene3Store onContinue={() => handleNavigate(4)} />
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
          <div className="flex items-center justify-center min-h-[80vh] px-6">
            <p className="text-lg font-bold text-gray-500">Scene 7: Manifesto (coming next phase)</p>
          </div>
        )}
      </div>
    </div>
  );
}
