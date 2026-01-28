# Implementation Plan: Demo Data Reset

**Branch**: `017-demo-data-reset` | **Date**: 2026-01-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/017-demo-data-reset/spec.md`

## Summary

Add "Start Demo" button to /app page (blue, neo-brutalist) next to existing "Reset user data" button. Opens shared confirmation modal warning about data replacement with demo data. On confirm: delete all user data (reuse resetUserData logic), insert 21 demo ingredients + 6 demo recipes, stay on /app page showing demo data.

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode)
**Primary Dependencies**: React 19, Next.js 16, Drizzle ORM 0.45.1, Supabase Auth
**Storage**: Supabase PostgreSQL (user_inventory, user_recipes, recipe_ingredients, ingredients tables)
**Testing**: Manual testing (MVP phase)
**Target Platform**: Web (Next.js App Router)
**Project Type**: Web application (monorepo: apps/nextjs/)
**Performance Goals**: Demo data insertion < 3 seconds
**Constraints**: Transaction-wrapped operations, atomic rollback on failure
**Scale/Scope**: Single user operation, 21 inventory items + 6 recipes + ~25 recipe ingredients

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. MVP-First Development | ✅ PASS | Feature completeness prioritized, manual testing OK |
| II. Pragmatic Type Safety | ✅ PASS | Types at boundaries (server action), internal types derived |
| III. Essential Validation Only | ✅ PASS | Validate user auth before data operations |
| IV. Test-Ready Infrastructure | ✅ PASS | Manual testing acceptable for MVP |
| V. Type Derivation Over Duplication | ✅ PASS | Demo data types derived from schema |
| VI. Named Parameters for Clarity | ✅ PASS | Server action uses single params object |
| VII. Vibrant Neobrutalism Design | ✅ PASS | Blue button, thick borders, shadows per constitution |
| Non-Negotiable Safeguards | ✅ PASS | No data loss risk (user confirms), auth validated, parameterized queries via Drizzle |

**Gate Status**: ✅ PASSED - No violations

## Project Structure

### Documentation (this feature)

```text
specs/017-demo-data-reset/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
apps/nextjs/src/
├── app/
│   ├── actions/
│   │   └── user-data.ts           # ADD: startDemoData server action
│   └── (protected)/app/
│       └── page.tsx               # MODIFY: add StartDemoButton
├── components/app/
│   ├── reset-user-data-button.tsx # REFACTOR: extract shared modal
│   ├── start-demo-button.tsx      # NEW: blue demo button
│   └── confirmation-modal.tsx     # NEW: shared modal component
└── db/
    └── demo-data.ts               # NEW: demo data constants
```

**Structure Decision**: Extend existing web application structure. Server action in actions/, UI components in components/app/, demo data constants in db/.

## Complexity Tracking

> No violations - table not needed.

## Implementation Phases

### Phase 0: Research (Complete)

See [research.md](./research.md) for:
- Ingredient name lookup strategy
- Transaction pattern for insert after delete
- Modal extraction approach

### Phase 1: Design

See [data-model.md](./data-model.md) for:
- Demo inventory data structure
- Demo recipes data structure
- Recipe ingredients mapping

See [contracts/](./contracts/) for:
- startDemoData server action contract

See [quickstart.md](./quickstart.md) for:
- Step-by-step implementation guide
