import type { ReactNode } from 'react'
import { AppHeaderContent } from '@/components/app/AppHeaderContent'
// import { checkIsAdmin } from '@/lib/services/admin-auth'

export default async function AppLayout({ children }: { children: ReactNode }) {
  // DEMO: always show admin nav link for project review
  // const isAdmin = await checkIsAdmin()
  const isAdmin = true

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <header role="banner" className="border-b-4 border-black bg-gradient-to-r from-pink-300 via-yellow-300 to-cyan-300 p-4 w-full">
        <AppHeaderContent isAdmin={isAdmin} />
      </header>
      <main role="main" className="flex-1 w-full">
        {children}
      </main>
    </div>
  )
}
