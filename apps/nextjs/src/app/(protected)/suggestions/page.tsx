import { Badge } from "@/components/retroui/Badge";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { PageContainer } from "@/components/PageContainer";
import Link from "next/link";

// T030: MOCK_RECIPES constant (8 items with id, title, description, ingredients, isAvailable)
const MOCK_RECIPES = [
  {
    id: "1",
    title: "Pasta Carbonara",
    description: "Classic Italian pasta with eggs, cheese, and bacon.",
    ingredients: ["Pasta", "Eggs", "Cheese", "Salt"],
    isAvailable: true,
  },
  {
    id: "2",
    title: "Chicken Stir Fry",
    description: "Quick and healthy stir fry with vegetables.",
    ingredients: ["Chicken Breast", "Bell Peppers", "Soy Sauce", "Rice"],
    isAvailable: true,
  },
  {
    id: "3",
    title: "Vegetable Soup",
    description: "Warm and comforting soup with fresh vegetables.",
    ingredients: ["Tomatoes", "Lettuce", "Salt", "Olive Oil"],
    isAvailable: false,
  },
  {
    id: "4",
    title: "Grilled Cheese Sandwich",
    description: "Crispy bread with melted cheese.",
    ingredients: ["Cheese", "Bread", "Butter"],
    isAvailable: false,
  },
  {
    id: "5",
    title: "Scrambled Eggs",
    description: "Fluffy scrambled eggs with a pinch of salt.",
    ingredients: ["Eggs", "Milk", "Salt"],
    isAvailable: true,
  },
  {
    id: "6",
    title: "Fried Rice",
    description: "Flavorful rice with vegetables and soy sauce.",
    ingredients: ["Rice", "Eggs", "Soy Sauce", "Bell Peppers"],
    isAvailable: true,
  },
  {
    id: "7",
    title: "Tomato Salad",
    description: "Fresh salad with tomatoes, lettuce, and olive oil.",
    ingredients: ["Tomatoes", "Lettuce", "Olive Oil"],
    isAvailable: true,
  },
  {
    id: "8",
    title: "Pancakes",
    description: "Fluffy pancakes with sugar and syrup.",
    ingredients: ["Flour", "Eggs", "Milk", "Sugar", "Syrup"],
    isAvailable: false,
  },
] as const;

export default function SuggestionsPage() {
  // T032: Filter available recipes
  const availableRecipes = MOCK_RECIPES.filter((r) => r.isAvailable);
  // T033: Filter almost-available recipes
  const almostAvailableRecipes = MOCK_RECIPES.filter((r) => !r.isAvailable);

  return (
    <PageContainer
      maxWidth="2xl"
      gradientFrom="from-green-50"
      gradientVia="via-emerald-50"
      gradientTo="to-teal-50"
    >
      <div className="space-y-8">
        {/* Header with navigation CTAs */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Recipe Suggestions</h1>
          {/* T035: Navigation CTAs */}
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/inventory">View Inventory</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/recipes">All Recipes</Link>
            </Button>
          </div>
        </div>

        {/* T032: Available Recipes section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Available Recipes</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableRecipes.map((recipe) => (
              <Card key={recipe.id} className="p-4">
                {/* T036: Truncate recipe titles */}
                <h3 className="truncate text-lg font-bold mb-2">
                  {recipe.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {recipe.description}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {recipe.ingredients.map((ingredient, idx) => (
                    <Badge key={idx} variant="outline" size="sm">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
                {/* T034: Mark as Cooked CTA (visual only) */}
                <Button variant="default" size="sm" className="w-full">
                  Mark as Cooked
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* T033: Almost Available Recipes section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Almost Available Recipes</h2>
          <p className="text-sm text-muted-foreground">
            You&apos;re missing just a few ingredients for these recipes
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {almostAvailableRecipes.map((recipe) => (
              <Card key={recipe.id} className="p-4 opacity-75">
                <h3 className="truncate text-lg font-bold mb-2">
                  {recipe.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {recipe.description}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {recipe.ingredients.map((ingredient, idx) => (
                    <Badge key={idx} variant="outline" size="sm">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
                <Button variant="secondary" size="sm" className="w-full">
                  View Recipe
                </Button>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
