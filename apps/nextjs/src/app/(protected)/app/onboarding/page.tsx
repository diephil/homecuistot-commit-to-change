import { redirect, RedirectType } from "next/navigation";
import { hasCompletedOnboarding } from "@/app/actions/inventory";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OnboardingPageContent } from "./OnboardingPageContent";
import { OnboardingGuard } from "./OnboardingGuard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Onboarding Page - Server Component with Client Guard
 * Server check: Prevents initial page load if onboarding is completed
 * Client guard: Prevents browser back-forward cache from showing stale page
 */
export default async function OnboardingPage() {
  // Server-side check: redirect if user has completed onboarding
  const completed = await hasCompletedOnboarding();

  if (completed) {
    redirect("/app", RedirectType.replace);
  }

  // Client-side guard: handles bfcache and visibility changes
  return (
    <ErrorBoundary>
      <OnboardingGuard>
        <OnboardingPageContent />
      </OnboardingGuard>
    </ErrorBoundary>
  );
}
