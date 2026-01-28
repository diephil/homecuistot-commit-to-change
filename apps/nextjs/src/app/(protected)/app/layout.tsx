import type { ReactNode } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/LogoutButton'
import { getUserCounts } from '@/app/actions/cooking-log'
import { AppNavigation } from '@/components/app/app-navigation'

export default async function AppLayout({ children }: { children: ReactNode }) {
  // T005-T006: Check recipe/inventory count and redirect if both are zero
  try {
    const { recipeCount, inventoryCount } = await getUserCounts()

    if (recipeCount === 0 && inventoryCount === 0) {
      redirect('/onboarding')
    }
  } catch (error) {
    // If auth fails, let the protected route handler deal with it
    console.error('[app/layout] Failed to get user counts:', error)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header role="banner" className="border-b-4 border-black bg-gradient-to-r from-pink-300 via-yellow-300 to-cyan-300 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/app" className="hover:opacity-80 transition-opacity">
            <h1 className="text-2xl font-black uppercase cursor-pointer">🍳 HomeCuistot</h1>
          </Link>
          <LogoutButton />
        </div>
        {/* T022: App Navigation */}
        <AppNavigation />
      </header>
      <main role="main" className="flex-1">
        {children}
      </main>
    </div>
  )
}
