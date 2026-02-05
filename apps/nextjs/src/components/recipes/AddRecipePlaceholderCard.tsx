'use client'

import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'

export function AddRecipePlaceholderCard() {
  return (
    <div
      className={cn(
        'relative border-4 border-dashed border-purple-600 p-4 flex flex-col h-full',
        'sm:shadow-[6px_6px_0px_0px_rgba(147,51,234,0.3)]',
        'bg-gradient-to-br from-purple-100 to-pink-100',
        'hover:from-purple-150 hover:to-pink-150 transition-all duration-200',
        'cursor-pointer group'
      )}
      role="button"
      tabIndex={0}
      aria-label="Add new recipe using voice or text input above"
      onClick={() => {
        // Scroll to voice input
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }}
    >
      {/* Plus icon badge */}
      <div className="absolute -top-3 -right-1 bg-purple-500 border-2 border-black p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <Plus className="h-4 w-4 text-white" strokeWidth={3} />
      </div>

      <h3 className="text-xl font-black mb-1 text-purple-800 group-hover:text-purple-900 transition-colors">
        Manage Recipes
      </h3>

      <p className="text-sm font-bold text-purple-700/70 mb-3">
        Add, edit, or remove recipes using voice or text input above
      </p>

      {/* Fields guide */}
      <div className="space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <span className="text-purple-600 font-black shrink-0">REQUIRED:</span>
          <span className="text-purple-800/80 font-medium">Recipe title</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-purple-400 font-black shrink-0">OPTIONAL:</span>
          <span className="text-purple-800/80 font-medium">Description, ingredients</span>
        </div>
      </div>

      {/* Example ingredients placeholder */}
      <div className="flex flex-wrap gap-2 mt-4">
        <div className="px-2 py-1 bg-white/40 border-2 border-dashed border-purple-400 rounded text-xs text-purple-600 font-medium">
          <span className="text-purple-300 mr-1">★</span>
          Required ingredient
        </div>
        <div className="px-2 py-1 bg-white/40 border-2 border-dashed border-purple-300 rounded text-xs text-purple-500 font-medium">
          <span className="text-gray-300 mr-1">★</span>
          Optional ingredient
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-grow min-h-3" />

      {/* Hint text */}
      <p className="text-xs text-purple-600/60 font-medium italic mt-2 group-hover:text-purple-700/80 transition-colors">
        Click to scroll to input
      </p>
    </div>
  )
}
