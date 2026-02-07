'use client'

import { usePathname } from 'next/navigation'
import { Logo } from '@/components/shared/Logo'
import { LogoutButton } from '@/components/app/LogoutButton'
import { AppNavigation } from '@/components/app/AppNavigation'

export function AppHeaderContent({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()

  // Hide nav only during first-time onboarding (/app/onboarding exact),
  // not when replaying Sam's Story from the navbar (/app/onboarding/story)
  const isFirstTimeOnboarding = pathname === '/app/onboarding'

  return (
    <>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Logo href={isFirstTimeOnboarding ? undefined : "/app"} size="md" />
        <LogoutButton />
      </div>
      {!isFirstTimeOnboarding && <AppNavigation isAdmin={isAdmin} />}
    </>
  )
}
