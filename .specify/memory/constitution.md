<!--
═══════════════════════════════════════════════════════════════════════════
SYNC IMPACT REPORT - Constitution Update
═══════════════════════════════════════════════════════════════════════════

Version Change: 1.1.0 → 1.2.0 (New principle added - Named Parameters)

Principles Modified:
- None (no title changes)

Principles Added:
- VI. Named Parameters for Clarity (NEW)

Sections Modified:
- Core Principles: Added Principle VI with rationale and examples

Sections Removed:
- None

Templates Status:
✅ plan-template.md - No changes required (no constitution check conflicts)
✅ spec-template.md - No changes required (requirement agnostic)
✅ tasks-template.md - No changes required (testing optional unchanged)
✅ agent-file-template.md - No changes required
✅ checklist-template.md - No changes required

Follow-up TODOs:
- None (principle is self-contained)

Rationale:
- MINOR version 1.1.0 → 1.2.0: New principle added within MVP phase
- Named parameter principle aligns with Principle II (Pragmatic Type Safety)
- Improves readability and prevents argument order mistakes
- Supports maintainability without blocking MVP velocity
- No breaking changes to existing governance or workflow

Version Bump Justification:
- Not MAJOR: No backward incompatible changes, no phase transition
- MINOR: New principle added (material expansion of guidance)
- Not PATCH: Substantive content addition, not clarification/correction

═══════════════════════════════════════════════════════════════════════════
-->

# Homecuistot Constitution (MVP Phase)

**Context**: 2-week MVP delivery timeline. This constitution optimizes for speed while maintaining essential user protection. Post-MVP hardening phase planned.

## Core Principles

### I. MVP-First Development

Ship working features over perfect code:
- Feature completeness > code perfection
- Working > well-tested (for MVP only)
- Manual validation acceptable for non-critical paths
- Technical debt tracked but not blocking
- Focus on happy paths; edge cases deferred unless critical

**Rationale**: 2-week timeline demands ruthless prioritization. Ship fast, learn from users, refactor later.

### II. Pragmatic Type Safety

TypeScript strict mode enabled BUT pragmatic exceptions allowed:
- Use `any` when type inference blocks progress (add `// TODO: type` comment)
- Skip complex type gymnastics; prefer `unknown` + runtime checks
- Type safety at boundaries (API inputs/outputs) REQUIRED
- Internal types can be loose during MVP
- No type errors that crash the app

**Rationale**: Type safety matters but can't block velocity. Strict at boundaries protects users; internal looseness speeds development.

### III. Essential Validation Only

Validate ONLY where failure impacts users or data integrity:
- **MUST validate**: User inputs that touch database, authentication, payments
- **SHOULD validate**: Form inputs, API requests
- **CAN SKIP**: Internal function calls, development-only features, admin tools
- Use simple validation (manual checks OK); schema libs optional
- Fail gracefully with user-friendly errors for critical paths

**Rationale**: Not all validation is equal. Protect user data and security; defer nice-to-haves.

### IV. Test-Ready Infrastructure

Setup test infrastructure but tests optional for MVP:
- Test runner configured and working (`pnpm test` runs successfully)
- Directory structure supports tests (`tests/` or `__tests__/`)
- Critical paths MAY have tests (auth, payments, data loss scenarios)
- Most features tested manually
- Post-MVP: expand test coverage incrementally

**Rationale**: Infrastructure setup is cheap; writing tests is expensive. Be ready to test but don't let it block shipping.

### V. Type Derivation Over Duplication

Derive complex types from schemas/types instead of manual redefinition:
- **MUST derive**: Complex object types, nested structures, discriminated unions
- **PRIMITIVES EXEMPT**: Simple types (string, number, boolean) can be defined directly
- **USE TypeScript utilities**: `typeof`, `ReturnType`, `Parameters`, `Awaited`, schema.infer
- **SINGLE SOURCE OF TRUTH**: Schema or base type is source; derived types follow
- Prefer Zod/validation schemas → infer types over manual type + manual validation

**Rationale**: Manual type duplication causes drift between runtime validation and compile-time types. Derivation maintains consistency, reduces maintenance, prevents bugs.

**Examples**:
```typescript
// ✅ GOOD: Derive from schema
const userSchema = z.object({
  id: z.string(),
  profile: z.object({ name: z.string(), age: z.number() })
});
type User = z.infer<typeof userSchema>;  // Derived

// ✅ GOOD: Derive from existing type
type UserProfile = User['profile'];  // Derived from User

// ✅ GOOD: Derive function return type
const getUser = () => ({ id: '1', name: 'Alice' });
type UserData = ReturnType<typeof getUser>;  // Derived

// ❌ BAD: Manual duplication
type User = { id: string; profile: { name: string; age: number } };  // Manual
const userSchema = z.object({ /* duplicate structure */ });  // Duplicate

// ✅ OK: Primitives can be defined directly (not complex types)
type UserId = string;  // OK - primitive
type Age = number;     // OK - primitive
```

### VI. Named Parameters for Clarity

Use named parameters (object destructuring) for function signatures with complexity:
- **MUST use named params**: 3+ arguments OR 2+ arguments of same type
- **MAY use positional**: 1-2 arguments of different types
- **CONSISTENCY REQUIRED**: Apply pattern uniformly across codebase
- **NO EXCEPTIONS**: This rule applies to all new function signatures

**Rationale**: Named parameters prevent argument order mistakes, improve readability at call sites, and make refactoring safer. The small upfront cost pays off in maintainability.

**Examples**:
```typescript
// ✅ GOOD: Single argument
function deleteUser(userId: string): void { }

// ✅ GOOD: Two arguments, different types
function updateUser(userId: string, isActive: boolean): void { }

// ❌ BAD: Two arguments, same type (ambiguous at call site)
function updateName(firstName: string, lastName: string): void { }
// Call site unclear: updateName("John", "Doe") - which is which?

// ✅ GOOD: Two arguments, same type → use named params
function updateName(params: { firstName: string; lastName: string }): void { }
// Call site clear: updateName({ firstName: "John", lastName: "Doe" })

// ❌ BAD: Three arguments (too many positional)
function createUser(name: string, email: string, age: number): void { }

// ✅ GOOD: Three arguments → use named params
function createUser(params: { name: string; email: string; age: number }): void { }

// ❌ BAD: Multiple arguments with object last (inconsistent)
function updateProfile(userId: string, updates: { name: string; bio: string }): void { }

// ✅ GOOD: All params in single object (consistent)
function updateProfile(params: {
  userId: string;
  name: string;
  bio: string;
}): void { }
```

## MVP Constraints (2-Week Timeline)

### Speed Priorities

1. **Features over quality**: Ship working features fast
2. **Manual over automated**: Manual testing, manual deploys OK
3. **Simple over clever**: Straightforward code beats elegant architecture
4. **Copy-paste over DRY**: Duplication acceptable if it ships faster
5. **Monolith over microservices**: Keep it simple, refactor later

### Non-Negotiable Safeguards

Even at MVP speed, these CANNOT be compromised:

- ❌ No user data loss (validate database operations)
- ❌ No auth bypasses (validate authentication/authorization)
- ❌ No SQL injection (use parameterized queries)
- ❌ No exposed secrets (environment variables only)
- ✅ TypeScript compilation MUST succeed (no `tsc` errors)
- ✅ App MUST run without crashes on happy paths

### Deferred to Post-MVP

These are explicitly deferred until after MVP launch:

- Comprehensive test coverage
- Perfect code style/formatting
- Extensive edge case handling
- Performance optimization
- Accessibility beyond basics
- Comprehensive error handling

## Development Workflow (MVP Phase)

### Testing

- **Required**: Manual testing of critical user journeys
- **Optional**: Unit tests (add if time permits or for confidence)
- **Skippable**: Integration tests, E2E tests, coverage targets

### Linting

- **Pre-commit**: Skippable during MVP (fix later)
- **CI/CD**: Run linter but DON'T block merges on warnings
- **Errors only**: Block on lint errors that break builds
- **Post-MVP**: Enable strict linting

### Code Style

- **Formatter**: Use if already configured; don't spend time setting up
- **Consistency**: Nice to have but not blocking
- **Readability**: Favor clear code but don't refactor for style
- **Post-MVP**: Establish and enforce style guide

### Git Workflow

- **Branching**: Feature branches optional; commit to main is OK for MVP
- **Reviews**: Self-review acceptable; pair review if available
- **Commits**: Commit message quality not critical; use descriptive names
- **Post-MVP**: Establish proper PR workflow

## Post-MVP Migration Path

After MVP ships and validates with users:

### Phase 1: Immediate Hardening (Week 3-4)
- Add tests for critical paths
- Fix known security issues
- Address user-reported bugs
- Enable strict linting

### Phase 2: Technical Debt (Month 2)
- Improve type coverage (remove `any`)
- Add comprehensive validation
- Expand test coverage >70%
- Refactor duplicated code

### Phase 3: Production-Ready (Month 3)
- Full test coverage for business logic
- Automated CI/CD with quality gates
- Performance optimization
- Accessibility compliance
- Comprehensive error handling

## Governance

### Amendment Process

- Constitution can be updated via commit during MVP phase
- Major changes notify team via PR description
- Post-MVP: establish formal review process

### Versioning Policy

- **MAJOR**: Phase transitions (MVP → Hardening → Production) OR backward incompatible governance changes
- **MINOR**: New principle/section added or materially expanded guidance
- **PATCH**: Clarifications, wording, typo fixes, non-semantic refinements

### Compliance Review

- Critical safeguards (data loss, auth, security) MUST be verified
- Other principles are guidelines, not gates
- When in doubt: ship first, fix later (unless it affects users negatively)

**Version**: 1.2.0 | **Ratified**: 2026-01-19 | **Last Amended**: 2026-01-19
