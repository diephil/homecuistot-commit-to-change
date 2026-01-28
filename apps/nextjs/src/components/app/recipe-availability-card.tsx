'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/retroui/Badge'
import { Button } from '@/components/retroui/Button'
import { X } from 'lucide-react'
import type { RecipeWithAvailability } from '@/types/cooking'

export interface RecipeAvailabilityCardProps {
  recipe: RecipeWithAvailability
  variant: 'available' | 'almost-available'
  onMarkAsCooked?: (recipe: RecipeWithAvailability) => void
}

export function RecipeAvailabilityCard(props: RecipeAvailabilityCardProps) {
  const { recipe, variant, onMarkAsCooked } = props

  // T007: Green gradient for available, yellow/orange for almost-available
  const gradientClass = variant === 'available'
    ? 'bg-gradient-to-br from-green-200 to-green-300'
    : 'bg-gradient-to-br from-yellow-200 to-orange-200'

  // Get anchor ingredients only for display
  const anchorIngredients = recipe.ingredients.filter((i) => i.type === 'anchor')

  return (
    <div
      className={cn(
        'border-4 border-black p-4 overflow-hidden',
        'sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
        gradientClass
      )}
    >
      <h3 className="text-xl font-black truncate mb-1">{recipe.name}</h3>

      {recipe.description && (
        <p className="text-sm font-bold text-black/70 mb-3 line-clamp-2">
          {recipe.description}
        </p>
      )}

      {/* Ingredients list */}
      <div className="flex flex-wrap gap-1 mb-3">
        {anchorIngredients.map((ing) => (
          <Badge
            key={ing.id}
            variant="outline"
            size="sm"
            className={cn(
              'bg-white/50',
              !ing.inInventory && 'bg-red-500 border-red-700 text-white font-black'
            )}
          >
            {!ing.inInventory && <X className="w-3 h-3 mr-1 inline-block" />}
            {ing.name}
          </Badge>
        ))}
      </div>

      {/* T016: Missing ingredients display for almost-available */}
      {/* {variant === 'almost-available' && recipe.missingAnchorNames.length > 0 && (
        <div className="p-2 bg-white/50 border-2 border-black mb-3">
          <span className="text-sm font-black">Missing: </span>
          <span className="text-sm font-bold">
            {recipe.missingAnchorNames.join(', ')}
          </span>
        </div>
      )} */}

      {/* T014: Mark as Cooked button for available recipes only */}
      {variant === 'available' && onMarkAsCooked && (
        <Button
          variant="default"
          size="sm"
          className="w-full"
          onClick={() => onMarkAsCooked(recipe)}
        >
          Mark as Cooked
        </Button>
      )}
    </div>
  )
}
