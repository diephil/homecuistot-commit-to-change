"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { SmallActionButton } from "@/components/shared/SmallActionButton";
import { updateRecipe, deleteRecipe } from "@/app/actions/recipes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface RecipeEditFormProps {
  recipe: {
    id: string;
    name: string;
    description: string | null;
    recipeIngredients: Array<{
      ingredientId: string | null;
      unrecognizedItemId: string | null;
      ingredient: {
        id: string;
        name: string;
      } | null;
      ingredientType: string;
    }>;
  };
  onClose: (changed?: boolean) => void;
}

export function RecipeEditForm(props: RecipeEditFormProps) {
  const { recipe, onClose } = props;

  // Filter to only known ingredients (not unrecognized items)
  const knownIngredients = recipe.recipeIngredients.filter(
    (ri): ri is typeof ri & { ingredient: NonNullable<typeof ri.ingredient> } =>
      ri.ingredient !== null
  );

  // Store original state for revert capability
  const [originalState] = useState({
    title: recipe.name,
    description: recipe.description || "",
    ingredients: knownIngredients.map((ri) => ({
      id: ri.ingredient.id,
      name: ri.ingredient.name,
      isOptional: ri.ingredientType === "optional",
    })),
  });

  // Working state (accumulates changes)
  const [title, setTitle] = useState(recipe.name);
  const [description, setDescription] = useState(recipe.description || "");
  const [ingredients, setIngredients] = useState(
    knownIngredients.map((ri) => ({
      id: ri.ingredient.id,
      name: ri.ingredient.name,
      isOptional: ri.ingredientType === "optional",
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleCancel() {
    // Revert to original state
    setTitle(originalState.title);
    setDescription(originalState.description);
    setIngredients(originalState.ingredients);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (ingredients.length === 0) {
      toast.error("At least one ingredient is required");
      return;
    }

    try {
      setIsSubmitting(true);

      const ingredientData = ingredients.map((ing) => ({
        ingredientId: ing.id,
        ingredientType: ing.isOptional ? ("optional" as const) : ("anchor" as const),
      }));

      await updateRecipe({
        recipeId: recipe.id,
        title: title.trim(),
        description: description.trim(),
        ingredients: ingredientData,
      });

      toast.success("Recipe updated successfully");
      onClose(true);
    } catch (error) {
      console.error("Failed to save recipe:", error);
      toast.error("Failed to save recipe");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    try {
      setIsSubmitting(true);
      await deleteRecipe({ recipeId: recipe.id });
      toast.success("Recipe deleted successfully");
      onClose(true);
    } catch (error) {
      console.error("Failed to delete recipe:", error);
      toast.error("Failed to delete recipe");
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleIngredientOptional(index: number) {
    setIngredients((prev) =>
      prev.map((ing, i) =>
        i === index ? { ...ing, isOptional: !ing.isOptional } : ing
      )
    );
  }

  function removeIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-4">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b-2 border-black">
            <h2 className="text-3xl font-bold">Edit Recipe</h2>
            <Button variant="ghost" onClick={() => onClose()} size="icon">
              <span className="text-2xl">✕</span>
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Recipe Card Preview */}
            <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {/* Title */}
              <h3 className="text-xl font-black truncate mb-1">
                {title || <span className="text-gray-400 italic font-normal">No title yet</span>}
              </h3>

              {/* Description */}
              {description ? (
                <p className="text-sm font-bold text-black/70 mb-3 line-clamp-2">
                  {description}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic mb-3">No description yet</p>
              )}

              {/* Ingredients list */}
              {ingredients.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {ingredients.map((ing, index) => (
                      <div key={ing.id} className="relative inline-flex">
                        <Badge
                          variant="outline"
                          size="sm"
                          className={cn(
                            "cursor-pointer hover:bg-gray-100 transition-colors",
                            !ing.isOptional ? "bg-amber-50 border-amber-400" : "bg-white/50"
                          )}
                          onClick={() => toggleIngredientOptional(index)}
                        >
                          <span className={cn("mr-1", !ing.isOptional ? "text-amber-500" : "text-gray-300")}>★</span>
                          {ing.name}
                        </Badge>
                        <SmallActionButton
                          icon={X}
                          variant="red"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeIngredient(index);
                          }}
                          title="Remove ingredient"
                          className="absolute -top-3 -right-2"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <p className="text-xs text-gray-500">
                    <span className="text-amber-500">★</span> Required ingredient • Click to toggle
                  </p>
                </div>
              )}

              {ingredients.length === 0 && (
                <p className="text-sm text-gray-400 italic">No ingredients yet</p>
              )}
            </div>

            <div className="flex gap-3 pt-6">
              <Button type="submit" disabled={isSubmitting} className="flex-1" size="lg">
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                size="lg"
              >
                Cancel
              </Button>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-200">
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSubmitting}
                  className="text-sm text-red-600 hover:text-red-800 hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Delete Recipe
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete this recipe?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded border-2 border-black shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      {isSubmitting ? "Deleting..." : "Yes, Delete"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
