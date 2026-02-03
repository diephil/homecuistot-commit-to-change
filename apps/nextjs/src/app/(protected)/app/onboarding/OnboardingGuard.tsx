"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Client-side guard to prevent users from accessing onboarding after completion
 * Checks onboarding status on mount and redirects if completed
 * This handles browser back-forward cache (bfcache) scenarios
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Check onboarding status when component mounts (including bfcache restore)
    async function checkOnboardingStatus() {
      try {
        const response = await fetch("/api/onboarding/status", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          console.error("[OnboardingGuard] Failed to check status");
          return;
        }

        const data = await response.json();

        if (data.completed) {
          // User has completed onboarding, redirect to app
          router.replace("/app");
        }
      } catch (error) {
        console.error("[OnboardingGuard] Error checking status:", error);
      }
    }

    checkOnboardingStatus();

    // Also check when page becomes visible (handles tab switching)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkOnboardingStatus();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);

  return <>{children}</>;
}
