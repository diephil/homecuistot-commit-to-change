'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { Check } from 'lucide-react'
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

  // Get anchor ingredients only for display, available first
  const anchorIngredients = recipe.ingredients
    .filter((i) => i.type === 'anchor')
    .sort((a, b) => (b.inInventory ? 1 : 0) - (a.inInventory ? 1 : 0))

  return (
    <div
      className={cn(
        'border-4 border-black p-4 overflow-hidden flex flex-col h-full',
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
      <div className="flex flex-wrap gap-2">
        {anchorIngredients.map((ing) => (
          <Badge
            key={ing.id}
            variant="outline"
            size="sm"
            className={cn(
              'bg-white/50',
              variant === 'almost-available' && ing.inInventory && 'bg-green-200 border-green-400',
              !ing.inInventory && 'bg-red-500 border-red-700 text-white font-black'
            )}
          >
            {ing.name}
          </Badge>
        ))}
      </div>

      {/* Spacer to push bottom content down */}
      <div className="flex-grow min-h-3" />

      {/* Missing ingredients count for almost-available */}
      {variant === 'almost-available' && recipe.missingAnchorCount > 0 && (
        <div className="p-2 bg-white/50 border-2 border-black">
          <span className="text-sm font-black">
            Missing {recipe.missingAnchorCount} ingredient{recipe.missingAnchorCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* T014: Mark as Cooked button for available recipes only */}
      {variant === 'available' && onMarkAsCooked && (
        <Button
          variant="default"
          size="md"
          className="w-full justify-center gap-2"
          onClick={() => onMarkAsCooked(recipe)}
        >
          <Check className="w-5 h-5" />
          Mark as Cooked
        </Button>
      )}
    </div>
  )
}
