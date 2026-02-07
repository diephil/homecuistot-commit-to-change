# HomeCuistot Development Timeline
## From Foundation to Production (Jan 17 - Feb 6, 2026)

**Live Demo**: https://homecuistot-commit-to-change.vercel.app/

This document traces the iterative development of HomeCuistot, a voice-first meal planning app built for the Encode AI x Comet Opik Commit To Change Hackathon. The timeline demonstrates a systematic approach: infrastructure first, then core features, followed by AI agent evolution and production polish.

---

## Development Philosophy

The goal wasn't to architect the perfect and most complex AI agent in 3 weeks, but to iterate steadily with data-driven improvements. Start simple, measure with Opik, identify gaps, refine. Complex patterns—multi-agent delegation, elaborate guardrails, callback orchestration—are added only when measurements prove they're needed, not upfront. This approach keeps the system maintainable by limiting the improvement surface area at any stage.

**Build → Measure → Learn**: 29 feature specs with explicit acceptance criteria, 400+ commits across 20 days, continuous Vercel deployment for rapid feedback

**Evidence-Based Quality**: Opik tracing for all AI calls (OpenTelemetry → Opik exporter), dataset-driven evaluation, Row Level Security for multi-tenant isolation, type-safe TypeScript

---

### Observability & Evaluation Stack

**Tracing Pipeline**:
1. **Vercel AI SDK calls** → OpenTelemetry → Opik exporter (automatic)
2. **Google ADK-js agents** → Manual Opik tracing (custom wrapper functions) -> no native integration with Opik for Google TYPESCRIPT ADK.
3. **All traces** → Opik Cloud for production monitoring, setting custom tags and metadata to post-processing and feedback loop implementation

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

## Development Timeline: 3 Weeks, 29 Milestones

### Week 1 (Jan 17-24): Foundation & Infrastructure

**Infrastructure (001-003)**:
- Next.js 16 + React 19 (TypeScript strict mode)
- Supabase Auth (Google OAuth)
- Opik LLM tracing (Docker Compose)
- Gemini AI SDK integration
- RetroUI + shadcn/ui landing page (neobrutalism design)
- Drizzle ORM + RLS policies (user-scoped `createUserDb()` pattern)

**Voice & AI (004-007)**:
- Voice-first onboarding (Whisper-1 transcription)
- Dual-input system (voice + text fallback)
- Opik prompt versioning + OpenTelemetry tracing
- Dataset registration workflow
- Admin dashboard (`requireAdmin()` protection)

**Database (008-009)**:
- Drizzle migration system (manual generator, status tracking)
- 5,931 ingredients from OpenFoodFacts (30 categories)
- Pre-populated DB for faster matching

**Key Decision**: Local-first dev (Docker Compose + Supabase CLI) → rapid iteration without cloud dependencies. RLS at DB layer → eliminated authorization bugs.

---

### Week 2 (Jan 24-31): Core Features & Recipe Management

**Inventory (010-011)**:
- 4-level quantity scale (0=critical, 1=low, 2=some/enough, 3=plenty)
- Pantry staple tracking (never decrement)
- Voice input → ingredient extraction → DB writes (RLS-enforced)
- Unrecognized item tracking

**Schema & CRUD (012-013)**:
- Consolidated schema (`user_inventory`, `user_recipes`, `recipe_ingredients`)
- Recipe CRUD with RLS enforcement
- Optional vs required ingredient tracking
- Ingredient extraction from recipe descriptions

**UI & Discovery (014-016)**:
- Inventory page redesign (category filtering, search, badges)
- "What can I cook?" recipe discovery (ready/almost-ready/missing states)
- "Mark as Cooked" workflow (auto inventory decrement)
- Voice recipe editor
- Demo data reset (017)

**Key Decision**: Auto inventory decrement on "mark as cooked" → reduces manual tracking friction.

---

### Week 3 (Feb 1-6): Advanced Features & Production Polish

**Unrecognized Items (018-019, 021-022)**:
- `unrecognized_item_id` schema support
- Badge indicators + admin review UI
- Onboarding revamp (help modal, progressive disclosure)
- Landing/login page redesign

**Admin Promotion (023)**:
- Opik Cloud API integration (trace analysis)
- Admin dashboard (review unrecognized items from traces)
- Ingredient promotion workflow (unrecognized → recognized)
- Bulk review interface (50 traces at a time)
- Tag-based span tracking (`unrecognized_items` → `promotion_reviewed`)
- Continuous enrichment loop: traces → review → DB growth

**Story Onboarding (024-025, 027-028)**:
- 7-scene interactive narrative ("Sam's Fridge Story")
- localStorage demo state + DB persistence
- Orchestrator agent + quantity scale legend
- Scene transitions with fade animations
- Pre-filled demo data for new users

**Production (026, 029)**:
- PWA support (manifest, install prompts, service worker)
- Final landing page polish + admin navigation
- Demo data seeding for jury

**Key Decision**: Story-based onboarding (vs checklist) → shows value through narrative (>80% completion target). Opik traces as data source → continuous ingredient enrichment from real user patterns.

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

**Live Production**: https://homecuistot-commit-to-change.vercel.app/ | OAuth: Google, Discord | Admin: `/admin` (accessible to all)

**Documentation**: 29 milestones in `/specs/` directory (spec.md, plan.md, tasks.md, data-model.md per milestone) | Commands in `/CLAUDE.md`

**Observability**: Opik Cloud production monitoring with metadata tags (user ID, scene, agent name) | Dataset evaluations | Admin ingredient enrichment dashboard

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
- If I had time to do it again, I would instead create multiple datasets for testing the `Recipe manager` agent, 1 dataset per recipe operation (Create, update, deletion, mixed, etc...)

**Gemini Integration Patterns**:
- Documented JSON schema workarounds for production use
- Shared multilingual voice + auto-translation patterns
- Built reusable agent architectures with Opik tracing

---

**End of Timeline**

