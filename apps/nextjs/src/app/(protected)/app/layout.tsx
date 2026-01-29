import type { ReactNode } from 'react'
import { redirect, RedirectType } from 'next/navigation'
import { headers } from 'next/headers'
import { getUserCounts } from '@/app/actions/cooking-log'
import { AppHeaderContent } from '@/components/app/app-header-content'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  const isOnboarding = pathname.startsWith('/onboarding') || pathname.startsWith('/app/onboarding')

  // T005-T006: Check recipe/inventory count and redirect if both are zero
  // Skip redirect check if already on onboarding
  if (!isOnboarding) {
    try {
      const { recipeCount, inventoryCount } = await getUserCounts()

      if (recipeCount === 0 && inventoryCount === 0) {
        // Use replace to prevent back-button redirect loop
        // This replaces /app in history so back button goes to login/landing, not /app
        redirect('/app/onboarding', RedirectType.replace)
      }
    } catch (error) {
      // Re-throw redirect errors (Next.js uses error throwing for redirects)
      const isRedirect = error instanceof Error &&
        (error.message.includes('NEXT_REDIRECT') || (error as { digest?: string }).digest?.startsWith('NEXT_REDIRECT'))
      if (isRedirect) {
        throw error
      }
      // If auth fails, let the protected route handler deal with it
      console.error('[app/layout] Failed to get user counts:', error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header role="banner" className="border-b-4 border-black bg-gradient-to-r from-pink-300 via-yellow-300 to-cyan-300 p-4">
        <AppHeaderContent />
      </header>
      <main role="main" className="flex-1">
        {children}
      </main>
    </div>
  )
}
