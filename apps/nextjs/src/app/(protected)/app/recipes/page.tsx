"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/retroui/Button";
import { RecipeList } from "@/components/recipes/recipe-list";
import { RecipeForm } from "@/components/recipes/recipe-form";
import { getRecipes } from "@/app/actions/recipes";

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
    ingredient: {
      id: string;
      name: string;
      category: string;
    };
  }>;
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  function handleRecipeClick(recipeId: string) {
    setSelectedRecipeId(recipeId);
    setIsFormOpen(true);
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
    <PageContainer maxWidth="2xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Recipes</h1>
          <Button onClick={handleAddRecipe}>Add Recipe</Button>
        </div>

        {isLoading ? (
          <p className="text-center py-8 text-muted-foreground">
            Loading recipes...
          </p>
        ) : (
          <RecipeList
            recipes={displayRecipes}
            variant="interactive"
            onRecipeClick={handleRecipeClick}
          />
        )}

        {isFormOpen && (
          <RecipeForm
            recipe={selectedRecipe}
            onClose={handleFormClose}
          />
        )}
      </div>
    </PageContainer>
  );
}
