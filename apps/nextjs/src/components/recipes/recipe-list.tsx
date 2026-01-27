import { RecipeCard } from "./recipe-card";

interface Recipe {
  id: string;
  title: string;
  description: string | null;
}

interface RecipeListProps {
  recipes: Recipe[];
  variant?: "interactive" | "summary";
  onRecipeClick?: (recipeId: string) => void;
}

export function RecipeList(props: RecipeListProps) {
  const { recipes, variant = "summary", onRecipeClick } = props;

  if (recipes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No recipes yet. Add your first recipe to get started!
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          title={recipe.title}
          description={recipe.description}
          variant={variant}
          onClick={
            variant === "interactive" && onRecipeClick
              ? () => onRecipeClick(recipe.id)
              : undefined
          }
        />
      ))}
    </div>
  );
}
