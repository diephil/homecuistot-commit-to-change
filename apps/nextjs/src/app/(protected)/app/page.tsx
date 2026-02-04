import { redirect, RedirectType } from 'next/navigation'
import { getRecipesWithAvailability, getCookingHistory, getUserCounts } from '@/app/actions/cooking-log'

export const dynamic = 'force-dynamic'
import { RecipeSection } from './recipe-section'
import { CookingHistoryTable } from '@/components/app/CookingHistoryTable'
import { ResetUserDataButton } from '@/components/app/ResetUserDataButton'
import { AppPageHeader } from '@/components/app/AppPageHeader'

export default async function AppPage() {
  // T005-T006: Check recipe/inventory count and redirect if both are zero
  try {
    const { recipeCount, inventoryCount } = await getUserCounts()
    if (recipeCount === 0 && inventoryCount === 0) {
      redirect('/app/onboarding', RedirectType.replace)
    }
  } catch (error) {
    // Re-throw redirect errors (Next.js uses error throwing for redirects)
    const isRedirect = error instanceof Error &&
      (error.message.includes('NEXT_REDIRECT') || (error as { digest?: string }).digest?.startsWith('NEXT_REDIRECT'))
    if (isRedirect) {
      throw error
    }
    console.error('[app/page] Failed to get user counts:', error)
  }

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
          title="Ready To Cook!"
          subtitle="You have all the ingredients in your inventory for these recipes, start cooking!"
          recipes={availableRecipes}
          variant="available"
          emptyMessage="No recipes available with your current inventory."
        />

        <RecipeSection
          title="Missing a Few Ingredients For These Recipes"
          subtitle="You're missing a few ingredients for these recipes, add them to your inventory to cook them!"
          recipes={almostAvailableRecipes}
          variant="almost-available"
          emptyMessage="No recipes are almost available right now."
        />

        <section>
          <CookingHistoryTable entries={cookingHistory} />
        </section>

        <section className="flex justify-center gap-4 pt-8">
          <ResetUserDataButton />
        </section>
      </div>
    </div>
  )
}
