"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/PageContainer";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { RecipeHelpModal } from "@/components/recipes/HelpModal";
import { RecipeVoiceGuidanceCard } from "@/components/recipes/VoiceGuidanceCard";
import { NeoHelpButton } from "@/components/shared/NeoHelpButton";
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import { VoiceTextInput, Separator, SectionHeader } from "@/components/shared";
import { getRecipes, deleteRecipe } from "@/app/actions/recipes";
import { toast } from "sonner";

interface Recipe {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  recipeIngredients: Array<{
    id: string;
    ingredientType: string;
    ingredientId: string | null;
    unrecognizedItemId: string | null;
    ingredient: {
      id: string;
      name: string;
      category: string;
    } | null;
  }>;
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadRecipes();
  }, []);

  async function loadRecipes() {
    try {
      setIsLoading(true);
      const data = await getRecipes();
      setRecipes(data);
    } catch (error) {
      console.error("Failed to load recipes:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleRecipeEdit(recipeId: string) {
    setSelectedRecipeId(recipeId);
    setIsFormOpen(true);
  }

  function handleRecipeDeleteClick(recipe: Recipe) {
    setRecipeToDelete(recipe);
    setDeleteModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!recipeToDelete) return;

    try {
      setIsDeleting(true);
      await deleteRecipe({ recipeId: recipeToDelete.id });
      toast.success("Recipe deleted successfully");
      setDeleteModalOpen(false);
      setRecipeToDelete(null);
      loadRecipes();
    } catch (error) {
      console.error("Failed to delete recipe:", error);
      toast.error("Failed to delete recipe");
    } finally {
      setIsDeleting(false);
    }
  }

  function handleCancelDelete() {
    setDeleteModalOpen(false);
    setRecipeToDelete(null);
  }

  function handleFormClose(changed?: boolean) {
    setIsFormOpen(false);
    setSelectedRecipeId(null);
    if (changed) {
      loadRecipes();
    }
  }

  // Voice/text input handler (non-functional for now)
  const handleVoiceTextSubmit = async (
    _result: { type: "voice"; audioBlob: Blob } | { type: "text"; text: string }
  ) => {
    // TODO: Implement voice/text recipe creation
    toast.info("Voice recipe creation coming soon!");
  };

  const selectedRecipe = selectedRecipeId
    ? recipes.find((r) => r.id === selectedRecipeId)
    : null;

  if (isLoading) {
    return (
      <PageContainer
        maxWidth="4xl"
        gradientFrom="from-yellow-50"
        gradientVia="via-amber-50"
        gradientTo="to-orange-50"
      >
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      maxWidth="4xl"
      gradientFrom="from-yellow-50"
      gradientVia="via-amber-50"
      gradientTo="to-orange-50"
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Recipes</h1>
          <NeoHelpButton
            renderModal={({ isOpen, onClose }) => (
              <RecipeHelpModal isOpen={isOpen} onClose={onClose} />
            )}
          />
        </div>

        {/* Voice Input Section */}
        <div className="space-y-4">
          <RecipeVoiceGuidanceCard />

          <VoiceTextInput
            onSubmit={handleVoiceTextSubmit}
            disabled={false}
            processing={false}
            textPlaceholder="Describe your recipe with ingredients..."
          />
        </div>

        <Separator />

        {/* Tracked Recipes Section */}
        <section className="space-y-4">
          <SectionHeader
            title="Tracked Recipes"
            description={
              <>
                <span className="text-amber-500">★</span> marks mandatory ingredients, others are optional and the recipe can still be made without them.
              </>
            }
          />

          {recipes.length === 0 ? (
          <div className="text-center py-4 space-y-2">
            <p className="text-lg text-gray-600">No recipes yet</p>
            <p className="text-sm text-gray-500">
              Speak or type to add your first recipe
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onEdit={() => handleRecipeEdit(recipe.id)}
                onDelete={() => handleRecipeDeleteClick(recipe)}
              />
            ))}
          </div>
        )}
        </section>

        {isFormOpen && (
          <RecipeForm
            recipe={selectedRecipe}
            onClose={handleFormClose}
          />
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        itemName={recipeToDelete?.name || ""}
        itemType="recipe"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />
    </PageContainer>
  );
}
