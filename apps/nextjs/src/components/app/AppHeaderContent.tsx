'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from '@/components/app/LogoutButton'
import { AppNavigation } from '@/components/app/AppNavigation'

export function AppHeaderContent() {
  const pathname = usePathname()
  const isOnboarding = pathname.startsWith('/app/onboarding')

  return (
    <>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/app" className="hover:opacity-80 transition-opacity">
          <h1 className="text-2xl font-black uppercase cursor-pointer">🍳 HomeCuistot</h1>
        </Link>
        {<LogoutButton />}
      </div>
      {!isOnboarding && <AppNavigation />}
    </>
  )
}
