import { useState, useEffect } from 'react';

/**
 * Custom hook for managing video tutorial dismissal state with localStorage persistence
 *
 * @param params - Configuration object with storageKey
 * @param params.storageKey - localStorage key for persisting dismissal state (e.g., "video:inventory:dismissed")
 * @returns Object containing dismissed state and control functions
 *
 * @example
 * ```tsx
 * const { dismissed, dismiss, reset } = useVideoDismissal({
 *   storageKey: "video:inventory:dismissed"
 * });
 *
 * // Show prominent callout only if not dismissed
 * {!dismissed && <PageCallout ... onDismiss={dismiss} />}
 * ```
 */
export function useVideoDismissal(params: {
  storageKey: string;
}) {
  // Initialize from localStorage (SSR-safe)
  const [dismissed, setDismissed] = useState(() => {
    try {
      // Check if running in browser environment
      if (typeof window === "undefined") return false;

      // Read from localStorage
      return localStorage.getItem(params.storageKey) === "true";
    } catch {
      // Silently fail if localStorage unavailable (privacy mode, disabled)
      return false;
    }
  });

  // Persist changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(params.storageKey, String(dismissed));
    } catch {
      // Silently fail if localStorage unavailable
      // This is acceptable degradation - tutorial will show on every visit
    }
  }, [dismissed, params.storageKey]);

  return {
    /** Current dismissal state */
    dismissed,
    /** Dismiss the video tutorial (sets dismissed to true) */
    dismiss: () => setDismissed(true),
    /** Reset dismissal state (sets dismissed to false, for testing/debugging) */
    reset: () => setDismissed(false),
  };
}
