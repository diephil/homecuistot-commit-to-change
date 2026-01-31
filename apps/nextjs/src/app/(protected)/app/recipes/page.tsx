"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/retroui/Button";
import { RecipeList } from "@/components/recipes/recipe-list";
import { RecipeForm } from "@/components/recipes/recipe-form";
import { RecipeHelpModal } from "@/components/recipes/help-modal";
import { NeoHelpButton } from "@/components/shared/neo-help-button";
import { DeleteConfirmationModal } from "@/components/shared/delete-confirmation-modal";
import { getRecipes, deleteRecipe } from "@/app/actions/recipes";
import { Plus } from "lucide-react";
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

  function handleAddRecipe() {
    setSelectedRecipeId(null);
    setIsFormOpen(true);
  }

  function handleRecipeEdit(recipeId: string) {
    setSelectedRecipeId(recipeId);
    setIsFormOpen(true);
  }

  function handleRecipeDeleteClick(recipeId: string) {
    const recipe = recipes.find((r) => r.id === recipeId);
    if (recipe) {
      setRecipeToDelete(recipe);
      setDeleteModalOpen(true);
    }
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

  function handleFormClose() {
    setIsFormOpen(false);
    setSelectedRecipeId(null);
    loadRecipes();
  }

  const selectedRecipe = selectedRecipeId
    ? recipes.find((r) => r.id === selectedRecipeId)
    : null;

  const displayRecipes = recipes.map((r) => ({
    id: r.id,
    title: r.name,
    description: r.description,
  }));

  return (
    <PageContainer maxWidth="4xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Recipes</h1>
          <div className="flex gap-2">
            <NeoHelpButton
              renderModal={({ isOpen, onClose }) => (
                <RecipeHelpModal isOpen={isOpen} onClose={onClose} />
              )}
            />
            <Button
              variant="default"
              size="md"
              className="gap-2 bg-black text-white hover:bg-gray-800 border-black"
              onClick={handleAddRecipe}
            >
              <Plus className="h-5 w-5" />
              Add Recipe
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-center py-8 text-muted-foreground">
            Loading recipes...
          </p>
        ) : (
          <RecipeList
            recipes={displayRecipes}
            showActions
            onRecipeEdit={handleRecipeEdit}
            onRecipeDelete={handleRecipeDeleteClick}
          />
        )}

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
