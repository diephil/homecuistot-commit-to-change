'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { RecipeAvailabilityCard } from '@/components/app/recipe-availability-card'
import { MarkCookedModal } from '@/components/app/mark-cooked-modal'
import type { RecipeWithAvailability } from '@/types/cooking'

export interface RecipeSectionProps {
  title: string
  subtitle?: string
  recipes: RecipeWithAvailability[]
  variant: 'available' | 'almost-available'
  emptyMessage: string
}

export function RecipeSection(props: RecipeSectionProps) {
  const { title, subtitle, recipes, variant, emptyMessage } = props
  const router = useRouter()

  // Modal state
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithAvailability | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleMarkAsCooked = useCallback((recipe: RecipeWithAvailability) => {
    setSelectedRecipe(recipe)
    setIsModalOpen(true)
  }, [])

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
    setSelectedRecipe(null)
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
          <p className="font-bold text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeAvailabilityCard
              key={recipe.id}
              recipe={recipe}
              variant={variant}
              onMarkAsCooked={variant === 'available' ? handleMarkAsCooked : undefined}
            />
          ))}
        </div>
      )}

      {/* Mark as Cooked Modal */}
      <MarkCookedModal
        recipe={selectedRecipe}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
      />
    </section>
  )
}
