'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { SmallActionButton } from '@/components/shared/SmallActionButton'
import { Check, Pencil, X } from 'lucide-react'
import type { RecipeWithAvailability } from '@/types/cooking'

export interface RecipeAvailabilityCardProps {
  recipe: RecipeWithAvailability
  variant: 'available' | 'almost-available' | 'unavailable'
  onMarkAsCooked?: (recipe: RecipeWithAvailability) => void
  onEdit?: () => void
  onDelete?: () => void
  showMissingCount?: boolean
}

export function RecipeAvailabilityCard(props: RecipeAvailabilityCardProps) {
  const { recipe, variant, onMarkAsCooked, onEdit, onDelete, showMissingCount = true } = props

  // T007: Green gradient for available, yellow/orange for almost-available, gray for unavailable
  const gradientClass = {
    available: 'bg-gradient-to-br from-green-200 to-green-300',
    'almost-available': 'bg-gradient-to-br from-yellow-200 to-orange-200',
    unavailable: 'bg-gradient-to-br from-gray-200 to-gray-300',
  }[variant]

  // Get anchor ingredients separated by availability
  const anchorIngredients = recipe.ingredients.filter((i) => i.type === 'anchor')
  const availableIngredients = anchorIngredients.filter((i) => i.inInventory)
  const missingIngredients = anchorIngredients.filter((i) => !i.inInventory)

  // Get optional ingredients
  const optionalIngredients = recipe.ingredients.filter((i) => i.type !== 'anchor')

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

      {/* Available anchor ingredients */}
      {variant === 'available' && anchorIngredients.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {anchorIngredients.map((ing) => (
            <Badge
              key={ing.id}
              variant="outline"
              size="sm"
              className="bg-green-200 border-green-400"
            >
              {ing.name}
            </Badge>
          ))}
        </div>
      )}
      {variant === 'almost-available' && availableIngredients.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {availableIngredients.map((ing) => (
            <Badge
              key={ing.id}
              variant="outline"
              size="sm"
              className="bg-green-200 border-green-400"
            >
              {ing.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Spacer to push bottom content down */}
      <div className="flex-grow min-h-3" />

      {/* Optional ingredients - shown first without background/borders */}
      {(variant === 'available' || variant === 'almost-available') && optionalIngredients.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center mb-3">
          <span className="text-sm font-black mr-1">Optional</span>
          {optionalIngredients.map((ing) => (
            <Badge
              key={ing.id}
              variant="outline"
              size="sm"
              className={cn(
                ing.inInventory ? 'bg-green-200 border-green-400' : 'bg-orange-200 border-orange-400'
              )}
            >
              {ing.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Missing anchor ingredients for almost-available */}
      {variant === 'almost-available' && missingIngredients.length > 0 && (
        <div className="p-2 bg-white/50 border-2 border-black mb-3">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-black mr-1">Missing</span>
            {missingIngredients.map((ing) => (
              <Badge
                key={ing.id}
                variant="outline"
                size="sm"
                className="bg-red-100 border-red-400"
              >
                {ing.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* T014: Mark as Cooked button for available recipes */}
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

      {/* Cook it Anyway button for almost-available recipes */}
      {variant === 'almost-available' && onMarkAsCooked && (
        <Button
          variant="default"
          size="md"
          className="w-full justify-center gap-2"
          onClick={() => onMarkAsCooked(recipe)}
        >
          <Check className="w-5 h-5" />
          Cook it Anyway
        </Button>
      )}
    </div>
  )
}
