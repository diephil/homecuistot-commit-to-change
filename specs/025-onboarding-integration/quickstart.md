# Quickstart: 025-onboarding-integration

**Branch**: `025-onboarding-integration`

## Prerequisites

- Node.js 20+, pnpm
- `.env.local` with `GOOGLE_GENERATIVE_AI_API_KEY`, `OPENAI_API_KEY`, Supabase credentials
- Local Supabase running (`make sbstart`)

## Setup

```bash
cd apps/nextjs
pnpm install
pnpm dev
```

## Manual Testing Flow

1. **Reset state**: Clear browser localStorage, reset DB via `/app` "Reset user data" button
2. **Navigate**: Go to `http://localhost:3000/app` — should redirect to `/app/onboarding`
3. **Verify story flow**: Confirm Scene 1 (Sarah's dilemma) appears, not the old wizard
4. **Test voice/text input** (Scene 4):
   - Type: "I bought some eggs" → verify eggs appear with quantity "some" (2)
   - Type: "I have a lot of parmesan" → verify parmesan at "plenty" (3)
   - Type: "I bought butter" → verify butter at "plenty" (3, default)
5. **Cook action** (Scene 5→6): Click "I made this" → verify decrements
6. **Complete** (Scene 7): Click "Get started" → verify redirect to `/app/recipes`
7. **Verify DB**: Check user_inventory quantities match final story state
8. **Test buttons on /app**:
   - "Reset user data" → verify redirects to `/onboarding`, Scene 1
   - "Start Onboarding" → verify redirects to `/onboarding`, no DB call

## Key Files to Modify

| File | Change |
|------|--------|
| `app/(protected)/app/onboarding/page.tsx` | Import StoryOnboarding instead of OnboardingPageContent |
| `lib/agents/ingredient-extractor/prompt.ts` | Add quantityLevel extraction rules |
| `lib/agents/ingredient-extractor/agent.ts` | Use new schema with quantityLevel |
| `types/onboarding.ts` | Add StoryIngredientExtractionSchema |
| `lib/story-onboarding/types.ts` | Extend StoryCompleteRequestSchema |
| `app/api/onboarding/story/process-input/route.ts` | Return quantityLevel + fix Opik trace |
| `app/(protected)/app/onboarding/story/scenes/Scene4Voice.tsx` | Use returned quantityLevel |
| `app/(protected)/app/onboarding/story/scenes/Scene7Manifesto.tsx` | Include quantityLevel in payload |
| `lib/services/demo-data-prefill.ts` | Accept & use per-item quantityLevel |
| `components/app/ResetUserDataButton.tsx` | Add story localStorage cleanup |
| `components/app/StartDemoButton.tsx` | Rename + change to localStorage clear + redirect |

## No Database Migrations

All changes are application-layer. No new tables or columns needed.
