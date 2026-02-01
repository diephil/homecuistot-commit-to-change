"use client";

import { RecipeCreateForm } from "./RecipeCreateForm";
import { RecipeEditForm } from "./RecipeEditForm";

interface RecipeFormProps {
  recipe?: {
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
  } | null;
  onClose: () => void;
}

export function RecipeForm(props: RecipeFormProps) {
  const { recipe, onClose } = props;

  if (recipe) {
    return <RecipeEditForm recipe={recipe} onClose={onClose} />;
  }

  return <RecipeCreateForm onClose={onClose} />;
}
