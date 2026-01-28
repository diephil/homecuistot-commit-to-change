'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/retroui/Button'
import { IngredientBadge } from '@/components/retroui/IngredientBadge'
import { markRecipeAsCooked } from '@/app/actions/cooking-log'
import type { RecipeWithAvailability, QuantityLevel, IngredientDiff } from '@/types/cooking'
import { cn } from '@/lib/utils'
import { X, Loader2, Check } from 'lucide-react'

type ModalStage = 'confirmation' | 'processing' | 'success' | 'error'

export interface MarkCookedModalProps {
  recipe: RecipeWithAvailability | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function MarkCookedModal(props: MarkCookedModalProps) {
  const { recipe, isOpen, onClose, onSuccess } = props

  const [stage, setStage] = useState<ModalStage>('confirmation')
  const [error, setError] = useState<string | null>(null)

  // T012: Ingredient diffs with adjustable quantities
  const [ingredientDiffs, setIngredientDiffs] = useState<IngredientDiff[]>([])

  // Initialize diffs when modal opens
  const initializeDiffs = useCallback((r: RecipeWithAvailability) => {
    const diffs = r.ingredients
      .filter((i) => i.type === 'anchor' && i.inInventory)
      .map((i) => ({
        ingredientId: i.id,
        name: i.name,
        currentQuantity: i.currentQuantity,
        // Default: decrement by 1, floor at 0 (pantry staples stay at 3)
        proposedQuantity: i.isPantryStaple ? 3 : Math.max(0, i.currentQuantity - 1) as QuantityLevel,
        isPantryStaple: i.isPantryStaple,
      }))
    setIngredientDiffs(diffs)
    setStage('confirmation')
    setError(null)
  }, [])

  // Handle quantity change (tap to cycle 0-3)
  const handleQuantityChange = useCallback((params: { ingredientId: string; newQuantity: QuantityLevel }) => {
    setIngredientDiffs((prev) =>
      prev.map((d) =>
        d.ingredientId === params.ingredientId
          ? { ...d, proposedQuantity: params.newQuantity }
          : d
      )
    )
  }, [])

  // T013: Submit to server action
  const handleSave = async () => {
    if (!recipe) return

    setStage('processing')
    setError(null)

    // Exclude pantry staples from inventory updates
    const nonStapleDiffs = ingredientDiffs.filter((d) => !d.isPantryStaple)

    const result = await markRecipeAsCooked({
      recipeId: recipe.id,
      recipeName: recipe.name,
      ingredientUpdates: nonStapleDiffs.map((d) => ({
        ingredientId: d.ingredientId,
        newQuantity: d.proposedQuantity,
      })),
    })

    if (result.success) {
      setStage('success')
      // T015: Trigger page revalidation (handled by server action)
      setTimeout(() => {
        onSuccess?.()
        onClose()
        setStage('confirmation')
      }, 1000)
    } else {
      setStage('error')
      setError(result.error || 'Something went wrong')
    }
  }

  // Reset on close
  const handleClose = () => {
    setStage('confirmation')
    setError(null)
    onClose()
  }

  // Initialize when recipe changes
  if (recipe && ingredientDiffs.length === 0 && isOpen) {
    initializeDiffs(recipe)
  }

  if (!isOpen || !recipe) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={handleClose}
    >
      <div
        className={cn(
          'w-full max-w-md bg-white border-4 border-black',
          'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-4 border-black bg-cyan-200">
          <h2 className="text-xl font-black uppercase">Mark as Cooked</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-black/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {stage === 'confirmation' && (
            <>
              <p className="font-bold mb-4">
                Cooking <span className="text-pink-600">{recipe.name}</span>
              </p>

              {ingredientDiffs.length > 0 ? (
                <>
                  <p className="text-sm font-semibold mb-3">
                    Adjust inventory levels (tap to change):
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {ingredientDiffs.map((diff) => (
                      <div key={diff.ingredientId} className="flex flex-col items-center gap-1">
                        <IngredientBadge
                          name={diff.name}
                          level={diff.isPantryStaple ? 3 : diff.proposedQuantity}
                          variant="dots"
                          interactive={!diff.isPantryStaple}
                          onLevelChange={(newLevel) =>
                            handleQuantityChange({
                              ingredientId: diff.ingredientId,
                              newQuantity: newLevel,
                            })
                          }
                        />
                        {diff.isPantryStaple ? (
                          <span className="text-xs text-green-600 font-medium">∞</span>
                        ) : diff.proposedQuantity !== diff.currentQuantity ? (
                          <span className="text-xs text-gray-500">
                            {diff.currentQuantity} → {diff.proposedQuantity}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-600 mb-4">
                  No inventory items to update.
                </p>
              )}
            </>
          )}

          {stage === 'processing' && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-pink-500" />
              <p className="mt-4 font-bold">Saving...</p>
            </div>
          )}

          {stage === 'success' && (
            <div className="flex flex-col items-center py-8">
              <div className="h-16 w-16 rounded-full bg-green-400 flex items-center justify-center border-4 border-black">
                <Check className="h-8 w-8 text-white" />
              </div>
              <p className="mt-4 font-bold text-green-700">Logged!</p>
            </div>
          )}

          {stage === 'error' && (
            <div className="py-4">
              <p className="text-red-600 font-bold mb-4">{error}</p>
              <Button variant="default" className="w-full" onClick={() => setStage('confirmation')}>
                Try Again
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        {stage === 'confirmation' && (
          <div className="p-4 border-t-4 border-black bg-gray-50 flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="default" className="flex-1" onClick={handleSave}>
              Save
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
