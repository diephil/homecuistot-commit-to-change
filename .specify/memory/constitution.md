<!--
═══════════════════════════════════════════════════════════════════════════
SYNC IMPACT REPORT - Constitution Update
═══════════════════════════════════════════════════════════════════════════

Version Change: 1.3.0 → 1.4.0 (Expanded Neo-Brutalist Design System principle)

Principles Modified:
- VII. Neo-Brutalist Design System (expanded with concrete implementation patterns)

Principles Added:
- None

Sections Modified:
- Core Principles: Principle VII completely rewritten with vibrant color palette,
  playful asymmetry, thick box shadows, and responsive mobile-first approach

Sections Removed:
- None

Templates Status:
✅ plan-template.md - No changes required (technology-agnostic)
✅ spec-template.md - No changes required (user story focused)
✅ tasks-template.md - No changes required (implementation-agnostic)

Follow-up TODOs:
- None (design principle reflects implemented landing page)

Rationale:
- MINOR version 1.3.0 → 1.4.0: Material expansion of existing design principle
- Updated principle captures actual implemented design from landing page
- Replaces theoretical brutalism with concrete vibrant neobrutalism
- Adds specific color palette, shadow system, rotation patterns
- Includes mobile-first responsive approach
- No governance changes, no breaking changes

Version Bump Justification:
- Not MAJOR: No backward incompatible changes, no principle removal
- MINOR: Material expansion of Principle VII with concrete implementation guidance
- Not PATCH: Substantive rewrite establishing new design patterns, not clarification

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
  profile: z.object({ name: z.string(), age: z.number() }),
});
type User = z.infer<typeof userSchema>; // Derived

// ✅ GOOD: Derive from existing type
type UserProfile = User["profile"]; // Derived from User

// ✅ GOOD: Derive function return type
const getUser = () => ({ id: "1", name: "Alice" });
type UserData = ReturnType<typeof getUser>; // Derived

// ❌ BAD: Manual duplication
type User = { id: string; profile: { name: string; age: number } }; // Manual
const userSchema = z.object({
  /* duplicate structure */
}); // Duplicate

// ✅ OK: Primitives can be defined directly (not complex types)
type UserId = string; // OK - primitive
type Age = number; // OK - primitive
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
function deleteUser(userId: string): void {}

// ✅ GOOD: Two arguments, different types
function updateUser(userId: string, isActive: boolean): void {}

// ❌ BAD: Two arguments, same type (ambiguous at call site)
function updateName(firstName: string, lastName: string): void {}
// Call site unclear: updateName("John", "Doe") - which is which?

// ✅ GOOD: Two arguments, same type → use named params
function updateName(params: { firstName: string; lastName: string }): void {}
// Call site clear: updateName({ firstName: "John", lastName: "Doe" })

// ❌ BAD: Three arguments (too many positional)
function createUser(name: string, email: string, age: number): void {}

// ✅ GOOD: Three arguments → use named params
function createUser(params: {
  name: string;
  email: string;
  age: number;
}): void {}

// ❌ BAD: Multiple arguments with object last (inconsistent)
function updateProfile(
  userId: string,
  updates: { name: string; bio: string },
): void {}

// ✅ GOOD: All params in single object (consistent)
function updateProfile(params: {
  userId: string;
  name: string;
  bio: string;
}): void {}
```

### VII. Vibrant Neobrutalism Design System

Follow vibrant neobrutalism principles for playful, energetic UI:

**Core Visual Language**:
- **Thick black borders**: 4-8px borders on desktop, 3-4px on mobile
- **Thick box shadows**: Solid offset shadows (6-12px) creating depth, no blur
- **Vibrant color palette**: Pink (pink-200 to pink-500), yellow (yellow-200 to yellow-400), cyan (cyan-200 to cyan-400), orange (orange-200 to orange-400)
- **Bold gradients**: Multi-color gradients for backgrounds and headers
- **Playful asymmetry**: Intentional rotations (-rotate-2 to rotate-3) on desktop only
- **Font weight extremes**: font-black (900) for headings, font-bold (700) for body
- **Uppercase headings**: All major headings in uppercase for impact
- **Emojis as design elements**: Strategic emoji use for visual personality

**Interaction Patterns**:
- **Shadow-based hover states**: Shadows reduce on hover with translate movement
- **Example**: `shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px]`
- **Transitions**: `transition-all` for smooth interactions
- **Transform on hover**: Remove rotations or add slight rotation changes

**Mobile-First Responsive**:
- **Remove rotations on mobile**: `md:rotate-2` instead of `rotate-2`
- **Smaller borders on mobile**: `border-4 md:border-6`
- **Smaller shadows on mobile**: `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`
- **Prevent horizontal overflow**: `overflow-hidden` on sections with rotated elements
- **Responsive typography**: `text-3xl md:text-7xl` scaling
- **Adequate touch targets**: Minimum 44x44px for mobile interactive elements

**Layout Patterns**:
- **Decorative background shapes**: Absolute positioned colored squares/circles with rotation and opacity
- **Section dividers**: Thick 4-8px black borders between sections
- **Sticky headers**: Gradient backgrounds, bold branding
- **Cards with depth**: Border + shadow combination, gradient backgrounds for variety
- **Numbered badges**: Rotated colored squares with bold numbers

**Rationale**: Vibrant neobrutalism creates energetic, playful brand personality that stands out. Bold visual elements are memorable and fast to implement. High contrast ensures accessibility. Mobile-first approach prevents layout breaks while preserving desktop playfulness.

**Examples**:

```typescript
// ✅ GOOD: Vibrant neobrutalist button
<Button className="bg-pink-400 hover:bg-pink-500 border-4 border-black
  shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
  hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
  hover:translate-x-[3px] hover:translate-y-[3px]
  font-black uppercase text-lg md:transform md:-rotate-2 transition-all">
  Get Started Free →
</Button>

// ❌ BAD: Soft, minimal design
<Button className="bg-gray-100 rounded-lg shadow-sm hover:shadow-md
  text-gray-700 px-4 py-2">
  Get Started
</Button>

// ✅ GOOD: Vibrant card with gradient and shadow
<div className="border-4 md:border-6 border-black bg-gradient-to-br
  from-pink-200 to-pink-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
  md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10
  md:transform md:hover:-rotate-2 transition-transform">
  <div className="bg-yellow-400 border-3 md:border-4 border-black
    w-16 h-16 md:w-20 md:h-20 flex items-center justify-center
    shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform -rotate-6">
    <div className="text-4xl md:text-5xl font-black">01</div>
  </div>
  <h4 className="text-xl md:text-3xl font-black uppercase">Voice Scan</h4>
  <p className="text-base md:text-xl font-bold">Description here</p>
</div>

// ❌ BAD: Subtle, minimal card
<div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
    <span className="text-white">1</span>
  </div>
  <h4 className="text-lg font-medium mt-4">Voice Scan</h4>
  <p className="text-gray-600 text-sm">Description here</p>
</div>

// ✅ GOOD: Mobile-first responsive heading
<h2 className="text-3xl md:text-7xl lg:text-8xl font-black uppercase
  leading-tight md:leading-none tracking-tight md:tracking-tighter
  md:transform md:-rotate-1">
  From "What's in my fridge?" to "What's for dinner?"
</h2>

// ❌ BAD: Non-responsive, rotation causes mobile overflow
<h2 className="text-7xl font-black uppercase transform -rotate-1">
  Heading text
</h2>
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

**Version**: 1.4.0 | **Ratified**: 2026-01-19 | **Last Amended**: 2026-01-21
