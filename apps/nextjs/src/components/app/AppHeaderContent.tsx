'use client'

import { usePathname } from 'next/navigation'
import { Logo } from '@/components/shared/Logo'
import { LogoutButton } from '@/components/app/LogoutButton'
import { AppNavigation } from '@/components/app/AppNavigation'
import { COMPLETION_FLAG_KEY } from '@/lib/story-onboarding/constants'

export function AppHeaderContent() {
  const pathname = usePathname()
  const isOnboarding = pathname.startsWith('/app/onboarding')

  // Check if user has completed the story (client-side only)
  const hasCompletedStory = typeof window !== 'undefined'
    ? localStorage.getItem(COMPLETION_FLAG_KEY) === 'true'
    : false

  // Show navigation if NOT on onboarding OR if user has completed the story
  const showNavigation = !isOnboarding || hasCompletedStory

  return (
    <>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Logo href={isOnboarding ? undefined : "/app"} size="md" />
        <LogoutButton />
      </div>
      {showNavigation && <AppNavigation />}
    </>
  )
}
