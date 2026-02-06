'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/shared/Badge'
import { SmallActionButton } from '@/components/shared/SmallActionButton'
import { Pencil, X } from 'lucide-react'

export interface RecipeIngredient {
  id: string
  ingredientType: string
  ingredientId: string | null
  ingredient: { id: string; name: string; category: string } | null
}

export interface Recipe {
  id: string
  name: string
  description: string | null
  recipeIngredients: RecipeIngredient[]
}

export interface RecipeCardProps {
  recipe: Recipe
  onEdit?: () => void
  onDelete?: () => void
  onIngredientToggle?: (params: { recipeIngredientId: string; recipeId: string }) => void
}

export function RecipeCard(props: RecipeCardProps) {
  const { recipe, onEdit, onDelete, onIngredientToggle } = props

  // Get all ingredients sorted alphabetically
  const sortedIngredients = [...recipe.recipeIngredients]
    .filter((ri): ri is RecipeIngredient & { ingredient: NonNullable<RecipeIngredient['ingredient']> } =>
      ri.ingredient !== null
    )
    .sort((a, b) => a.ingredient.name.localeCompare(b.ingredient.name))

  return (
    <div
      className={cn(
        'relative border-4 border-black p-4 flex flex-col h-full',
        'sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
        'bg-cyan-200'
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
          const isRequired = ing.ingredientType === 'anchor'
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
                      onIngredientToggle({ recipeIngredientId: ing.id, recipeId: recipe.id })
                    }
                  : undefined
              }
            >
              <span className={cn('mr-1', isRequired ? 'text-amber-500' : 'text-gray-300')}>★</span>
              {ing.ingredient.name}
            </Badge>
          )
        })}
      </div>

      {/* Spacer to push bottom content down */}
      <div className="flex-grow min-h-3" />
    </div>
  )
}
