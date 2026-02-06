# Landing Page Revamp — Final Implementation Spec

**Target file:** `src/app/page.tsx`
**New component:** `src/components/landing/LandingRecipeCard.tsx`
**Existing components reused:** `Header`, `Text`, `Button`, `Badge`, `Footer` (all from `@/components/shared`)
**No backend changes. No new routes. No new dependencies.**

---

## Design Constraints

- **Fonts:** Geist (current). No change.
- **Color palette:** Current pink/cyan/yellow/orange. No change.
- **Gradients:** Keep on section backgrounds. Cards and interactive elements stay flat with hard shadows.
- **Decorative shapes:** Keep the floating rotated squares/rectangles.
- **Neo-brutal primitives:** Thick black borders (2-4px), hard offset shadows (`shadow-[Npx_Npx_0px_0px_rgba(0,0,0,1)]`), bold typography, button press animation (shadow collapse + translate on hover/active).
- **Responsive:** Same pattern as current page — mobile-first with `md:` breakpoints. Reduce shadow offsets on mobile.

---

## Section-by-Section Specification

### Section 1 — Hero (break the assumption)

**Background:** `bg-amber-50` base page, hero section with `bg-gradient-to-br from-pink-200 via-yellow-200 to-cyan-200 opacity-50` overlay (same as current).

**Layout:** Centered text stack, same max-width and padding as current.

**Elements (top to bottom):**

1. **Eyebrow tag** — Yellow chip, attention-grabbing negation.
   - Copy: `Not a recipe app.`
   - Style: `inline-block bg-yellow-300 border-2 border-black px-4 md:px-6 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:rotate-2`
   - Font: `text-sm md:text-xl font-black uppercase font-head`

2. **Headline** — Ownership language, outcome-focused.
   - Copy: `Your kitchen already knows what's for dinner`
   - Use `<Text as="h2">` with existing massive sizing classes (`text-3xl md:text-7xl lg:text-8xl font-black uppercase`)
   - Keep the slight rotation (`md:transform md:-rotate-1`)

3. **Subheadline** — One-sentence bridge from pain to solution.
   - Copy: `You have 15 go-to dishes and a fridge full of ingredients. HomeCuistot connects the two.`
   - Use `<Text as="p">` with `text-lg md:text-3xl font-black text-zinc-800`

4. **CTA button** — Action that matches the correct mental model.
   - Copy: `Start with your recipes →`
   - Links to `/login`
   - Same Button styling as current hero CTA (pink-400, thick border, large shadow, press animation)

**What changes from current:**
- Eyebrow: `🤖 AI-Powered Voice Assistant for Home Cooks` → `Not a recipe app.`
- Headline: `From "What's in my fridge?" to "What's for dinner?"` → `Your kitchen already knows what's for dinner`
- Subheadline: `See what you can cook — instantly.` → `You have 15 go-to dishes and a fridge full of ingredients. HomeCuistot connects the two.`
- CTA: `Get Started Free →` → `Start with your recipes →`

---

### Section 2 — The Reframe (what this actually is)

**Background:** `bg-gradient-to-r from-orange-300 via-orange-400 to-orange-300` with `border-t-4 md:border-t-8 border-b-4 md:border-b-8 border-black`. Keep floating decorative shapes.

**Layout:** Centered white card with thick border and hard shadow (same pattern as current "problem" section).

**Elements:**

1. **Headline** — The bridge question.
   - Copy: `You know those 10–15 dinners you rotate through?`
   - `<Text as="h3">` with `text-2xl md:text-5xl font-black uppercase text-center`

2. **Body text** — Explain the actual product in one paragraph.
   - Copy: `The ones you could make in your sleep? HomeCuistot is the only app that starts there — with your dishes, not someone else's. Tell it what you cook, keep your kitchen updated, and it shows you which of your meals are ready tonight.`
   - `<Text as="p">` with `text-center text-base md:text-2xl font-bold leading-relaxed`

**What changes from current:**
- Replaces the "The problem isn't cooking — it's deciding what to cook" section with a product explanation that actually differentiates.

---

### Section 3 — Anti-Positioning (what we're NOT)

**Background:** `bg-gradient-to-br from-cyan-300 via-blue-300 to-cyan-300` with borders. Keep floating decorative shapes.

**Layout:** Section title + two-column comparison on `md:`, stacked on mobile. Below: a knockout line.

**Elements:**

1. **Section title**
   - Copy: `What makes this different`
   - `<Text as="h3">` centered, same sizing as current section titles

2. **Two-column comparison** — `grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10`

   **Left column — "Recipe Apps":**
   - Card with `border-4 md:border-6 border-black bg-gray-100 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10`
   - Title: `❌ Recipe Apps` in `text-xl md:text-3xl font-black uppercase text-gray-400`
   - List items in `text-lg md:text-2xl font-bold text-gray-400 line-through`:
     - `Browse 2 million recipes`
     - `"Get inspired by new ideas"`
     - `Suggest strangers' dishes`
     - `You open the app, you scroll`

   **Right column — "HomeCuistot":**
   - Card with `border-4 md:border-6 border-black bg-gradient-to-br from-green-200 to-green-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10`
   - Title: `✅ HomeCuistot` in `text-xl md:text-3xl font-black uppercase`
   - List items in `text-lg md:text-2xl font-bold`:
     - `Your 15 go-to dishes`
     - `"Can I make it tonight?"`
     - `Track your own ingredients`
     - `Open the app, see what's ready`

   **Mobile order:** HomeCuistot column FIRST (positive), recipe apps SECOND (negative). Use `md:order-last` on the recipe apps column or `order-first` on HomeCuistot column.

3. **Knockout line** — Below the comparison grid.
   - Copy: `Your dishes. Your inventory. Suggestions from strangers, never.`
   - `<Text as="p">` with `text-xl md:text-3xl font-black text-center mt-8 md:mt-14`

**What changes from current:**
- Replaces the "Three steps. Zero typing." how-it-works section (which moves to section 4).
- Entirely new section that didn't exist before.

---

### Section 4 — How It Works (3-step flow)

**Background:** `bg-gradient-to-br from-orange-300 via-orange-400 to-orange-300` with borders. Keep floating decorative shapes.

**Layout:** Section title + 3-column card grid (same layout pattern as current how-it-works).

**Elements:**

1. **Section title**
   - Copy: `Three steps. Your voice. That's it.`
   - Subtitle: `Your hands are full and your brain is tired. Just talk.`

2. **Three cards** — Same visual pattern as current (numbered blocks, different accent colors, hard shadows, hover rotation).

   **Card 1 — Pink gradient:**
   - Number: `01`
   - Title: `🎤 Tell us what you cook`
   - Body: `"I make carbonara, stir-fry, shakshuka..." Add the dishes you already know by voice.`

   **Card 2 — Yellow gradient:**
   - Number: `02`
   - Title: `🛒 Keep your kitchen current`
   - Body: `"I just bought eggs, parmesan and bananas." Update your inventory by voice after shopping.`

   **Card 3 — Cyan gradient:**
   - Number: `03`
   - Title: `✅ See what's ready tonight`
   - Body: `Open the app — HomeCuistot shows you which of your dishes you can cook right now.`

**What changes from current:**
- Step 1 reframed: "Say what you have" (inventory-first, recipe-app pattern) → "Tell us what you cook" (dishes-first, ownership pattern)
- Step 2 reframed: "Create your own cookbook" → "Keep your kitchen current" (inventory update, not recipe creation)
- Step 3 reframed: "See cookable recipies instantly" → "See what's ready tonight" (removes "recipes" trigger word, fixes typo)
- Subtitle changed from "Voice-powered because your hands are full and your brain is tired." → "Your hands are full and your brain is tired. Just talk."

---

### Section 5 — Product Demo (RecipeCard showcase)

**This is a NEW section.**

**Background:** `bg-gradient-to-br from-pink-200 via-yellow-100 to-cyan-200` or similar warm gradient with `border-b-4 md:border-b-8 border-black`.

**Layout:** Section title + 3-column card grid on `md:`, stacked on mobile. Max-width container.

**Elements:**

1. **Section title**
   - Copy: `Your recipes. Your ingredients. Instant answers.`
   - `<Text as="h3">` centered

2. **Subtitle**
   - Copy: `This is what HomeCuistot looks like when you open it.`
   - `<Text as="p">` centered

3. **Three `LandingRecipeCard` instances** — Shows different availability states.

#### New component: `LandingRecipeCard`

**File:** `src/components/landing/LandingRecipeCard.tsx`

**Purpose:** Presentation-only wrapper that renders a recipe card with ingredient availability status for the landing page. NOT a modification of the existing `RecipeCard` — a separate, simpler component purpose-built for the landing page demo.

**Props interface:**
```typescript
interface LandingRecipeCardProps {
  name: string
  description: string
  ingredients: Array<{
    name: string
    type: 'anchor' | 'optional'
    available: boolean  // true = user has it, false = missing
  }>
  status: 'cookable' | 'almost' | 'missing'
}
```

**Visual design:**
- Same neo-brutal card frame as `RecipeCard`: `border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`
- Background varies by status:
  - `cookable`: `bg-gradient-to-br from-green-200 to-green-300` (same as existing RecipeCard)
  - `almost`: `bg-gradient-to-br from-yellow-200 to-yellow-300`
  - `missing`: `bg-gradient-to-br from-gray-100 to-gray-200`
- Recipe name: `text-xl font-black truncate`
- Recipe description: `text-sm font-bold text-black/70 line-clamp-2`
- Status badge at top-right corner:
  - `cookable`: green Badge with `✅ Ready tonight`
  - `almost`: yellow Badge with `⚠️ Missing 1`
  - `missing`: gray Badge with `❌ Missing 3`
- Ingredient list: flex-wrap of `Badge` components
  - Available ingredients: `bg-white/50` with `outline` variant (same as RecipeCard)
  - Missing ingredients: `bg-red-200 text-red-800` with strikethrough or red tint
  - Star icon (★) for anchor ingredients (amber for anchor, gray for optional — same as RecipeCard)

**Mock data (hardcoded in `page.tsx`):**

```typescript
const LANDING_RECIPES = [
  {
    name: "Pasta Carbonara",
    description: "Classic carbonara with eggs, bacon, and parmesan",
    status: "cookable" as const,
    ingredients: [
      { name: "Pasta", type: "anchor" as const, available: true },
      { name: "Bacon", type: "anchor" as const, available: true },
      { name: "Egg", type: "anchor" as const, available: true },
      { name: "Parmesan", type: "anchor" as const, available: true },
      { name: "Olive oil", type: "anchor" as const, available: true },
      { name: "Salt", type: "optional" as const, available: true },
    ],
  },
  {
    name: "Chicken Stir-Fry",
    description: "Quick stir-fry with vegetables and soy sauce",
    status: "almost" as const,
    ingredients: [
      { name: "Chicken", type: "anchor" as const, available: true },
      { name: "Rice", type: "anchor" as const, available: true },
      { name: "Soy sauce", type: "anchor" as const, available: true },
      { name: "Bell pepper", type: "anchor" as const, available: false },
      { name: "Garlic", type: "optional" as const, available: true },
      { name: "Ginger", type: "optional" as const, available: true },
    ],
  },
  {
    name: "Shakshuka",
    description: "Poached eggs in spiced tomato sauce",
    status: "missing" as const,
    ingredients: [
      { name: "Egg", type: "anchor" as const, available: true },
      { name: "Tomato", type: "anchor" as const, available: false },
      { name: "Onion", type: "anchor" as const, available: false },
      { name: "Cumin", type: "anchor" as const, available: false },
      { name: "Olive oil", type: "optional" as const, available: true },
      { name: "Salt", type: "optional" as const, available: true },
    ],
  },
] as const
```

**Card grid:** `grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 px-4`

**Interaction:** None. These are static, read-only presentation cards. No `onEdit`, `onDelete`, or `onIngredientToggle`.

---

### Section 6 — Sarah Story Teaser

**This is a NEW section.**

**Background:** `bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100` with `border-b-4 md:border-b-8 border-black`.

**Layout:** Centered card with thick border and hard shadow (same pattern as the "reframe" section card).

**Elements inside the card:**

1. **Mini-narrative** — Progressive reveal feel, using the same typography patterns as the onboarding.
   - Line 1: `5:47pm. Office.` — `text-lg md:text-2xl font-black`
   - Line 2: `Sarah's hungry. She doesn't feel like scrolling through Uber Eats again.` — `text-base md:text-xl font-bold text-black/80`
   - Line 3: `She opens HomeCuistot instead.` — `text-base md:text-xl font-bold text-black/80`

   These copy lines come directly from `SCENE_TEXT.scene1` in `src/lib/story-onboarding/constants.ts` (lines 96-101). Reuse the exact text or a shortened version. Keep the emotional hook without spoiling what happens next.

2. **CTA button** — Curiosity hook.
   - Copy: `See Sarah's story →`
   - Links to `/login` (user must log in to access onboarding at `/app/onboarding/story`)
   - Style: `Button` with `bg-yellow-400 hover:bg-yellow-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]` + press animation
   - Sized smaller than hero CTA: `size="md"` or slightly customized

**Design note:** This section should feel like a peek into the onboarding story. Keep it short — 3 lines max + one button. Don't duplicate the full Scene1Dilemma component.

---

### Section 7 — Final CTA (identity reinforcement)

**Background:** `bg-gradient-to-br from-pink-400 via-orange-400 to-yellow-400` with `border-b-4 md:border-b-8 border-black`. Same as current final CTA section.

**Layout:** Centered text stack.

**Elements:**

1. **Headline**
   - Copy: `Your dishes. Your kitchen. Always knowing what's for dinner.`
   - `<Text as="h3">` with `text-4xl md:text-7xl font-black uppercase leading-tight`

2. **Body text**
   - Copy: `Every meal you cook instead of ordering is a win. We just remove the thinking.`
   - `<Text as="p">` with `text-xl md:text-3xl font-black`

3. **CTA button**
   - Copy: `Start with your recipes →`
   - Links to `/login`
   - Same large Button styling as hero CTA

**What changes from current:**
- Headline: `Cook more. Order less.` → `Your dishes. Your kitchen. Always knowing what's for dinner.`
- Body: shortened, more direct
- CTA: `Commit To Change - Let's Go!` → `Start with your recipes →` (matches hero CTA)

---

### Header & Footer — No Changes

- `Header` stays as-is with `variant="landing"` and `logoClickable={true}`
- `Footer` stays as-is ("Made with ❤️ for Commit To Change 2026...")

---

## File Changes Summary

| File | Action | Description |
|---|---|---|
| `src/app/page.tsx` | **Edit** | Rewrite all section content. Add section 3 (anti-positioning), section 5 (product demo), section 6 (Sarah teaser). Update copy in sections 1, 2, 4, 7. Add mock data constant. |
| `src/components/landing/LandingRecipeCard.tsx` | **Create** | New presentation-only card component for the landing page product demo. Uses `Badge` from shared. |

**No other files are modified.** All shared components (`Header`, `Footer`, `Text`, `Button`, `Badge`) are used as-is.

---

## Copy Reference — Full Text Inventory

| Section | Element | Final copy |
|---|---|---|
| 1 Hero | Eyebrow | `Not a recipe app.` |
| 1 Hero | Headline | `Your kitchen already knows what's for dinner` |
| 1 Hero | Subheadline | `You have 15 go-to dishes and a fridge full of ingredients. HomeCuistot connects the two.` |
| 1 Hero | CTA | `Start with your recipes →` |
| 2 Reframe | Headline | `You know those 10–15 dinners you rotate through?` |
| 2 Reframe | Body | `The ones you could make in your sleep? HomeCuistot is the only app that starts there — with your dishes, not someone else's. Tell it what you cook, keep your kitchen updated, and it shows you which of your meals are ready tonight.` |
| 3 Anti-pos | Title | `What makes this different` |
| 3 Anti-pos | Left col title | `❌ Recipe Apps` |
| 3 Anti-pos | Left items | `Browse 2 million recipes` / `"Get inspired by new ideas"` / `Suggest strangers' dishes` / `You open the app, you scroll` |
| 3 Anti-pos | Right col title | `✅ HomeCuistot` |
| 3 Anti-pos | Right items | `Your 15 go-to dishes` / `"Can I make it tonight?"` / `Track your own ingredients` / `Open the app, see what's ready` |
| 3 Anti-pos | Knockout | `Your dishes. Your inventory. Suggestions from strangers, never.` |
| 4 How it works | Title | `Three steps. Your voice. That's it.` |
| 4 How it works | Subtitle | `Your hands are full and your brain is tired. Just talk.` |
| 4 How it works | Step 1 | Title: `🎤 Tell us what you cook` / Body: `"I make carbonara, stir-fry, shakshuka..." Add the dishes you already know by voice.` |
| 4 How it works | Step 2 | Title: `🛒 Keep your kitchen current` / Body: `"I just bought eggs, parmesan and bananas." Update your inventory by voice after shopping.` |
| 4 How it works | Step 3 | Title: `✅ See what's ready tonight` / Body: `Open the app — HomeCuistot shows you which of your dishes you can cook right now.` |
| 5 Demo | Title | `Your recipes. Your ingredients. Instant answers.` |
| 5 Demo | Subtitle | `This is what HomeCuistot looks like when you open it.` |
| 5 Demo | Cards | 3x `LandingRecipeCard` with mock data (see above) |
| 6 Sarah | Line 1 | `5:47pm. Office.` |
| 6 Sarah | Line 2 | `Sarah's hungry. She doesn't feel like scrolling through Uber Eats again.` |
| 6 Sarah | Line 3 | `She opens HomeCuistot instead.` |
| 6 Sarah | CTA | `See Sarah's story →` |
| 7 Final CTA | Headline | `Your dishes. Your kitchen. Always knowing what's for dinner.` |
| 7 Final CTA | Body | `Every meal you cook instead of ordering is a win. We just remove the thinking.` |
| 7 Final CTA | CTA | `Start with your recipes →` |

---

## What This Spec Does NOT Change

- No backend routes or API changes
- No new dependencies or packages
- No font changes (Geist stays)
- No color palette changes (pink/cyan/yellow/orange stays)
- No changes to `Header`, `Footer`, `Button`, `Text`, `Badge`, or any shared component
- No changes to `RecipeCard` (the existing one used in the app)
- No changes to onboarding flow or its constants
- No database changes
- `layout.tsx` and `globals.css` untouched
