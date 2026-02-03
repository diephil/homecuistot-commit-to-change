'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/shared/Badge'

export interface OnboardingRecipeCardProps {
  name: string
  description?: string
  ingredients: Array<{
    id: string
    name: string
    type: 'anchor' | 'optional'
  }>
  onIngredientToggle?: (ingredientId: string) => void
}

export function OnboardingRecipeCard(props: OnboardingRecipeCardProps) {
  const { name, description, ingredients, onIngredientToggle } = props

  return (
    <div
      className={cn(
        'relative border-4 border-black p-4 flex flex-col h-full',
        'sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
        'bg-gradient-to-br from-green-200 to-green-300'
      )}
    >
      <h3 className="text-xl font-black truncate mb-1">{name}</h3>

      {description && (
        <p className="text-sm font-bold text-black/70 mb-3 line-clamp-2">
          {description}
        </p>
      )}

      {/* Ingredients list with star system */}
      <div className="flex flex-wrap gap-2 mb-3">
        {ingredients.map((ing) => {
          const isRequired = ing.type === 'anchor'
          return (
            <Badge
              key={ing.id}
              variant="outline"
              size="sm"
              className={cn(
                'bg-white/50',
                onIngredientToggle && 'cursor-pointer hover:bg-white/80 transition-colors'
              )}
              onClick={
                onIngredientToggle
                  ? (e) => {
                      e.stopPropagation()
                      onIngredientToggle(ing.id)
                    }
                  : undefined
              }
            >
              <span className={cn('mr-1', isRequired ? 'text-amber-500' : 'text-gray-300')}>★</span>
              {ing.name}
            </Badge>
          )
        })}
      </div>

      {/* Spacer to push bottom content down */}
      <div className="flex-grow min-h-3" />

      {/* Legend */}
      <p className="text-xs text-black/60 italic">
        <span className="text-amber-500 mr-1">★</span>
        marks required ingredients
      </p>
    </div>
  )
}
