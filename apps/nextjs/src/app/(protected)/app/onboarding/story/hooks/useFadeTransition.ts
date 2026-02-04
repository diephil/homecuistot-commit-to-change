"use client";

import { useState, useCallback, useRef } from "react";

type FadePhase = "visible" | "fade-out" | "hidden" | "fade-in";

const FADE_DURATION = 400; // ms — matches CSS transition duration

/**
 * Manages fade-out → swap → fade-in scene transitions.
 * Returns a CSS class string for opacity and a trigger function.
 */
export function useFadeTransition() {
  const [phase, setPhase] = useState<FadePhase>("visible");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerTransition = useCallback((onHidden: () => void) => {
    // Clear any pending timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Phase 1: fade-out
    setPhase("fade-out");

    timeoutRef.current = setTimeout(() => {
      // Phase 2: hidden — swap content
      setPhase("hidden");
      onHidden();

      // Phase 3: fade-in (next frame to ensure DOM update)
      requestAnimationFrame(() => {
        setPhase("fade-in");

        timeoutRef.current = setTimeout(() => {
          // Phase 4: visible (transition complete)
          setPhase("visible");
        }, FADE_DURATION);
      });
    }, FADE_DURATION);
  }, []);

  const className =
    phase === "visible" || phase === "fade-in"
      ? "opacity-100 transition-opacity duration-400"
      : phase === "fade-out"
        ? "opacity-0 transition-opacity duration-400"
        : "opacity-0";

  return { phase, className, triggerTransition };
}
