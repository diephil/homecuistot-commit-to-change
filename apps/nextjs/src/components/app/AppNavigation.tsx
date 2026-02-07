'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Book, Package, Menu, X, Sparkles, Shield } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  clearStoryState?: boolean
}

const baseNavItems: NavItem[] = [
  { href: '/app', label: 'Cook Now!', icon: Home },
  { href: '/app/recipes', label: 'My Recipes', icon: Book },
  { href: '/app/inventory', label: 'Inventory', icon: Package },
  { href: '/app/onboarding/story', label: "Sarah's Story", icon: Sparkles, clearStoryState: true },
]

const adminNavItem: NavItem = { href: '/admin', label: 'Admin Dashboard (demo)', icon: Shield }

function isActive(params: { pathname: string; href: string }): boolean {
  if (params.href === '/app') {
    return params.pathname === '/app'
  }
  return params.pathname.startsWith(params.href)
}

export function AppNavigation({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const navItems = isAdmin ? [...baseNavItems, adminNavItem] : baseNavItems

  const handleNavClick = (item: NavItem) => {
    if (item.clearStoryState) {
      // Clear story state but preserve completion flag
      localStorage.removeItem('homecuistot:story-onboarding')
      // Keep 'homecuistot:story-completed' flag intact
    }
    setIsOpen(false)
  }

  // Separate Cook Now from other items
  const cookNowItem = navItems[0]
  const otherItems = navItems.slice(1)
  const cookNowActive = isActive({ pathname, href: cookNowItem.href })

  return (
    <nav className="max-w-7xl mx-auto mt-3" aria-label="App navigation">
      {/* Mobile: Cook Now button + Menu button */}
      <div className="md:hidden flex gap-2">
        {/* Cook Now button - always visible */}
        <Link
          href={cookNowItem.href}
          onClick={() => handleNavClick(cookNowItem)}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 font-bold border-2 border-black transition-all',
            'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
            'active:shadow-none active:translate-y-0.5',
            cookNowActive
              ? 'bg-pink-400 text-black'
              : 'bg-white hover:bg-pink-100'
          )}
        >
          <Home className="h-4 w-4" />
          <span>{cookNowItem.label}</span>
        </Link>

        {/* Menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 font-bold border-2 border-black',
            'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white',
            'active:shadow-none active:translate-y-0.5'
          )}
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span>Menu</span>
        </button>
      </div>

      {/* Mobile: Dropdown menu (without Cook Now) */}
      {isOpen && (
        <div className="md:hidden mt-2 flex flex-col gap-2 ">
          {otherItems.map((item) => {
            const active = isActive({ pathname, href: item.href })
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleNavClick(item)}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-3 font-bold border-2 border-black transition-all',
                  'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ',
                  active
                    ? 'bg-pink-400 text-black'
                    : 'bg-white hover:bg-pink-100'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      )}

      {/* Desktop: Horizontal nav */}
      <div className="hidden md:flex gap-2">
        {navItems.map((item) => {
          const active = isActive({ pathname, href: item.href })
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => handleNavClick(item)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 font-bold border-2 border-black transition-all',
                'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
                'hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',
                'active:shadow-none active:translate-y-0.5 active:translate-x-0.5',
                active
                  ? 'bg-pink-400 text-black'
                  : 'bg-white hover:bg-pink-100'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
