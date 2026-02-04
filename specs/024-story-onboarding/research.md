# Research: Story-Based Onboarding

## R1: Voice Input Without DB Persistence

**Decision**: Create a dedicated `/api/onboarding/story/process-voice` route that reuses `processVoiceInput()` + `validateIngredientNames()` but skips the inventory-manager agent pipeline entirely.

**Rationale**: The existing inventory page uses a full ADK agent pipeline (transcription → LLM agent → update_matching_ingredients tool → proposal modal → apply-proposal). For the story onboarding, we only need: transcription → ingredient name extraction → name validation against ingredients table → return recognized names. The existing onboarding `process-voice` route (`/api/onboarding/process-voice`) already does exactly this — calls `processVoiceInput()` and `validateIngredientNames()`. We clone this pattern into `/api/onboarding/story/process-voice`.

**Alternatives considered**:
- Reuse `/api/onboarding/process-voice` directly: Rejected because it requires `currentContext` with existing ingredient lists (designed for the multi-step onboarding), and we want a cleaner separation.
- Reuse `/api/inventory/agent-proposal`: Rejected because it involves the full ADK agent pipeline, writes to session state, and returns a proposal format incompatible with our in-memory-only needs.

## R2: localStorage State Management

**Decision**: Single `useStoryState` hook manages all demo state in localStorage with key `homecuistot:story-onboarding`. State shape: `{ currentScene: number, demoInventory: DemoInventoryItem[], demoRecipe: DemoRecipe, voiceInputsDone: boolean }`.

**Rationale**: Simple JSON blob in localStorage. On mount, read and hydrate. On every state change, write-through. `useState` + `useEffect` for sync. No need for a state library.

**Alternatives considered**:
- sessionStorage: Rejected because spec requires persistence across page refreshes and tab closes.
- zustand/jotai with persist: Over-engineered for 1 state blob.
- Multiple localStorage keys: Unnecessary fragmentation.

## R3: Scene Transition Animations

**Decision**: CSS-only fade transitions using opacity + Tailwind's `transition-opacity duration-500`. `useFadeTransition` hook manages phase: `'fade-out' → 'hidden' → 'fade-in'`. Scene change triggers fade-out, swap content during hidden phase, then fade-in.

**Rationale**: Pure CSS transitions are 60fps, no JS animation library needed. Tailwind classes keep it consistent with the codebase.

**Alternatives considered**:
- Framer Motion: Heavy dependency for simple opacity transitions.
- React Transition Group: Extra dep, CSS approach sufficient.
- CSS `@starting-style`: Limited browser support.

## R4: Progressive Text Fade-In

**Decision**: Split storytelling text into segments (sentences or paragraphs). Each segment gets a staggered `animation-delay` using CSS `@keyframes fadeIn`. Rendered as spans/divs with `opacity: 0` initially, each animating to `opacity: 1` with increasing delay (e.g., 0s, 0.4s, 0.8s, 1.2s).

**Rationale**: CSS-only, performant, no JS timers. Segments defined in constants file alongside scene content.

**Alternatives considered**:
- Character-by-character typewriter: Too slow for storytelling, feels gimmicky.
- IntersectionObserver: Overkill for sequential reveal.
- JS setInterval: Unnecessary when CSS animation-delay achieves the same result.

## R5: Read-Only InventorySection Reuse

**Decision**: Pass `undefined` for all interaction callbacks (`onQuantityChange`, `onToggleStaple`, `onDelete`) and create a wrapper that maps `DemoInventoryItem[]` → `InventoryDisplayItem[]`. The `InventoryItemBadge` already gracefully hides action buttons when callbacks are undefined (infinity button only shows when `onToggleStaple` is provided, dismiss only shows when `onDismiss` is provided).

**Rationale**: Existing components handle read-only mode naturally through optional callbacks. No modifications needed to shared components.

**Alternatives considered**:
- Add a `readOnly` prop to InventorySection: Unnecessary — undefined callbacks already disable interactions.
- Fork the component: Violates DRY.

## R6: RecipeAvailabilityCard Reuse

**Decision**: Build `RecipeWithAvailability` objects from demo constants. Scene 2 uses `variant="almost-available"` with eggs/parmesan marked `inInventory: false`. Scene 5 uses `variant="available"` with all ingredients `inInventory: true`. No `onMarkAsCooked` callback on Scene 2; Scene 5 passes a callback that triggers Scene 6.

**Rationale**: Existing card component handles both variants. We construct the data shape client-side from constants + localStorage state.

**Alternatives considered**: None — direct reuse is the obvious path.

## R7: Completion Route & Brand-New User Detection

**Decision**: New `/api/onboarding/story/complete` route. On POST:
1. Auth check
2. Count user's `user_inventory` rows and `user_recipes` rows
3. If both are 0 → pre-fill demo data (inventory items + carbonara recipe) in a transaction, return `{ isNewUser: true, success: true }`
4. If either > 0 → return `{ isNewUser: false, success: true }` (no data written)

Frontend uses `isNewUser` to decide: show loading screen (new) or redirect immediately (returning).

**Rationale**: Server-side detection is the only reliable way to check brand-new status (can't trust client-side). Reuses the transaction pattern from existing `/api/onboarding/complete` route. The demo data (inventory items + carbonara recipe) is sent from the client in the request body so the server persists exactly what the user saw during the demo.

**Alternatives considered**:
- Separate status-check endpoint + persist endpoint: Two round trips, unnecessary.
- Client-side detection via existing `/api/onboarding/status`: That only checks a boolean, not the inventory/recipe counts needed here.

## R9: Entry Point — Replace Old Onboarding Redirect

**Decision**: Change the brand-new user redirect in `app/(protected)/app/page.tsx` from `/app/onboarding` to `/app/onboarding/story`. Add similar redirect guards to inventory and recipes pages for brand-new users who navigate directly.

**Rationale**: Story onboarding replaces the old flow for brand-new users. Users who already have data (returning users) never see the redirect. The old onboarding route (`/app/onboarding`) continues to exist but is no longer the default entry.

**Alternatives considered**:
- Middleware-level redirect: Over-engineered — only 3 pages need the guard and the pattern already exists in `page.tsx`.
- Layout-level guard: Would affect all `/app/*` routes including the story onboarding itself, causing redirect loops.

## R10: Restart Demo — Client-Only Reset

**Decision**: "Restart demo" clears `localStorage.removeItem('homecuistot:story-onboarding')` and resets React state. No server call needed.

**Rationale**: No demo data was written to the server during the flow. All state is client-side. Simple and instant.

## R11: Scene 7 Dual CTAs

**Decision**: Two CTAs on manifesto screen:
1. "Get started →" — calls `/api/onboarding/story/complete` (pre-fills for new users) → redirect to `/app`
2. "Tell us what you can cook blindfolded!" — also calls complete route, then redirects to `/app/recipes`

Both CTAs trigger the same completion logic (pre-fill if brand-new). The difference is the redirect destination.

**Rationale**: Gives users choice between exploring the app with pre-filled data or immediately adding their own recipes. Both paths need the completion call so brand-new users always get seeded data.

## R8: Demo Data Constants

**Decision**: Define in `lib/story-onboarding/constants.ts`:
- `SARAH_TRACKED_INGREDIENTS`: 7 items with name, category, quantityLevel (e.g., Pasta: 3, Bacon: 2, Tomatoes: 1, Onion: 3, Garlic: 2, Cream: 1, Butter: 2)
- `SARAH_PANTRY_STAPLES`: 3 items (Salt, Black pepper, Olive oil)
- `CARBONARA_RECIPE`: { name, description, ingredients with types }
- `REQUIRED_ITEMS`: ['eggs', 'parmesan'] (progression gate)
- Scene text content as string arrays for progressive fade-in

**Rationale**: Centralized, easy to adjust. Ingredient names must match the `ingredients` table exactly (case-insensitive lookup on server).

**Alternatives considered**: Fetch from DB at page load — rejected, adds latency and complexity for static demo data.
