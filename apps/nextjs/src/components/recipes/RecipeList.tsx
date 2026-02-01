import { RecipeCard } from "./RecipeCard";

interface Recipe {
  id: string;
  title: string;
  description: string | null;
}

interface RecipeListProps {
  recipes: Recipe[];
  showActions?: boolean;
  onRecipeClick?: (recipeId: string) => void;
  onRecipeEdit?: (recipeId: string) => void;
  onRecipeDelete?: (recipeId: string) => void;
}

export function RecipeList(props: RecipeListProps) {
  const {
    recipes,
    showActions = false,
    onRecipeClick,
    onRecipeEdit,
    onRecipeDelete,
  } = props;

  if (recipes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No recipes yet. Add your first recipe to get started!
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          title={recipe.title}
          description={recipe.description}
          onClick={onRecipeClick ? () => onRecipeClick(recipe.id) : undefined}
          onEdit={onRecipeEdit ? () => onRecipeEdit(recipe.id) : undefined}
          onDelete={onRecipeDelete ? () => onRecipeDelete(recipe.id) : undefined}
          showActions={showActions}
        />
      ))}
    </div>
  );
}
