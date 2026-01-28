import { getRecipesWithAvailability, getCookingHistory } from '@/app/actions/cooking-log'
import { RecipeSection } from './recipe-section'
import { CookingHistoryTable } from '@/components/app/cooking-history-table'
import { ResetUserDataButton } from '@/components/app/reset-user-data-button'
import { StartDemoButton } from '@/components/app/start-demo-button'
import { AppPageHeader } from '@/components/app/app-page-header'

export default async function AppPage() {
  const recipes = await getRecipesWithAvailability()
  const cookingHistory = await getCookingHistory()

  const availableRecipes = recipes.filter((r) => r.availability === 'available')

  // Get top 6 recipes with fewest missing anchor ingredients (sorted ascending)
  const almostAvailableRecipes = recipes
    .filter((r) => r.missingAnchorCount > 0)
    .sort((a, b) => a.missingAnchorCount - b.missingAnchorCount)
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-6">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        <AppPageHeader />

        <RecipeSection
          title="Ready To Cook Recipes"
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

        <section className="flex justify-center gap-4 pt-8">
          <StartDemoButton />
          <ResetUserDataButton />
        </section>
      </div>
    </div>
  )
}
