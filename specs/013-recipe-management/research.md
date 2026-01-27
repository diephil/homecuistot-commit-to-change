# Research: Recipe Management

**Feature**: 013-recipe-management | **Date**: 2026-01-27

## R1: Toast Notification System

**Question**: How to display temporary toast notifications for unrecognized ingredients?

**Research**:
- Project uses `shadcn@3.7.0` (devDep) but toast component not installed
- shadcn/ui toast built on Radix primitives, minimal bundle size
- Alternative: sonner (standalone, more features, heavier)

**Decision**: Install shadcn/ui toast via `npx shadcn@latest add toast`

**Rationale**:
- Consistent with existing component library
- Minimal additional dependencies (uses Radix already)
- Simple API: `toast({ description: "..." })`

**Implementation Notes**:
```bash
cd apps/nextjs && npx shadcn@latest add toast
```
- Creates `components/ui/toast.tsx`, `toaster.tsx`, `use-toast.ts`
- Add `<Toaster />` to root layout

---

## R2: Ingredient Type Mapping

**Question**: How to map `isOptional` boolean from LLM to existing DB schema?

**Research**:
- Existing schema: `recipe_ingredients.ingredientType` = `'anchor' | 'optional' | 'assumed'`
- Schema at `src/db/schema/user-recipes.ts` line 22
- Enums at `src/db/schema/enums.ts` line 39-41

**Decision**: Map directly: `isOptional=true` → `'optional'`, `isOptional=false` → `'anchor'`

**Rationale**:
- No schema migration required
- Semantic alignment: `anchor` = required, `optional` = optional
- `assumed` reserved for system-inferred ingredients (not user-specified)

**Code Pattern**:
```typescript
const ingredientType: IngredientType = ingredient.isOptional ? 'optional' : 'anchor'
```

---

## R3: Voice Input Pattern

**Question**: How to capture and process voice input for recipe creation?

**Research**:
- Existing pattern at `src/app/api/onboarding/process-voice/route.ts`
- Uses MediaRecorder API → base64 webm encoding
- Sent to Gemini with `inlineData` attachment for audio content

**Decision**: Reuse existing voice capture pattern with new `recipe-editor` prompt

**Rationale**:
- Proven pattern, already tested in onboarding
- Gemini handles speech-to-text + structured extraction in single call
- opik-gemini provides tracing automatically

**Implementation Notes**:
- Create `/api/recipes/process-voice/route.ts` mirroring onboarding pattern
- Create `/api/recipes/process-text/route.ts` for text fallback (same prompt, different input)
- Create `/lib/prompts/recipe-editor/` with prompt.ts, schema.ts, process.ts
- Use `trackGemini()` wrapper for Opik telemetry
- Max recording duration: 1 minute (60 seconds)
- LLM infers minimal ingredients when user mentions none

---

## R4: Tenant Verification

**Question**: How to ensure users only access their own recipes?

**Research**:
- Existing pattern at `src/db/client.ts` lines 248-264
- Uses `createUserDb(token)` to set RLS context
- Supabase RLS policies enforce at database level

**Decision**: All recipe queries through `createUserDb(token)` wrapper

**Rationale**:
- Defense in depth: RLS + application layer
- Consistent with existing inventory, onboarding patterns
- Automatic audit trail via Supabase logs

**Code Pattern**:
```typescript
const supabase = await createClient()
const { data: { session } } = await supabase.auth.getSession()
if (!session) throw new Error('Unauthorized')

const token = decodeSupabaseToken(session.access_token)
const db = createUserDb(token)

await db((tx) =>
  tx.select().from(userRecipes).where(eq(userRecipes.userId, session.user.id))
)
```

---

## R5: Unrecognized Items Display

**Question**: How to display unrecognized ingredients per user requirement?

**Research**:
- User requirement: "temporary toast message that lists the names"
- Format specified: "the system does not recognize the following items yet: a, b, c, etc..."
- Onboarding uses modal for unrecognized items resolution

**Decision**: Toast notification with 5s auto-dismiss, option to manually dismiss

**Rationale**:
- User explicitly requested toast, not modal
- Non-blocking UX allows user to continue editing
- Lists all names in single message for quick scanning

**Implementation Notes**:
```typescript
if (unrecognized.length > 0) {
  toast({
    title: "Unrecognized items",
    description: `The system does not recognize the following items yet: ${unrecognized.join(', ')}`,
    duration: 5000,
  })
}
```

---

## R6: Opik Prompt Registration

**Question**: How to register recipe-editor prompt with Opik?

**Research**:
- Existing scripts: `scripts/register-voice-prompt.ts`, `scripts/register-text-prompt.ts`
- Uses `opik` package's `Opik` client and `PromptType.MUSTACHE`
- NPM scripts: `prompt:voice`, `prompt:text` (dev/prod variants)

**Decision**: Create `scripts/register-recipe-prompt.ts` with NPM scripts

**Rationale**:
- Consistent with existing prompt registration pattern
- Enables version tracking and A/B testing in Opik dashboard
- Environment-aware (dev/prod) via env file loading

**Implementation Notes**:
```typescript
// scripts/register-recipe-prompt.ts
import { Opik, PromptType } from "opik";
import { RECIPE_EDITOR_PROMPT } from "../src/lib/prompts/recipe-editor/prompt";

async function main() {
  const env = (process.env.NODE_ENV as "development" | "production") || "development";
  const client = new Opik();

  const prompt = await client.createPrompt({
    ...RECIPE_EDITOR_PROMPT,
    type: PromptType.MUSTACHE,
    metadata: { ...RECIPE_EDITOR_PROMPT.metadata, env },
    tags: [...RECIPE_EDITOR_PROMPT.tags, env],
  });

  console.log(`Registered: ${prompt.name} [${env}] (commit: ${prompt.commit})`);
}

main().catch(console.error);
```

NPM scripts to add:
```json
"prompt:recipe": "tsx --env-file=.env.local scripts/register-recipe-prompt.ts",
"prompt:recipe:prod": "tsx --env-file=.env.prod scripts/register-recipe-prompt.ts"
```

---

## Summary

All NEEDS CLARIFICATION items resolved. Design phase can proceed with:
- shadcn/ui toast for notifications
- Direct `ingredientType` mapping (no migration)
- Reused voice input pattern
- RLS tenant verification
- Toast-based unrecognized items display
- Opik prompt registration script
