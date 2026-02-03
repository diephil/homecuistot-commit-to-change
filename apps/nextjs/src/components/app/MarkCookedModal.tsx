'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/shared/Button'
import { InventoryItemBadge } from '@/components/shared/InventoryItemBadge'
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
      .filter((i) =>
        // Include all anchor and optional ingredients
        i.type === 'anchor' || i.type === 'optional'
      )
      .map((i) => ({
        ingredientId: i.id,
        name: i.name,
        currentQuantity: i.currentQuantity,
        // Default: decrement by 1, floor at 0 (pantry staples stay at 3)
        proposedQuantity: i.isPantryStaple ? 3 : Math.max(0, i.currentQuantity - 1) as QuantityLevel,
        isPantryStaple: i.isPantryStaple,
        isMissing: !i.inInventory,
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
    // Missing ingredients included — user may have adjusted their quantity
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
        setIngredientDiffs([]) // Reset diffs so next open uses fresh data
        setStage('confirmation')
        onClose()
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
    setIngredientDiffs([])
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
                  {/* Regular ingredients section */}
                  {ingredientDiffs.filter(d => !d.isPantryStaple && !d.isMissing).length > 0 && (
                    <>
                      <p className="text-sm font-semibold mb-3">
                        Tap ingredients to adjust quantities. The crossed-out blue badge shows what you had before cooking.
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-5 mb-4 pt-2">
                        {ingredientDiffs
                          .filter((diff) => !diff.isPantryStaple && !diff.isMissing)
                          .map((diff) => (
                            <InventoryItemBadge
                              key={diff.ingredientId}
                              name={diff.name}
                              level={diff.proposedQuantity}
                              isStaple={false}
                              useWord={true}
                              onLevelChange={(newLevel) =>
                                handleQuantityChange({
                                  ingredientId: diff.ingredientId,
                                  newQuantity: newLevel,
                                })
                              }
                              changeIndicator={{
                                type: 'quantity',
                                previousQuantity: diff.currentQuantity,
                                proposedQuantity: diff.proposedQuantity,
                              }}
                            />
                          ))}
                      </div>
                    </>
                  )}

                  {/* Pantry staples section */}
                  {ingredientDiffs.filter(d => d.isPantryStaple).length > 0 && (
                    <>
                      <p className="text-sm font-semibold mb-3 text-gray-600">
                        Pantry staples won't be deducted (always available):
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-5 mb-4 pt-2">
                        {ingredientDiffs
                          .filter((diff) => diff.isPantryStaple)
                          .map((diff) => (
                            <div
                              key={diff.ingredientId}
                              className={cn(
                                "inline-flex items-center gap-2 rounded-lg px-3 py-2",
                                "border-2 border-blue-300 bg-blue-100",
                                "text-sm font-medium",
                                "min-w-24 cursor-default"
                              )}
                            >
                              <span className="font-semibold truncate max-w-[120px] capitalize">
                                {diff.name}
                              </span>
                              <span className="text-blue-600 font-bold text-base">∞</span>
                            </div>
                          ))}
                      </div>
                    </>
                  )}

                  {/* Missing ingredients section */}
                  {ingredientDiffs.filter(d => d.isMissing).length > 0 && (
                    <>
                      <p className="text-sm font-semibold mb-3 text-gray-600">
                        Optional ingredients not in your inventory (adjust if you used them):
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-5 mb-4 pt-2">
                        {ingredientDiffs
                          .filter((diff) => diff.isMissing)
                          .map((diff) => (
                            <InventoryItemBadge
                              key={diff.ingredientId}
                              name={diff.name}
                              level={diff.proposedQuantity}
                              isStaple={false}
                              useWord={true}
                              onLevelChange={(newLevel) =>
                                handleQuantityChange({
                                  ingredientId: diff.ingredientId,
                                  newQuantity: newLevel,
                                })
                              }
                              changeIndicator={{
                                type: 'quantity',
                                previousQuantity: diff.currentQuantity,
                                proposedQuantity: diff.proposedQuantity,
                              }}
                            />
                          ))}
                      </div>
                    </>
                  )}
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
