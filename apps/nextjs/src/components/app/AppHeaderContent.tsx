'use client'

import { usePathname } from 'next/navigation'
import { Logo } from '@/components/shared/Logo'
import { LogoutButton } from '@/components/app/LogoutButton'
import { AppNavigation } from '@/components/app/AppNavigation'

export function AppHeaderContent() {
  const pathname = usePathname()
  const isOnboarding = pathname.startsWith('/app/onboarding')

  return (
    <>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Logo href="/app" size="md" />
        <LogoutButton />
      </div>
      {!isOnboarding && <AppNavigation />}
    </>
  )
}
