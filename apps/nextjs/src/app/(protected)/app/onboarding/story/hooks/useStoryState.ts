"use client";

import { useState, useEffect, useCallback } from "react";
import type { StoryOnboardingState, DemoInventoryItem } from "@/lib/story-onboarding/types";
import {
  LOCALSTORAGE_KEY,
  SARAH_INITIAL_INVENTORY,
  CARBONARA_RECIPE,
} from "@/lib/story-onboarding/constants";

const DEFAULT_STATE: StoryOnboardingState = {
  currentScene: 1,
  demoInventory: SARAH_INITIAL_INVENTORY,
  demoRecipe: CARBONARA_RECIPE,
  voiceInputsDone: false,
};

function readState(): StoryOnboardingState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(LOCALSTORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return JSON.parse(raw) as StoryOnboardingState;
  } catch {
    return DEFAULT_STATE;
  }
}

function writeState(state: StoryOnboardingState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable — ignore
  }
}

export function useStoryState() {
  const [state, setState] = useState<StoryOnboardingState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setState(readState());
    setHydrated(true);
  }, []);

  // Write-through on every state change (after hydration)
  useEffect(() => {
    if (hydrated) {
      writeState(state);
    }
  }, [state, hydrated]);

  const goToScene = useCallback(
    (scene: StoryOnboardingState["currentScene"]) => {
      setState((prev) => ({ ...prev, currentScene: scene }));
    },
    [],
  );

  const updateInventory = useCallback((items: DemoInventoryItem[]) => {
    setState((prev) => ({ ...prev, demoInventory: items }));
  }, []);

  const markVoiceDone = useCallback(() => {
    setState((prev) => ({ ...prev, voiceInputsDone: true }));
  }, []);

  const reset = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCALSTORAGE_KEY);
    }
    setState(DEFAULT_STATE);
  }, []);

  return {
    state,
    hydrated,
    goToScene,
    updateInventory,
    markVoiceDone,
    reset,
  };
}
