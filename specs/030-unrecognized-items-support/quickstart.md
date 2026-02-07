# Quickstart: Promote Unrecognized Items to First-Class Ingredients

## Prerequisites

- Local Supabase running (`make dev-all` or `make sbstart`)
- `apps/nextjs/.env.local` configured
- At least one user with unrecognized items in inventory (create via onboarding voice input with unknown ingredients)

## Implementation Order

1. **Schema** → `pnpm db:generate && pnpm db:migrate`
2. **Types** → Update 3 type files (no runtime impact, enables subsequent changes)
3. **Backend** → Agent tools, apply-proposal, cooking-log, recipes actions, inventory API
4. **Frontend** → Inventory page, recipe card, recipe edit form, mark-cooked modal

## Verification Steps

```bash
# After schema migration
pnpm db:status  # verify new column

# After all changes
pnpm build      # no type errors
pnpm lint       # only pre-existing errors (useStoryState.ts:47, MarkCookedModal.tsx:182)
```

## Manual Testing

1. Go to inventory → unrecognized items appear in main list under "Non-Classified"
2. Change quantity on an unrecognized item → persists
3. Create recipe via voice mentioning an unrecognized item name → links correctly
4. Go to Cook Now → recipe with unrecognized items shows correct availability
5. Mark recipe as cooked → unrecognized item quantities update
6. Edit recipe → unrecognized ingredients visible and modifiable
