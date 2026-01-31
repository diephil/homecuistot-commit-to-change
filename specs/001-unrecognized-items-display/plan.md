# Implementation Plan: Unrecognized Items Display

**Branch**: `001-unrecognized-items-display` | **Date**: 2026-01-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-unrecognized-items-display/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Display unrecognized items at the end of inventory list with restricted interactions (delete only, no quantity/pantry staple changes), visual distinction via reduced opacity and muted text, help documentation in existing modal, and pantry staple UI improvements (star → infinity icon, hint text). Leverages existing Next.js 16 inventory page, Drizzle ORM schema (user_inventory with XOR constraint for ingredientId/unrecognizedItemId), and RetroUI vibrant neobrutalist design system.

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode), React 19, Next.js 16 App Router
**Primary Dependencies**: Drizzle ORM 0.45.1, @supabase/supabase-js, Tailwind CSS v4, RetroUI components, lucide-react icons
**Storage**: Supabase PostgreSQL (user_inventory, unrecognized_items, ingredients tables)
**Testing**: Vitest (configured, tests optional per MVP constitution)
**Target Platform**: Web (responsive mobile-first)
**Project Type**: Web application (monorepo: apps/nextjs/)
**Performance Goals**: <2s inventory page load, <3s with 500 items, instant delete feedback
**Constraints**: Vibrant neobrutalism design (thick borders, box shadows, playful rotations on desktop only), mobile-first responsive, reduced opacity 50-60% for unrecognized items
**Scale/Scope**: Single inventory page modification, 3-5 React components (reusable in shared/), 2-3 service functions (lib/services/), help modal content update

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Non-Negotiable Safeguards

- ✅ **No user data loss**: Delete operations preserve unrecognized_items table records, only remove user_inventory entries
- ✅ **No auth bypasses**: Inventory page already protected in (protected) route group
- ✅ **No SQL injection**: Using Drizzle ORM with parameterized queries
- ✅ **No exposed secrets**: Using environment variables for Supabase connection
- ✅ **TypeScript compilation**: Strict mode enabled, no `tsc` errors allowed
- ✅ **No crashes on happy paths**: Manual testing required for display, interaction, delete flows

### Constitution Compliance

**I. MVP-First Development**
- ✅ Feature completeness prioritized: All 5 user stories deliverable
- ✅ Manual validation: Manual testing acceptable for MVP
- ✅ Happy paths first: Edge cases (pagination, concurrent ops) deferred

**II. Pragmatic Type Safety**
- ✅ Strict at boundaries: API responses typed via Drizzle schema inference
- ✅ Internal types can be loose: Component props can use `any` for icons with `// TODO: type` if needed

**V. Type Derivation Over Duplication**
- ✅ Derive from Drizzle schema: `typeof userInventory.$inferSelect` for inventory items
- ✅ Zod schemas: Use existing or create schema for API validation, infer types

**VI. Named Parameters for Clarity**
- ✅ Service functions: Use named params for delete operations (e.g., `deleteUnrecognizedItem({ userId, itemId })`)
- ✅ 3+ arguments or 2+ same type: Named parameter objects required

**VII. Vibrant Neobrutalism Design System**
- ✅ Thick borders: 4px mobile, 6px desktop on all interactive elements
- ✅ Thick box shadows: Offset shadows with no blur (6-8px desktop, 4px mobile)
- ✅ Reduced opacity for unrecognized items: 50-60% opacity + muted text (gray-500/gray-600)
- ✅ Infinity icon: Replace star with lucide-react `Infinity` icon for pantry staples
- ✅ Mobile-first responsive: Remove rotations on mobile, smaller borders/shadows
- ✅ Hint text: Bold, uppercase or bold text below pantry staples section

**Status**: ✅ **PASS** - All gates cleared for Phase 0 research

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/nextjs/
├── src/
│   ├── app/
│   │   ├── (protected)/app/inventory/    # Existing inventory page (modify)
│   │   ├── api/inventory/                # Existing inventory API (extend)
│   │   └── actions/                      # Server actions (add delete action)
│   ├── components/
│   │   ├── shared/                       # NEW reusable components
│   │   │   ├── UnrecognizedItemRow.tsx   # Unrecognized item display
│   │   │   ├── PantryStapleIcon.tsx      # Infinity icon wrapper
│   │   │   └── HelpModal.tsx             # Extend existing help modal
│   │   ├── inventory/                    # Existing inventory components (modify)
│   │   └── ui/                           # RetroUI base components
│   ├── lib/
│   │   └── services/                     # NEW service layer
│   │       ├── inventory.service.ts      # Inventory operations
│   │       └── unrecognized-items.service.ts  # Delete, fetch operations
│   ├── db/
│   │   └── schema/                       # Existing Drizzle schemas (reference only)
│   │       ├── user-inventory.ts         # XOR constraint: ingredientId OR unrecognizedItemId
│   │       └── unrecognized-items.ts     # Persistent unrecognized items table
│   └── types/                            # Type definitions
│       └── inventory.types.ts            # Derived types from Drizzle schemas
└── tests/                                # Manual testing for MVP (optional automated)
```

**Structure Decision**: Next.js 16 App Router monorepo. Components follow user instruction: reusable components in `components/shared/`, feature-specific in `components/inventory/`. Service layer in `lib/services/` per user instruction for code logic reusability. Existing inventory page modified, not replaced. Database schema unchanged (already supports unrecognized items via XOR constraint).

## Complexity Tracking

**Status**: ✅ No violations - Constitution check passed without exceptions

This feature aligns with all constitution principles:
- MVP-First: Feature completeness prioritized, manual testing acceptable
- Type Safety: Drizzle schema derivation, strict at boundaries
- Named Parameters: Service functions use named params (2+ arguments)
- Vibrant Neobrutalism: Thick borders, box shadows, infinity icon, reduced opacity for disabled state
- Service Layer: Reusable code in `lib/services/` per user instruction
- Shared Components: Reusable UI in `components/shared/` per user instruction

No architectural complexity added beyond standard Next.js 16 App Router patterns.

---

## Phase Completion Summary

### Phase 0: Research ✅ COMPLETE

**Artifacts Created**:
- `research.md` - All technical unknowns resolved

**Key Decisions**:
1. Use Drizzle ORM with relations for querying unrecognized items
2. Next.js Server Actions for delete operation with optimistic UI
3. Tailwind opacity-50 + text-gray-500 for visual distinction
4. lucide-react `Infinity` icon for pantry staples
5. Extend existing help modal with new section

### Phase 1: Design & Contracts ✅ COMPLETE

**Artifacts Created**:
- `data-model.md` - Entity definitions, type derivation patterns, validation rules
- `contracts/delete-unrecognized-item.contract.ts` - Zod schemas for server action
- `quickstart.md` - Development setup, file structure, testing checklist
- Updated `CLAUDE.md` - Agent context with new component/service paths

**Key Outputs**:
- Type derivation from Drizzle schema (no manual duplication)
- Server action contract with Zod validation
- Component architecture: reusable in `shared/`, feature-specific in `inventory/`
- Service layer architecture: business logic in `lib/services/`

**Constitution Re-Check**: ✅ PASS
- All gates cleared
- No new violations introduced
- Type derivation properly applied
- Named parameters enforced in service signatures

---

## Next Steps

**Command**: `/speckit.tasks`

This will generate `tasks.md` with actionable, dependency-ordered implementation tasks based on:
- 5 user stories (P1-P4 priorities)
- 14 functional requirements
- Data model & contracts defined in Phase 1
- Quickstart development workflow

**Implementation Order** (automatically determined by tasks generation):
1. Type definitions & service layer (foundation)
2. Reusable components (PantryStapleIcon, UnrecognizedItemRow)
3. Server actions & API integration
4. Inventory page modifications
5. Help modal content update
6. Manual testing & validation

---

## Appendix: File Change Summary

### New Files Created (7 total)

```
specs/001-unrecognized-items-display/
├── research.md                       # Phase 0 output
├── data-model.md                     # Phase 1 output
├── quickstart.md                     # Phase 1 output
├── contracts/
│   └── delete-unrecognized-item.contract.ts  # API contract

apps/nextjs/src/
├── types/
│   └── inventory.types.ts            # To create
├── lib/services/
│   └── unrecognized-items.service.ts # To create
├── app/actions/
│   └── inventory.actions.ts          # To create
└── components/shared/
    ├── UnrecognizedItemRow.tsx       # To create
    └── PantryStapleIcon.tsx          # To create
```

### Existing Files to Modify (3 total)

```
apps/nextjs/src/
├── app/(protected)/app/inventory/page.tsx  # Add unrecognized items section
├── components/[HelpModal].tsx             # Add unrecognized items help content
└── components/inventory/[InventoryRow].tsx # Replace star with infinity icon (optional refactor)
```

### Files NOT Modified (Database)

```
apps/nextjs/src/db/schema/
├── user-inventory.ts                 # Reference only - schema unchanged
└── unrecognized-items.ts             # Reference only - schema unchanged
```

**Total Implementation Scope**: 10 files (7 new, 3 modified)

---

## Planning Metadata

**Plan Generated**: 2026-01-31
**Plan Template Version**: 1.0
**Constitution Version**: 1.4.0
**Time Estimate**: 4-6 hours implementation (per MVP velocity)
**Risk Level**: Low (existing schema, no breaking changes, incremental feature)
**Dependencies**: None (all existing infrastructure ready)
