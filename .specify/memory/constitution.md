<!--
═══════════════════════════════════════════════════════════════════════════
SYNC IMPACT REPORT - Constitution Update
═══════════════════════════════════════════════════════════════════════════

Version Change: NEW → 1.0.0 (Initial ratification - MVP Phase)

Principles Established:
- I. MVP-First Development
- II. Pragmatic Type Safety
- III. Essential Validation Only
- IV. Test-Ready Infrastructure

Sections Added:
- Core Principles (4 MVP-phase principles)
- MVP Constraints (2-week timeline, speed priorities)
- Post-MVP Migration Path
- Governance (lightweight for MVP phase)

Templates Status:
✅ plan-template.md - Constitution Check compatible with MVP constraints
✅ spec-template.md - Requirements align with essential validation
✅ tasks-template.md - Testing optional per constitution
⚠ Commands templates - Directory does not exist; no updates needed

Follow-up TODOs:
- Post-MVP hardening phase (after 2-week deadline)

Rationale:
- MAJOR version 1.0.0: Initial constitution ratification
- MVP-phase constitution optimized for 2-week delivery timeline
- Balances speed with essential safeguards for real users
- Includes post-MVP migration path to full rigor

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

- **MAJOR**: Phase transitions (MVP → Hardening → Production)
- **MINOR**: Principle adjustments within phase
- **PATCH**: Clarifications and corrections

### Compliance Review

- Critical safeguards (data loss, auth, security) MUST be verified
- Other principles are guidelines, not gates
- When in doubt: ship first, fix later (unless it affects users negatively)

**Version**: 1.0.0 | **Ratified**: 2026-01-19 | **Last Amended**: 2026-01-19
