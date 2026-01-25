import type { ReactNode } from 'react'
import { LogoutButton } from '@/components/LogoutButton'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header role="banner" className="border-b-4 border-black bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black uppercase">🛡️ Admin Dashboard</h1>
          <LogoutButton />
        </div>
      </header>
      <main role="main" className="flex-1">
        {children}
      </main>
    </div>
  )
}
