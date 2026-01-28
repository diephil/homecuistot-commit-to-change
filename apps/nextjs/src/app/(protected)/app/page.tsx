import { getRecipesWithAvailability, getCookingHistory } from '@/app/actions/cooking-log'
import { RecipeSection } from './recipe-section'
import { CookingHistoryTable } from '@/components/app/cooking-history-table'

export default async function AppPage() {
  const recipes = await getRecipesWithAvailability()
  const cookingHistory = await getCookingHistory()

  const availableRecipes = recipes.filter((r) => r.availability === 'available')
  const almostAvailableRecipes = recipes.filter((r) => r.availability === 'almost-available')

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-6">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        <RecipeSection
          title="Available Recipes"
          recipes={availableRecipes}
          variant="available"
          emptyMessage="No recipes available with your current inventory."
        />

        <RecipeSection
          title="Almost Available Recipes"
          subtitle="You're missing just a few ingredients for these recipes"
          recipes={almostAvailableRecipes}
          variant="almost-available"
          emptyMessage="No recipes are almost available right now."
        />

        <section>
          <CookingHistoryTable entries={cookingHistory} />
        </section>
      </div>
    </div>
  )
}
