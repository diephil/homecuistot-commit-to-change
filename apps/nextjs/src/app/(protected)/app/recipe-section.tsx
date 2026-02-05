'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { RecipeAvailabilityCard } from '@/components/app/RecipeAvailabilityCard'
import { MarkCookedModal } from '@/components/app/MarkCookedModal'
import type { RecipeWithAvailability } from '@/types/cooking'

export interface RecipeSectionProps {
  title: string
  subtitle?: string
  recipes: RecipeWithAvailability[]
  variant: 'available' | 'almost-available'
  emptyMessage: React.ReactNode
}

export function RecipeSection(props: RecipeSectionProps) {
  const { title, subtitle, recipes, variant, emptyMessage } = props
  const router = useRouter()

  // Modal state - store ID only, derive recipe from fresh props
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Derive recipe from fresh props to ensure updated quantities
  const selectedRecipe = selectedRecipeId
    ? recipes.find((r) => r.id === selectedRecipeId) ?? null
    : null

  const handleMarkAsCooked = useCallback((recipe: RecipeWithAvailability) => {
    setSelectedRecipeId(recipe.id)
    setIsModalOpen(true)
  }, [])

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
    setSelectedRecipeId(null)
  }, [])

  const handleSuccess = useCallback(() => {
    // Refresh the page data
    router.refresh()
  }, [router])

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>

      {recipes.length === 0 ? (
        <div className="p-6 border-4 border-dashed border-gray-300 text-center">
          <div className="font-bold text-gray-500">{emptyMessage}</div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeAvailabilityCard
              key={recipe.id}
              recipe={recipe}
              variant={variant}
              onMarkAsCooked={handleMarkAsCooked}
            />
          ))}
        </div>
      )}

      {/* Mark as Cooked Modal (available recipes) */}
      {variant === 'available' && (
        <MarkCookedModal
          recipe={selectedRecipe}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleSuccess}
        />
      )}
    </section>
  )
}
