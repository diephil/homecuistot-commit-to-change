import type { ReactNode } from 'react'
import Link from 'next/link'
import { LogoutButton } from '@/components/LogoutButton'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header role="banner" className="border-b-4 border-black bg-gradient-to-r from-pink-300 via-yellow-300 to-cyan-300 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/app" className="hover:opacity-80 transition-opacity">
            <h1 className="text-2xl font-black uppercase cursor-pointer">🍳 HomeCuistot</h1>
          </Link>
          <LogoutButton />
        </div>
      </header>
      <main role="main" className="flex-1">
        {children}
      </main>
    </div>
  )
}
