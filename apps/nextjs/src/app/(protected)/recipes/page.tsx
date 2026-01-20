import { Badge } from "@/components/retroui/Badge";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { PageContainer } from "@/components/PageContainer";
import { Plus } from "lucide-react";

// T044: MOCK_RECIPES constant (8 items)
const MOCK_RECIPES = [
  {
    id: "1",
    title: "Pasta Carbonara",
    description: "Classic Italian pasta with eggs, cheese, and bacon.",
    ingredients: ["Pasta", "Eggs", "Cheese", "Salt"],
  },
  {
    id: "2",
    title: "Chicken Stir Fry",
    description: "Quick and healthy stir fry with vegetables.",
    ingredients: ["Chicken Breast", "Bell Peppers", "Soy Sauce", "Rice"],
  },
  {
    id: "3",
    title: "Vegetable Soup",
    description: "Warm and comforting soup with fresh vegetables.",
    ingredients: ["Tomatoes", "Lettuce", "Salt", "Olive Oil"],
  },
  {
    id: "4",
    title: "Grilled Cheese Sandwich",
    description: "Crispy bread with melted cheese.",
    ingredients: ["Cheese", "Bread", "Butter"],
  },
  {
    id: "5",
    title: "Scrambled Eggs",
    description: "Fluffy scrambled eggs with a pinch of salt.",
    ingredients: ["Eggs", "Milk", "Salt"],
  },
  {
    id: "6",
    title: "Fried Rice",
    description: "Flavorful rice with vegetables and soy sauce.",
    ingredients: ["Rice", "Eggs", "Soy Sauce", "Bell Peppers"],
  },
  {
    id: "7",
    title: "Tomato Salad",
    description: "Fresh salad with tomatoes, lettuce, and olive oil.",
    ingredients: ["Tomatoes", "Lettuce", "Olive Oil"],
  },
  {
    id: "8",
    title: "Pancakes",
    description: "Fluffy pancakes with sugar and syrup.",
    ingredients: ["Flour", "Eggs", "Milk", "Sugar", "Syrup"],
  },
] as const;

export default function RecipesPage() {
  return (
    <PageContainer
      maxWidth="2xl"
      gradientFrom="from-purple-50"
      gradientVia="via-pink-50"
      gradientTo="to-rose-50"
    >
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Recipes</h1>
        </div>

        {/* T050: Responsive grid layout (3 cols desktop, 2 tablet, 1 mobile) */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* T047: "Add a new recipe" card */}
          <Card className="p-6 flex flex-col items-center justify-center gap-3 border-2 border-dashed hover:border-solid transition-all cursor-pointer">
            <Plus className="h-12 w-12 text-muted-foreground" />
            <Button variant="default">Add a new recipe</Button>
          </Card>

          {/* T046: Recipe cards with title, description, ingredient preview */}
          {MOCK_RECIPES.map((recipe) => (
            <Card key={recipe.id} className="p-4 flex flex-col gap-3">
              {/* T049: Truncate recipe titles */}
              <h3 className="truncate text-lg font-bold">{recipe.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {recipe.description}
              </p>

              {/* Ingredient list preview */}
              <div className="flex flex-wrap gap-1">
                {recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                  <Badge key={idx} variant="outline" size="sm">
                    {ingredient}
                  </Badge>
                ))}
                {recipe.ingredients.length > 3 && (
                  <Badge variant="outline" size="sm">
                    +{recipe.ingredients.length - 3} more
                  </Badge>
                )}
              </div>

              {/* T048: Edit/delete/mark as cooked CTAs (visual only, no handlers) */}
              <div className="flex flex-col gap-2 mt-auto">
                <Button variant="secondary" size="sm">
                  Mark as Cooked
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
