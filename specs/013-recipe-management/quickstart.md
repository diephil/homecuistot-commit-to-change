# Quickstart: Recipe Management

**Feature**: 013-recipe-management | **Date**: 2026-01-27

## Prerequisites

- Node.js 20+, pnpm
- Supabase local running (`make sbstart`)
- Environment variables configured (`.env.local`)

## Setup Steps

### 1. Install Toast Component

```bash
cd apps/nextjs
npx shadcn@latest add toast
```

This creates:
- `src/components/ui/toast.tsx`
- `src/components/ui/toaster.tsx`
- `src/hooks/use-toast.ts`

### 2. Add Toaster to Root Layout

Edit `src/app/layout.tsx`:
```tsx
import { Toaster } from "@/components/ui/toaster"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

### 3. Register Opik Prompt

```bash
# Development
pnpm prompt:recipe

# Production
pnpm prompt:recipe:prod
```

### 4. Verify Database

No migrations required. Existing tables:
- `user_recipes` - Recipe storage
- `recipe_ingredients` - Junction table
- `ingredients` - 5931 item catalog
- `unrecognized_items` - For unmatched names

## Development Workflow

### Run Dev Server

```bash
cd apps/nextjs
pnpm dev
```

### Test Voice Input

1. Navigate to `/recipes`
2. Click "Add recipe"
3. Click microphone icon
4. Speak recipe description (max 1 minute)
5. Verify fields populate

### Test Text Input (Fallback)

1. Navigate to `/recipes`
2. Click "Add recipe"
3. Type recipe description in text field
4. Click submit
5. Verify fields populate (including inferred ingredients if none mentioned)

### Test Ingredient Validation

1. Add recipe with made-up ingredient
2. Click save
3. Verify toast shows unrecognized items

## File Locations

| Purpose | Path |
|---------|------|
| Recipe page | `src/app/(protected)/recipes/page.tsx` |
| App summary | `src/app/(protected)/app/page.tsx` |
| API routes | `src/app/api/recipes/` |
| Server actions | `src/app/actions/recipes.ts` |
| Components | `src/components/recipes/` |
| LLM prompt | `src/lib/prompts/recipe-editor/` |
| Types | `src/types/recipes.ts` |

## NPM Scripts

```json
{
  "prompt:recipe": "tsx --env-file=.env.local scripts/register-recipe-prompt.ts",
  "prompt:recipe:prod": "tsx --env-file=.env.prod scripts/register-recipe-prompt.ts"
}
```

## Environment Variables

Required in `.env.local`:
```
GOOGLE_GENERATIVE_AI_API_KEY=...   # For Gemini LLM
NEXT_PUBLIC_SUPABASE_URL=...       # Supabase project
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
OPIK_URL_OVERRIDE=http://localhost:5173/api  # Opik local
```

## Testing Checklist

- [ ] Toast notification appears for unrecognized ingredients
- [ ] Voice input extracts title, description, ingredients (max 1 min recording)
- [ ] Text input extracts title, description, ingredients (fallback)
- [ ] LLM infers minimal ingredients when user mentions none
- [ ] Skeleton placeholders show during LLM processing
- [ ] Recipes list shows on `/app` (top 10, non-clickable)
- [ ] Recipes manageable on `/recipes` (clickable, CRUD)
- [ ] Delete confirmation inline (not alert)
- [ ] Ingredient optional toggle persists
- [ ] User can only see their own recipes (tenant isolation)
