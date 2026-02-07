# HomeCuistot Development Timeline
## From Foundation to Production (Jan 17 - Feb 8, 2026)

**Live Demo**: https://homecuistot-commit-to-change.vercel.app/

This document traces the iterative development of HomeCuistot, a voice-first meal planning app built for the Encode AI x Comet Opik Commit To Change Hackathon. The timeline demonstrates a systematic approach: infrastructure first, then core features, followed by AI agent evolution and production polish.

---

## Development Timeline: 3 Weeks, 29+ Milestones

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
| **Development Period** | 20 days (Jan 17 - Feb 8, 2026) |
| **Total Milestones** | 29 feature specifications |
| **Git Commits** | 400+ commits |
| **Database Ingredients** | 5,931 across 30 categories |
| **AI Models** | Gemini 2.0/2.5 Flash Lite, OpenAI Whisper-1 |
| **Evaluation Dataset** | 200+ test cases for ingredient extraction |
| **Tech Stack** | Next.js 16, React 19, Supabase, Opik, Drizzle ORM |
| **Architecture** | Server Components, Server Actions, Row Level Security |
