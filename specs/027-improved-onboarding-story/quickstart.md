# Quickstart: 027 Improved Onboarding Story

## Prerequisites

- Node.js 18+, pnpm
- `apps/nextjs/.env.local` with all keys (Supabase, Google AI, Opik)
- `make dev` or `pnpm dev` from `apps/nextjs/`

## Development Flow

```bash
# 1. Ensure on correct branch
git checkout 027-improved-onboarding-story

# 2. Start dev server
cd apps/nextjs && pnpm dev

# 3. Navigate to onboarding
# Open http://localhost:3000/app/onboarding/story
# (Must be logged in via Supabase Auth)
```

## Key Files to Edit

### Backend (modify)
- `src/lib/orchestration/recipe-update.orchestration.ts` — add `additionalTags` param
- `src/app/api/onboarding/process-recipe/route.ts` — pass `additionalTags` through

### Frontend - State & Types (modify)
- `src/lib/story-onboarding/types.ts` — extend `StoryOnboardingState`
- `src/lib/story-onboarding/constants.ts` — update scene text, add `REQUIRED_RECIPE_ITEMS`
- `src/lib/story-onboarding/transforms.ts` — add `hasRequiredRecipeItems()`
- `src/app/(protected)/app/onboarding/story/hooks/useStoryState.ts` — extend state shape + methods

### Frontend - Scenes (create/modify/delete)
- `scenes/Scene1Dilemma.tsx` — no code change (text change via constants)
- `scenes/Scene2Inventory.tsx` — **delete**
- `scenes/Scene3Store.tsx` — **delete**
- `scenes/Scene2RecipeVoice.tsx` — **create** (mirror Scene4Voice pattern)
- `scenes/Scene3StoreKitchen.tsx` — **create** (merge old Scene2+Scene3)
- `scenes/Scene7YourRecipes.tsx` — **create** (mirror Scene4Voice pattern for recipes)
- `scenes/Scene7Manifesto.tsx` → `scenes/Scene8Manifesto.tsx` — **rename** + modify payload/redirect

### Frontend - Orchestrator (modify)
- `story/StoryOnboarding.tsx` — update scene routing (8 scenes)
- `story/StoryProgressBar.tsx` — update from 7 to 8 segments

## Testing

1. **Scene 2**: Say/type "I can cook my family's pasta carbonara with some bacon and parmesan". Verify gate validates ingredients. Verify retry with missing ingredients.
2. **Scene 3**: Verify store narrative + kitchen display with AI-extracted recipe.
3. **Scene 7**: Add 1+ recipe via voice/text. Verify counter and Continue gate.
4. **Scene 8**: Click "Get started". Verify redirect to `/app`. Check DB for persisted recipes.
5. **Opik**: Verify Scene 2 traces have `onboarding-story-scene2` tag, Scene 7 have `onboarding-story-scene7`.

## Architecture Notes

- No new API routes. Reuse `/api/onboarding/process-recipe`.
- No DB schema changes. Existing tables handle multiple recipes.
- All state lives in localStorage during flow. DB persistence only on completion.
- New scenes mirror Scene4Voice UI patterns (VoiceTextInput, success/urgency banners, fade-in animations).
