"use client";

import { useStoryState } from "./hooks/useStoryState";
import { useFadeTransition } from "./hooks/useFadeTransition";
import { StoryProgressBar } from "./StoryProgressBar";
import { Scene1Dilemma } from "./scenes/Scene1Dilemma";
import { Scene2Inventory } from "./scenes/Scene2Inventory";
import { Scene3Store } from "./scenes/Scene3Store";
import { Scene4Voice } from "./scenes/Scene4Voice";
import type { StoryOnboardingState } from "@/lib/story-onboarding/types";

export function StoryOnboarding() {
  const { state, hydrated, goToScene, updateInventory } = useStoryState();
  const { className: fadeClassName, triggerTransition } = useFadeTransition();

  const handleNavigate = (scene: StoryOnboardingState["currentScene"]) => {
    triggerTransition(() => {
      goToScene(scene);
      window.scrollTo({ top: 0 });
    });
  };

  const handleBack = () => {
    if (state.currentScene > 1) {
      handleNavigate((state.currentScene - 1) as StoryOnboardingState["currentScene"]);
    }
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
      <StoryProgressBar
        currentScene={state.currentScene}
        onBack={state.currentScene > 1 ? handleBack : undefined}
      />

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
          <div className="flex items-center justify-center min-h-[80vh] px-6">
            <p className="text-lg font-bold text-gray-500">Scene 5: Recipe Ready (coming next phase)</p>
          </div>
        )}
        {state.currentScene === 6 && (
          <div className="flex items-center justify-center min-h-[80vh] px-6">
            <p className="text-lg font-bold text-gray-500">Scene 6: Cooked (coming next phase)</p>
          </div>
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
