# Quickstart: Story-Based Onboarding

## Prerequisites

- Node.js 20+, pnpm
- Local Supabase running (`make sbstart`)
- `.env.local` configured with `GOOGLE_GENERATIVE_AI_API_KEY`
- Existing DB with ingredients table populated

## Run

```bash
cd apps/nextjs
pnpm dev
```

Navigate to: `http://localhost:3000/app/onboarding/story`

## Development Flow

1. **Constants first**: Define Sarah's inventory + carbonara recipe in `lib/story-onboarding/constants.ts`
2. **State hook**: Implement `useStoryState` with localStorage persistence
3. **Scene shell**: Build `StoryOnboarding.tsx` orchestrator with fade transitions
4. **Static scenes**: Scenes 1, 2, 3 (progressive text, InventorySection, RecipeAvailabilityCard)
5. **Voice scene**: Scene 4 (VoiceTextInput + process-voice route)
6. **Cook scenes**: Scenes 5-6 (available card + decrement display)
7. **Manifesto**: Scene 7 (CTAs + complete route)

## Key Files

| File | Purpose |
|------|---------|
| `app/(protected)/app/onboarding/story/page.tsx` | Route entry |
| `app/(protected)/app/onboarding/story/StoryOnboarding.tsx` | Main orchestrator |
| `app/(protected)/app/onboarding/story/scenes/*.tsx` | 7 scene components |
| `app/(protected)/app/onboarding/story/hooks/useStoryState.ts` | localStorage state |
| `app/(protected)/app/onboarding/story/hooks/useFadeTransition.ts` | Fade animations |
| `app/api/onboarding/story/process-voice/route.ts` | Voice API (no DB) |
| `app/api/onboarding/story/complete/route.ts` | Completion + pre-fill API |
| `lib/story-onboarding/constants.ts` | Demo data + scene content |

## Testing Manually

1. Open `/app/onboarding/story` while logged in
2. Tap through scenes 1-3 (verify progressive text fade-in, recipe card, inventory badges)
3. Scene 4: tap mic, say "I bought eggs, parmesan, and milk"
4. Verify: inventory updates, Continue enables
5. Scene 5: verify recipe shows READY
6. Tap "I made this" → Scene 6 decrement modal
7. Tap "Got it" → Scene 7 manifesto
8. "Get started" → loading screen (if brand-new) → redirect to /app
9. Refresh mid-flow → verify resume from last scene
10. "Restart demo" → verify returns to Scene 1

## Reused Components (DO NOT MODIFY)

- `InventorySection` — pass undefined callbacks for read-only
- `RecipeAvailabilityCard` — construct RecipeWithAvailability from demo data
- `InventoryItemBadge` — rendered by InventorySection (no direct use)
- `VoiceTextInput` — shared mic/text input component
- `useVoiceInput` — audio recording hook
