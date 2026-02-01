import type { ReactNode } from 'react'
import { AppHeaderContent } from '@/components/app/AppHeaderContent'

export default async function AppLayout({ children }: { children: ReactNode }) {
  // Note: Redirect logic moved to page.tsx to avoid infinite loop on /app/onboarding
  // The x-pathname header detection was unreliable in Next.js 16
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
