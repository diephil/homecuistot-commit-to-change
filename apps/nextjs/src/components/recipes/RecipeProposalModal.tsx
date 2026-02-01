"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { Alert } from "@/components/shared/Alert";
import { FormModal } from "@/components/shared/FormModal";
import { LastHeardDisplay } from "@/components/shared/LastHeardDisplay";
import { Badge } from "@/components/shared/Badge";
import { SmallActionButton } from "@/components/shared/SmallActionButton";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { toast } from "sonner";
import type {
  RecipeManagerProposal,
  RecipeToolResult,
  ProposedRecipeIngredient,
  DeleteRecipeResult,
} from "@/types/recipe-agent";

interface RecipeProposalModalProps {
  isOpen: boolean;
  proposal: RecipeManagerProposal;
  onClose: () => void;
  onProposalApplied: () => void;
  transcription?: string;
}

export function RecipeProposalModal({
  isOpen,
  proposal: initialProposal,
  onClose,
  onProposalApplied,
  transcription,
}: RecipeProposalModalProps) {
  const [proposal, setProposal] = useState(initialProposal);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsSaving(false);
    onClose();
  };

  const handleConfirm = async () => {
    if (proposal.recipes.length === 0) return;

    setIsSaving(true);

    try {
      const response = await fetch("/api/recipes/apply-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipes: proposal.recipes }),
      });

      if (!response.ok) {
        throw new Error("Failed to save recipes");
      }

      toast.success("Updated recipe list");

      handleClose();
      onProposalApplied();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save recipes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveRecipe = (index: number) => {
    setProposal({
      ...proposal,
      recipes: proposal.recipes.filter((_, i) => i !== index),
      noChangesDetected: proposal.recipes.length <= 1,
    });
  };

  const handleToggleRequired = (recipeIndex: number, ingredientIndex: number) => {
    setProposal({
      ...proposal,
      recipes: proposal.recipes.map((recipe, rIdx) => {
        if (rIdx !== recipeIndex) return recipe;

        if (recipe.operation === "create") {
          return {
            ...recipe,
            ingredients: recipe.ingredients.map((ing: ProposedRecipeIngredient, iIdx: number) =>
              iIdx === ingredientIndex ? { ...ing, isRequired: !ing.isRequired } : ing
            ),
          };
        } else if (recipe.operation === "update") {
          return {
            ...recipe,
            proposedState: {
              ...recipe.proposedState,
              ingredients: recipe.proposedState.ingredients.map(
                (ing: ProposedRecipeIngredient, iIdx: number) =>
                  iIdx === ingredientIndex ? { ...ing, isRequired: !ing.isRequired } : ing
              ),
            },
          };
        }
        // Delete operations have no ingredients to toggle
        return recipe;
      }),
    });
  };

  const handleRemoveIngredient = (recipeIndex: number, ingredientIndex: number) => {
    setProposal({
      ...proposal,
      recipes: proposal.recipes.map((recipe, rIdx) => {
        if (rIdx !== recipeIndex) return recipe;

        if (recipe.operation === "create") {
          return {
            ...recipe,
            ingredients: recipe.ingredients.filter(
              (_: ProposedRecipeIngredient, iIdx: number) => iIdx !== ingredientIndex
            ),
          };
        } else if (recipe.operation === "update") {
          return {
            ...recipe,
            proposedState: {
              ...recipe.proposedState,
              ingredients: recipe.proposedState.ingredients.filter(
                (_: ProposedRecipeIngredient, iIdx: number) => iIdx !== ingredientIndex
              ),
            },
          };
        }
        // Delete operations have no ingredients to remove
        return recipe;
      }),
    });
  };

  // Collect all unrecognized items (delete operations don't have unrecognized)
  const allUnrecognized = proposal.recipes.flatMap((r) =>
    "unrecognized" in r ? r.unrecognized : []
  );
  const uniqueUnrecognized = [...new Set(allUnrecognized)];

  // Count operations
  const createCount = proposal.recipes.filter((r) => r.operation === "create").length;
  const updateCount = proposal.recipes.filter((r) => r.operation === "update").length;
  const deleteCount = proposal.recipes.filter((r) => r.operation === "delete").length;

  return (
    <FormModal isOpen={isOpen} onClose={handleClose} title="Review Recipes">
      <div className="space-y-6">
        {/* Transcription display */}
        {transcription && <LastHeardDisplay transcription={transcription} />}

        {/* Recipe cards */}
        {proposal.recipes.map((recipe, recipeIndex) => (
          <RecipeProposalCard
            key={recipeIndex}
            recipe={recipe}
            onRemove={() => handleRemoveRecipe(recipeIndex)}
            onToggleRequired={(iIdx) => handleToggleRequired(recipeIndex, iIdx)}
            onRemoveIngredient={(iIdx) => handleRemoveIngredient(recipeIndex, iIdx)}
          />
        ))}

        {/* Unrecognized Warning */}
        {uniqueUnrecognized.length > 0 && (
          <Alert status="warning">
            <div className="space-y-1">
              <p className="font-semibold">Couldn&apos;t match:</p>
              <p className="text-sm">{uniqueUnrecognized.join(", ")}</p>
              <p className="text-sm">These ingredients will be skipped.</p>
            </div>
          </Alert>
        )}

        {/* Empty state */}
        {proposal.recipes.length === 0 && (
          <p className="text-center text-gray-500 py-4">No recipes to save</p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={isSaving || proposal.recipes.length === 0}
            className={cn(
              "flex-1 border-black",
              proposal.recipes.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-black hover:bg-gray-800 text-white"
            )}
            size="lg"
          >
            {isSaving
              ? "Saving..."
              : proposal.recipes.length === 0
                ? "Save"
                : `Save ${[
                    createCount > 0 ? `${createCount} New` : "",
                    updateCount > 0 ? `${updateCount} Update` : "",
                    deleteCount > 0 ? `${deleteCount} Delete` : "",
                  ].filter(Boolean).join(" + ")}`}
          </Button>
          <Button variant="secondary" onClick={handleClose} disabled={isSaving} size="lg">
            Cancel
          </Button>
        </div>
      </div>
    </FormModal>
  );
}

interface RecipeProposalCardProps {
  recipe: RecipeToolResult;
  onRemove: () => void;
  onToggleRequired: (ingredientIndex: number) => void;
  onRemoveIngredient: (ingredientIndex: number) => void;
}

function RecipeProposalCard({
  recipe,
  onRemove,
  onToggleRequired,
  onRemoveIngredient,
}: RecipeProposalCardProps) {
  // Handle delete operation separately
  if (recipe.operation === "delete") {
    const deleteRecipe = recipe as DeleteRecipeResult;
    return (
      <div
        className={cn(
          "relative border-4 border-black p-4",
          "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          "bg-gradient-to-br from-red-200 to-red-300"
        )}
      >
        <SmallActionButton
          icon={X}
          variant="red"
          onClick={onRemove}
          title="Cancel deletion"
          className="absolute -top-3 -right-1"
        />

        <Badge variant="solid" size="sm" className="mb-2 bg-red-600">
          Delete
        </Badge>

        <h3 className="text-lg font-black truncate">{deleteRecipe.title}</h3>

        {deleteRecipe.reason && (
          <p className="text-sm font-bold text-black/70 mt-2">{deleteRecipe.reason}</p>
        )}
      </div>
    );
  }

  const isCreate = recipe.operation === "create";
  const title = isCreate ? recipe.title : recipe.proposedState.title;
  const description = isCreate ? recipe.description : recipe.proposedState.description;
  const ingredients: ProposedRecipeIngredient[] = isCreate
    ? recipe.ingredients
    : recipe.proposedState.ingredients;

  // Only show ingredients that have a matched ID
  const validIngredients = ingredients.filter((ing) => ing.ingredientId);

  return (
    <div
      className={cn(
        "relative border-4 border-black p-4",
        "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        isCreate ? "bg-gradient-to-br from-green-200 to-green-300" : "bg-gradient-to-br from-blue-200 to-blue-300"
      )}
    >
      {/* Remove button */}
      <SmallActionButton
        icon={X}
        variant="red"
        onClick={onRemove}
        title="Remove recipe"
        className="absolute -top-3 -right-1"
      />

      {/* Operation badge */}
      <Badge variant="solid" size="sm" className="mb-2">
        {isCreate ? "New Recipe" : "Update"}
      </Badge>

      <h3 className="text-lg font-black truncate">{title}</h3>

      {description && (
        <p className="text-sm font-bold text-black/70 mb-3 line-clamp-2">{description}</p>
      )}

      {/* Ingredients */}
      <div className="flex flex-wrap gap-2">
        {validIngredients.map((ing, idx) => (
          <Badge
            key={idx}
            variant="outline"
            size="sm"
            className="bg-white/50 cursor-pointer hover:bg-white/80 transition-colors group"
            onClick={() => onToggleRequired(ingredients.indexOf(ing))}
          >
            <span className={cn("mr-1", ing.isRequired ? "text-amber-500" : "text-gray-300")}>
              ★
            </span>
            {ing.name}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveIngredient(ingredients.indexOf(ing));
              }}
              className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove ingredient"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Warning for unmatched ingredients in this recipe */}
      {recipe.unrecognized.length > 0 && (
        <p className="text-xs text-orange-700 mt-2">
          Skipped: {recipe.unrecognized.join(", ")}
        </p>
      )}
    </div>
  );
}
