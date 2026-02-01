'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/shared/Badge'
import { SmallActionButton } from '@/components/shared/SmallActionButton'
import { Pencil, X } from 'lucide-react'
import type { RecipeWithAvailability } from '@/types/cooking'

export interface RecipeCardProps {
  recipe: RecipeWithAvailability
  variant: 'available' | 'almost-available' | 'unavailable'
  onEdit?: () => void
  onDelete?: () => void
}

export function RecipeCard(props: RecipeCardProps) {
  const { recipe, variant, onEdit, onDelete } = props

  const gradientClass = {
    available: 'bg-gradient-to-br from-green-200 to-green-300',
    'almost-available': 'bg-gradient-to-br from-yellow-200 to-orange-200',
    unavailable: 'bg-gradient-to-br from-gray-200 to-gray-300',
  }[variant]

  // Get all ingredients, required (anchor) first, then optional
  const sortedIngredients = [...recipe.ingredients].sort((a, b) => {
    if (a.type === b.type) return 0
    return a.type === 'anchor' ? -1 : 1
  })

  return (
    <div
      className={cn(
        'relative border-4 border-black p-4 flex flex-col h-full',
        'sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
        gradientClass
      )}
    >
      {/* Action buttons on top-right card border */}
      {onEdit && (
        <SmallActionButton
          icon={Pencil}
          variant="blue"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          title="Edit recipe"
          className="absolute -top-3 right-5"
        />
      )}
      {onDelete && (
        <SmallActionButton
          icon={X}
          variant="red"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          title="Delete recipe"
          className="absolute -top-3 -right-1"
        />
      )}

      <h3 className="text-xl font-black truncate mb-1">{recipe.name}</h3>

      {recipe.description && (
        <p className="text-sm font-bold text-black/70 mb-3 line-clamp-2">
          {recipe.description}
        </p>
      )}

      {/* Ingredients list with star system */}
      <div className="flex flex-wrap gap-2">
        {sortedIngredients.map((ing) => {
          const isRequired = ing.type === 'anchor'
          return (
            <Badge
              key={ing.id}
              variant="outline"
              size="sm"
              className="bg-white/50"
            >
              <span className={cn('mr-1', isRequired ? 'text-amber-500' : 'text-gray-300')}>★</span>
              {ing.name}
            </Badge>
          )
        })}
      </div>

      {/* Spacer to push bottom content down */}
      <div className="flex-grow min-h-3" />
    </div>
  )
}
