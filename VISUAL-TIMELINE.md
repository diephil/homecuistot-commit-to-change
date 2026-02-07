# HomeCuistot: 20-Day Build Timeline

```
Jan 17 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Feb 6

                    WEEK 1: FOUNDATION           WEEK 2: FEATURES        WEEK 3: AI + POLISH
         ├────────────────────────────┤────────────────────────────┤────────────────────────────┤

Jan 17   Jan 18-19      Jan 20-22         Jan 24-27           Jan 30-Feb 1        Feb 2-4         Feb 5-6
  │         │              │                  │                   │                 │               │
  │         │              │                  │                   │                 │               │
  ▼         ▼              ▼                  ▼                   ▼                 ▼               ▼

 INIT    INFRA        VOICE INPUT      INVENTORY DB      RECIPE MGMT      AI AGENTS       LAUNCH
  │         │              │                  │                   │                 │               │
  │         ├─ Auth        ├─ Whisper        ├─ 5,931           ├─ Schema         ├─ ADK-js       ├─ Story
  │         ├─ Opik        ├─ Onboarding        ingredients     ├─ CRUD              agents          onboarding
  │         ├─ DB+RLS      ├─ Dual input     ├─ Quantity       ├─ "What can      ├─ Datasets     ├─ PWA
  │         └─ UI base     └─ Observability     levels            I cook?"        ├─ Eval         ├─ Polish
  │                                                              ├─ Unrecognized   └─ Admin        └─ Demo data
  │                                                                 items             promotion
  │
  └─ Monorepo setup
```

---

## Key Milestones by Date

### **Jan 17** → Repo creation
First commit, monorepo structure

### **Jan 18-19** → Infrastructure (3 days)
- Next.js 16 + React 19 + TypeScript strict
- Google OAuth via Supabase Auth
- Opik tracing (Docker + OpenTelemetry)
- Drizzle ORM + PostgreSQL with Row Level Security

### **Jan 20-22** → Voice-first UX (3 days)
- Whisper-1 transcription
- Gemini Flash Lite for ingredient extraction
- Dual-input onboarding (voice + text fallback)
- Opik prompt versioning + datasets

### **Jan 24-27** → Ingredient database (4 days)
- 5,931 ingredients from OpenFoodFacts taxonomy (30 categories)
- User inventory with 4-level quantity scale (0-3)
- Ingredient matching + persistence
- Unrecognized item tracking

### **Jan 30 - Feb 1** → Recipe management (3 days)
- Schema refactor (consolidated data model)
- Recipe CRUD operations
- "What can I cook?" feature
- Auto-decrement inventory on "mark as cooked"
- Unrecognized items schema + UI

### **Feb 2-4** → AI agents + observability (3 days)
- **Google ADK-js multi-tool agents**:
  - Inventory Manager (voice-controlled pantry)
  - Recipe Manager (batch operations)
  - Ingredient Extractor (multilingual with 200-item eval dataset)
- Admin promotion workflow (Opik Cloud API integration)
- Story-based onboarding (7-scene narrative)

### **Feb 5-6** → Production launch (2 days)
- Story onboarding polish (scene reordering)
- PWA support (mobile install)
- Landing page revamp
- Demo data seeding for jury
- Final deployment to Vercel

---

## Timeline at a Glance

| Phase | Duration | Key Output |
|-------|----------|------------|
| **Foundation** (Jan 17-19) | 3 days | Auth + DB + Opik |
| **Voice Input** (Jan 20-22) | 3 days | Whisper + Gemini onboarding |
| **Inventory DB** (Jan 24-27) | 4 days | 5,931 ingredients + quantity tracking |
| **Recipe Features** (Jan 30 - Feb 1) | 3 days | CRUD + "What can I cook?" |
| **AI Agents** (Feb 2-4) | 3 days | ADK-js agents + datasets + admin tools |
| **Launch Polish** (Feb 5-6) | 2 days | Story onboarding + PWA + demo data |
| **Total** | **20 days** | **Prod-ready app** |

---

## Commit Activity Heatmap

```
Week 1 (Jan 17-24):  ████████████████████████ (Infrastructure + Voice)
Week 2 (Jan 25-31):  ███████████████████████  (Inventory + Recipes)
Week 3 (Feb 1-6):    ████████████████████████ (AI Agents + Polish)
```

**Total commits**: 400+
**Milestones documented**: 29
**Lines of code**: ~15,000 (TypeScript, excluding node_modules)

---

## Build Velocity

```
Days 1-3:   Infra setup (auth, DB, tracing)          ⚡ Foundation
Days 4-6:   Voice input + onboarding                  🎤 Core UX
Days 7-10:  Ingredient DB + inventory                 🗄️ Data layer
Days 11-14: Recipe management + discovery             🍳 Features
Days 15-17: AI agents + observability                 🤖 Intelligence
Days 18-20: Story onboarding + launch polish          🚀 Production
```

**Outcome**: Production-ready voice-first meal planning app in 20 days

---

## Tech Evolution

```
                 SIMPLE → ADVANCED → PRODUCTION
                    │         │           │
Jan 17-20:     Next.js    Whisper     Opik local
Jan 20-27:     Gemini     Inventory   RLS + migrations
Jan 30-Feb 1:  Recipes    CRUD        Unrecognized items
Feb 2-6:       ADK-js     Datasets    Opik Cloud + PWA
```

**Final stack**:
- Frontend: Next.js 16 + React 19 + Tailwind CSS v4
- AI: Gemini 2.5 Flash Lite + Whisper-1 + Google ADK-js
- Database: Supabase PostgreSQL + Drizzle ORM + RLS
- Observability: Opik Cloud + OpenTelemetry
- Deployment: Vercel + PWA

---

**Live demo**: https://homecuistot-commit-to-change.vercel.app/
