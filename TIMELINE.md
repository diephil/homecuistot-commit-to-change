# HomeCuistot Development Timeline
## From Foundation to Production (Jan 17 - Feb 6, 2026)

**Live Demo**: https://homecuistot-commit-to-change.vercel.app/

This document traces the iterative development of HomeCuistot, a voice-first meal planning app built for the Encode AI x Comet Opik Commit To Change Hackathon. The timeline demonstrates a systematic approach: infrastructure first, then core features, followed by AI agent evolution and production polish.

---

## Development Philosophy

**Build → Measure → Learn**
- 29 feature specifications with explicit acceptance criteria
- Milestone includes spec.md, plan.md, tasks.md, data-model.md
- Git history shows 400+ commits across 20 days
- Continuous deployment to Vercel for rapid feedback

**Evidence-Based Quality**
- Opik tracing for all AI calls (OpenTelemetry → Opik exporter)
- Dataset-driven evaluation framework
- Row Level Security for multi-tenant data isolation
- Type-safe TypeScript

---

### Observability & Evaluation Stack

**Tracing Pipeline**:
1. **Vercel AI SDK calls** → OpenTelemetry → Opik exporter (automatic)
2. **Google ADK-js agents** → Manual Opik tracing (custom wrapper functions) -> no native integration with Opik for Google TYPESCRIPT ADK.
3. **All traces** → Opik Cloud for production monitoring

**Prompt Management**:
- Prompts versioned in Opik Cloud
- Registration via `pnpm prompt:all` (local) or `pnpm prompt:all:prod` (production)
- Each agent has versioned prompt file (`prompt.ts`)

**Dataset Framework**:
- **Ingredient Extractor**: 200-item test dataset
  - Multilingual input samples (English, French, Spanish)
  - Edge cases (ambiguous items, brand names, quantities)
  - Metrics: Precision, Recall, F1 Score
- **Recipe Manager**: Custom dataset for ingredient update operations
  - Add/remove ingredient scenarios
  - Batch update operations
  - Validation: Correct ingredient linking, optional vs required tracking
- **Inventory Manager**: Evaluation dataset for voice-controlled operations
  - Refill/delete/update quantity scenarios
  - Bulk operations ("refill everything")
  - Validation: Correct quantity level updates, pantry staple handling

**Evaluation Execution**:
```bash
pnpm eval          # Run single evaluation (local Opik)
pnpm eval:all      # Run all evaluations (local Opik)
```

**Continuous Improvement Loop**:
1. Capture real user inputs via Opik traces
2. Identify misclassifications in admin dashboard
3. Add failing cases to evaluation datasets
4. Refine prompts and re-evaluate
5. Promote unrecognized items to ingredient database

---

## Phase 1: Foundation (Jan 17-20, 2026)

### Milestone 001 - App Baseline (Jan 17-18)
**Goal**: Establish infrastructure and authentication

**Achievements**:
- Next.js 16 + React 19 with TypeScript strict mode
- Google OAuth via Supabase Auth (@supabase/ssr)
- Opik LLM tracing infrastructure (Docker Compose + git submodule)
- Gemini AI SDK integration (Vercel AI SDK + @ai-sdk/google)
- Local development environment (Next.js + Supabase CLI + Opik)

**Key Decision**: Local-first development with Docker Compose for Opik, Supabase CLI for database → iterate without cloud service dependencies during development

**Tech**: Next.js 16 App Router, Supabase Auth, Opik Docker, Gemini Flash Lite

---

### Milestone 002 - Database Operations (Jan 19)
**Goal**: Multi-tenant data isolation with Row Level Security

**Achievements**:
- Drizzle ORM 0.45.1 + Supabase PostgreSQL
- Row Level Security (RLS) policies for user data isolation
- User-scoped database client (`createUserDb()`) vs admin client (`adminDb`)
- Migration system with schema-first workflow

**Key Decision**: RLS at database layer → eliminates entire class of authorization bugs; user-scoped client creation pattern enforced via code review

**Tech**: Drizzle ORM, PostgreSQL, RLS policies

---

### Milestone 003 - Base Pages UI (Jan 19-20)
**Goal**: Design system and navigation structure

**Achievements**:
- Landing page with RetroUI + shadcn/ui components
- Login flow with OAuth redirect handling
- App dashboard, onboarding, and suggestions page structure
- Neobrutalism design system foundations (thick borders, bold shadows, vibrant gradients)

**Tech**: shadcn/ui, RetroUI, Tailwind CSS v4, lucide-react

---

## Phase 2: Core Features (Jan 20-27)

### Milestone 004 - Onboarding Flow (Jan 20-21)
**Goal**: Voice-first ingredient capture

**Achievements**:
- Voice input using OpenAI Whisper transcription
- Dual-input system (voice + text fallback)
- Neobrutalism UI components (VoiceButton, InfoCard)
- Loading states and error handling

**Key Decision**: Whisper-1 for transcription (higher accuracy than Gemini Audio API in testing), Gemini for ingredient extraction → separation of concerns

**Tech**: OpenAI Whisper-1, Gemini Flash Lite, Web Audio API

---

### Milestone 005 - LLM Observability (Jan 22)
**Goal**: Production-ready AI monitoring

**Achievements**:
- Opik prompt versioning and registration scripts
- OpenTelemetry integration for Vercel AI SDK calls
- Dataset registration workflow (`pnpm dataset:register`)
- Evaluation framework foundations

**Key Decision**: Opik local for development (unlimited spans), Opik Cloud for production monitoring → cost-effective iteration

**Tech**: Opik, OpenTelemetry, Vercel AI SDK

---

### Milestone 006 - Admin Dashboard (Jan 22)
**Goal**: Secure admin-only routes

**Achievements**:
- Unauthorized access page with custom middleware
- Admin-only route protection (`requireAdmin()` helper)
- User management interface placeholder

**Tech**: Next.js 16 middleware (`proxy.ts`), Supabase Auth

---

### Milestone 007 - Dual Input Enhancement (Jan 22-23)
**Goal**: Accessibility and fallback options

**Achievements**:
- Text input fallback when microphone permission denied
- Hint system for voice input guidance
- Improved transcription error handling with retry logic

**Key Decision**: Text fallback required for accessibility compliance → never block users from core functionality due to hardware/permission issues

---

### Milestone 008 - Drizzle Migrations (Jan 23-24)
**Goal**: Robust schema evolution workflow

**Achievements**:
- Manual migration generator for complex schema changes
- Migration status tracking (`pnpm db:status`)
- Migration verification commands
- Verbose logging in `drizzle.config.ts`

**Tech**: Drizzle Kit, PostgreSQL migrations

---

### Milestone 009 - Ingredient Migration (Jan 24-25)
**Goal**: Comprehensive ingredient database

**Achievements**:
- Loaded 5,931 ingredients across 30 categories
- Sourced from OpenFoodFacts food taxonomy
- SQL migration for bulk ingredient insertion
- Category-based organization (meat, dairy, vegetables, fruit, etc.)

**Key Decision**: Pre-populate ingredient database instead of dynamic creation → faster matching, consistent categorization

**Tech**: OpenFoodFacts taxonomy, PostgreSQL, Drizzle migrations

---

### Milestone 010 - User Pantry Staples (Jan 25-26)
**Goal**: Inventory management with quantity levels

**Achievements**:
- User inventory table with quantity levels (0=critical, 1=low, 2=some/enough, 3=plenty)
- Pantry staple tracking (salt, pepper, olive oil → never decrement)
- Ingredient alias removal for cleaner data model

**Key Decision**: 4-level quantity scale (0-3) instead of exact counts → reduces user friction while maintaining sufficient granularity for recipe matching

---

### Milestone 011 - Onboarding Data Persistence (Jan 26-27)
**Goal**: Connect voice input to database

**Achievements**:
- Voice input → ingredient extraction → database writes
- Ingredient matching logic (case-insensitive, lowercase storage)
- Unrecognized item tracking for admin review
- RLS-enforced user data isolation

**Tech**: Gemini Flash Lite, Drizzle ORM, RLS

---

## Phase 3: Feature Expansion (Jan 27 - Feb 1)

### Milestone 012 - Schema Refactor (Jan 27-28)
**Goal**: Consolidate data model

**Achievements**:
- Merged pantry staples into single `user_inventory` table
- Renamed `recipes` → `user_recipes` for clarity
- Streamlined ingredient-recipe relationships via `recipe_ingredients` join table
- Migration with zero downtime

---

### Milestone 013 - Recipe Management (Jan 28-29)
**Goal**: Save, update, delete recipes

**Achievements**:
- Recipe CRUD operations with RLS enforcement
- Recipe-ingredient linking system
- Optional vs required ingredient tracking (for recipe availability calculation)
- Ingredient extraction from recipe descriptions

**Tech**: Gemini Flash Lite for ingredient extraction, Drizzle ORM

---

### Milestone 014 - Inventory Page Rework (Jan 29-30)
**Goal**: Improved inventory management UI

**Achievements**:
- Redesigned inventory page with category filtering
- Ingredient CRUD (add, update quantity, delete)
- Quantity level visualization (badges with color coding)
- Search and filter by category

**Tech**: React 19, Tailwind CSS v4

---

### Milestone 015 - App Page Revamp (Jan 30-31)
**Goal**: "What can I cook?" feature

**Achievements**:
- Recipe discovery based on available ingredients
- Cooking log to track ingredient consumption
- "Mark as Cooked" workflow with automatic inventory decrementing
- Recipe availability calculation (ready/almost-ready/missing states)

**Key Decision**: Automatic inventory decrement on "mark as cooked" → reduces manual tracking friction, keeps inventory accurate

---

### Milestone 016 - Voice Recipe Editor (Jan 31)
**Goal**: Voice-driven recipe updates

**Achievements**:
- Voice input for recipe updates (add/remove ingredients)
- Whisper transcription integration
- Dual-input recipe modification (voice + text fallback)

---

### Milestone 017 - Demo Data Reset (Feb 1)
**Goal**: Jury testing preparation

**Achievements**:
- Demo account reset functionality for consistent testing
- Seed data generation (Sarah's inventory + carbonara recipe)
- Admin "Reset User Data" feature

**Key Decision**: Demo data reset for jury → ensures consistent starting point for all evaluators

---

### Milestone 018 - Unrecognized Items Schema (Feb 1)
**Goal**: Support for items not in ingredient database

**Achievements**:
- Added `unrecognized_item_id` to `recipe_ingredients` and `user_inventory`
- Schema support for user-created ingredients
- Prepared for admin-driven ingredient promotion workflow

---

### Milestone 019 - Onboarding Revamp (Feb 1)
**Goal**: Improved UX and help system

**Achievements**:
- Rebuilt onboarding flow with better visual hierarchy
- Help modal with voice input guidance
- Unrecognized item persistence during onboarding
- Progressive disclosure of features

---

### Milestone 021 - Unrecognized Items Display (Feb 1)
**Goal**: User-facing unrecognized item indicators

**Achievements**:
- UI for viewing unrecognized ingredients
- Admin review interface placeholder
- Badge indicators for unrecognized items in inventory/recipes

---

### Milestone 022 - Homepage Revamp (Feb 1)
**Goal**: Clearer value proposition

**Achievements**:
- Redesigned landing page with simplified copy
- Improved login page design
- Consistent navigation patterns across public pages

---

## Phase 4: Advanced Features (Feb 1-6)

### Milestone 023 - Admin Ingredient Promotion (Feb 2)
**Goal**: Turn unrecognized items into recognized ingredients

**Achievements**:
- Opik Cloud API integration for trace analysis
- Admin dashboard to review unrecognized items from Opik traces
- Ingredient promotion workflow (unrecognized → recognized with category assignment)
- Bulk review interface (50 traces at a time)
- Tag-based span tracking (`unrecognized_items` → `promotion_reviewed`)

**Key Decision**: Use Opik traces as data source for admin review → captures real user input patterns, enables continuous ingredient database enrichment

**Tech**: Opik Cloud API, Gemini Flash Lite, Drizzle ORM

---

### Milestone 024 - Story Onboarding (Feb 2-3)
**Goal**: Narrative-driven user education

**Achievements**:
- Redesigned onboarding as 7-scene interactive story ("Sam's Fridge Story")
- Scene 1-3: Static narrative (Sam doesn't know what's in her fridge)
- Scene 4: Voice input to add groceries (eggs + parmesan required to proceed)
- Scene 5: Recipe card shows "READY" state with checkmarks
- Scene 6: "Mark as Cooked" modal showing ingredient decrement
- Scene 7: Manifesto + "Get started" CTA
- localStorage-based demo state (persists across refresh)

**Key Decision**: Story-based onboarding instead of feature checklist → shows product value through narrative, increases completion rate (target >80%)

**Tech**: React 19 state management, localStorage, Web Audio API

---

### Milestone 025 - Onboarding Integration (Feb 3)
**Goal**: Replace old onboarding with story flow

**Achievements**:
- Integrated story onboarding as default for brand-new users
- Database persistence on "Get started" (demo data → user account)
- Orchestrator agent to coordinate onboarding steps
- Quantity scale legend for user education

**Key Decision**: Pre-fill demo data for new users → provides immediate value, prevents "empty state" friction

---

### Milestone 026 - PWA Support (Feb 4)
**Goal**: Mobile-first experience

**Achievements**:
- Progressive Web App manifest configuration
- Install prompts for mobile users (iOS + Android)
- Offline-ready service worker configuration
- App icon and splash screen assets

**Tech**: Next.js PWA plugin, Service Workers

---

### Milestone 027 - Improved Onboarding Story (Feb 4-5)
**Goal**: Polish narrative flow

**Achievements**:
- Enhanced scene transitions with fade animations
- Quantity scale explanations (plenty/some/enough/low/critical)
- Improved ingredient categorization display
- Refined voice input instructions with progressive hints

---

### Milestone 028 - Onboarding Finale Revamp (Feb 5)
**Goal**: Optimized scene flow

**Achievements**:
- Reordered scenes for better narrative progression
- Optimized Scene 6 (ingredient review) for clarity
- Skip onboarding option for returning users
- Loading screen with reassuring copy during demo data persistence

---

### Milestone 029 - Landing Page Revamp (Feb 5-6)
**Goal**: Final production polish

**Achievements**:
- Simplified landing page copy (faster comprehension)
- Admin navigation for jury access
- Demo data seeding for non-admin jury members
- Final design polish before submission

---

## AI Agent Evolution

### Initial Approach (Jan 17 - Feb 1)
**Simple function calling with Gemini**

**Pattern**:
```typescript
// Direct Vercel AI SDK integration
const result = await generateObject({
  model: gemini("gemini-2.0-flash-lite"),
  schema: IngredientExtractionSchema,
  prompt: `Extract ingredients from: ${text}`
});
```

**Observability**: OpenTelemetry → Opik exporter (automatic tracing via `instrumentation.ts`)

**Evaluation**: Manual testing, no automated datasets

---

### Advanced Agents (Feb 2-6)
**Multi-tool agents with Google ADK-js**

#### **Ingredient Extractor Agent (first LLM Agent, later sunsetted to use the next 2 AI Agents)**
- **Purpose**: Extract add/remove operations from voice/text
- **Tech**: Gemini 2.5 Flash Lite + Whisper-1 (multilingual support with auto-translation)
- **Evaluation**: 200-item dataset with comprehensive metrics
  - Precision: % of extracted ingredients that are correct
  - Recall: % of actual ingredients successfully extracted
  - F1 Score: Harmonic mean of precision and recall
  - Target: >95% accuracy
- **Tracing**: Manual Opik tracing (ADK-js not natively supported by OpenTelemetry exporter)

#### **Recipe Manager Agent**
- **Purpose**: Multi-tool agent for recipe CRUD with batch operations
- **Tools**:
  - `addRecipe(name, ingredients[], optionalIngredients[])`
  - `updateRecipe(recipeId, updates)`
  - `deleteRecipe(recipeId)`
- **Evaluation**: Custom dataset for ingredient update accuracy
- **Pattern**: Google ADK-js `LlmAgent` with tool registration

#### **Inventory Manager Agent**
- **Purpose**: Voice-controlled pantry management
- **Tools**:
  - `updateMatchingIngredients(action, ingredientNames[])`
  - `updateAllTrackedIngredients(action)` (for bulk "refill all" operations)
- **Evaluation**: Dedicated dataset for voice-controlled inventory operations
- **Tech**: Google ADK-js with Opik manual tracing

#### **Onboarding Orchestrator**
- **Purpose**: Coordinates multi-step onboarding with translation support
- **Features**:
  - Scene progression logic
  - Demo state management
  - Database persistence coordination
- **Tech**: Gemini 2.5 Flash Lite with Opik tracing

---

## Tech Stack Progression

### Week 1 (Jan 17-24): Foundation
**Stack**: Next.js 16 → Supabase Auth → Opik Docker → Drizzle ORM

**Focus**: Infrastructure and authentication

**Key Milestones**:
- Google OAuth with Supabase
- Row Level Security for multi-tenant isolation
- Ingredient database with 5,931 items
- Voice transcription with Whisper-1

---

### Week 2 (Jan 24-31): Core Features
**Stack**: Whisper-1 → Gemini Flash Lite → Recipe Management

**Focus**: Voice-first interactions and recipe matching

**Key Milestones**:
- Voice input onboarding
- Inventory management with quantity levels
- Recipe CRUD operations
- "What can I cook?" recipe discovery

---

### Week 3 (Feb 1-6): Production Polish
**Stack**: Google ADK-js → Opik Cloud → Story Onboarding → PWA

**Focus**: AI agents, observability, and user experience

**Key Milestones**:
- Multi-tool AI agents (Inventory Manager, Recipe Manager)
- Admin ingredient promotion workflow
- Story-based onboarding (7-scene narrative)
- Dataset-driven evaluation framework
- PWA support for mobile installation

---

## Key Metrics

| Metric | Value |
|--------|-------|
| **Development Period** | 20 days (Jan 17 - Feb 6, 2026) |
| **Total Milestones** | 29 feature specifications |
| **Git Commits** | 400+ commits |
| **Database Ingredients** | 5,931 across 30 categories |
| **AI Models** | Gemini 2.0/2.5 Flash Lite, OpenAI Whisper-1 |
| **Evaluation Dataset** | 200+ test cases for ingredient extraction |
| **Tech Stack** | Next.js 16, React 19, Supabase, Opik, Drizzle ORM |
| **Architecture** | Server Components, Server Actions, Row Level Security |

---

## Verification & Demo

**Live Production**:
- URL: https://homecuistot-commit-to-change.vercel.app/
- OAuth providers: Google, Discord (for jury access)
- Admin dashboard: `/admin` (accessible to all for demo)
- Demo data reset: Available for consistent jury testing

**Documentation**:
- All 29 milestones documented in `/specs/` directory
- Each milestone: `spec.md`, `plan.md`, `tasks.md`, `data-model.md`
- Git history shows iterative development (use `git log --oneline` to browse)

**Observability**:
- Opik Cloud production monitoring
- All AI calls traced with metadata tags (user ID, scene, agent name)
- Dataset evaluations for quality assurance
- Admin dashboard for continuous ingredient enrichment

**Local Development**:
```bash
make dev-all    # Next.js + Opik + Supabase (full stack)
make dev        # Next.js only
make down       # Stop services

# From apps/nextjs/
pnpm build      # Production build
pnpm lint       # ESLint + TypeScript checks
pnpm test       # Run test suite
```

---

## Lessons Learned

### What Worked Well
1. **Infrastructure First** → Solid foundation enabled rapid feature iteration
2. **RLS at Database Layer** → Eliminated entire class of authorization bugs
3. **Voice-First UX** → Differentiated product, validated by user testing
4. **Opik Local + Cloud** → Cost-effective iteration (local) + production monitoring (cloud)
5. **Story Onboarding** → Higher completion rate vs feature checklist approach
6. **Dataset-Driven Evaluation** → Continuous quality improvement with measurable metrics

### Challenges Overcome
1. **Gemini JSON Schema Limitations** → No `z.enum()` support; used `z.string()` + prompt validation
2. **Google ADK-js Tracing** → No native OpenTelemetry support; built custom Opik wrappers
3. **Quantity Level Ambiguity** → 4-level scale (0-3) required user education via onboarding
4. **Unrecognized Ingredients** → Admin promotion workflow turned limitation into continuous improvement

### Future Optimizations
1. **Batch Recipe Analysis** → Process multiple recipes in single AI call (reduce latency)
2. **Voice Command Shortcuts** → "Refill everything", "Delete all low items"
3. **Expiration Date Tracking** → Prioritize recipes using ingredients expiring soon
4. **Collaborative Shopping Lists** → Share ingredient needs with household members
5. **Mobile App** → Native iOS/Android experience (current PWA is web-based)

---

## Opik and lessons learnt

**Opik Integration Learnings**:
- Opened GitHub issue for Vercel AI SDK + TypeScript support for `threadId` that was incomplete: [#4798](https://github.com/comet-ml/opik/issues/4798)
- Opik span "search" API is not immediately refreshed after updating tags of a span (index still serves stale data). I had to confirm the updates via fetching the span by its ID instead.
- Whisper-1 wasn't properly tracing the token counts using Opik OpenAI integration. I had to fallback to custom traces.

**Gemini Integration Patterns**:
- Documented JSON schema workarounds for production use
- Shared multilingual voice + auto-translation patterns
- Built reusable agent architectures with Opik tracing

---

**End of Timeline**

*This project demonstrates the power of iterative development, evidence-based quality assurance, and thoughtful AI integration. From infrastructure foundations to production-ready features in 20 days.*
