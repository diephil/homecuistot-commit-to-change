# Quickstart: Onboarding Steps 2 & 3 Revamp

**Branch**: `019-onboarding-revamp` | **Date**: 2026-01-31

## Prerequisites

- Node.js 20+
- pnpm
- Supabase local running (`make sbstart`)
- `.env.local` with `GOOGLE_GENERATIVE_AI_API_KEY`

## Setup

```bash
cd apps/nextjs
pnpm install
pnpm dev
```

## Key Files to Modify

### 1. Static Data (`constants/onboarding.ts`)

Add new exports:
- `COMMON_INGREDIENTS`: 16-item array
- `BASIC_RECIPES`: 8 static dishes with ingredients
- `ADVANCED_RECIPES`: 8 additional static dishes

### 2. Types (`types/onboarding.ts`)

Add new types:
- `StaticDish`, `StaticDishIngredient`
- `IngredientExtractionSchema` (Zod)
- `CookingSkill` type

### 3. Shared Component (`components/shared/IngredientChip.tsx`)

Create reusable chip with:
- Selectable mode (step 2)
- Read-only mode (step 3)
- Neobrutalism styling

### 4. Ingredient Matcher (`lib/services/ingredient-matcher.ts`)

Create helper function:
- Match names against `ingredients` table
- Match against `unrecognized_items`
- Return structured result

### 5. LLM Prompts (`lib/prompts/onboarding-*/`)

Update for ingredient-only extraction:
- Remove dish extraction
- Return `ingredients_to_add`, `ingredients_to_remove`

### 6. API Routes (`app/api/onboarding/`)

Update persist route:
- Accept `cookingSkill` parameter
- Use static recipes instead of LLM generation
- Use `matchIngredients()` helper

### 7. Onboarding Page (`app/(protected)/app/onboarding/page.tsx`)

Major updates:
- Step 2: Add cooking skill selection section
- Step 2: Replace dish badges with ingredient multi-select
- Step 3: Display step 2 ingredients as read-only
- Step 3: Voice/text for add/remove only
- Toast notifications on list changes

## Testing Checklist

- [ ] Select cooking skill, see ingredients section appear
- [ ] Select multiple ingredients, "Next Step" enables
- [ ] Step 3 shows step 2 ingredients as read-only
- [ ] Voice input adds/removes ingredients
- [ ] Text input adds/removes ingredients
- [ ] Toast appears on list changes
- [ ] Complete Setup creates correct recipes (8 or 16)
- [ ] All ingredients in user_inventory with quantity_level=3

## Design Reference

Follow existing neobrutalism patterns:
- Thick borders (4-6px)
- Bold shadows (`shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`)
- Bright colors (yellow, pink, cyan)
- Mobile-first responsive
