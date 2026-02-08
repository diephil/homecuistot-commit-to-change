# Development Approach

Our philosophy for building maintainable AI agents in 3 weeks.

**[← Back to README](../README.md)**

---

## Core Philosophy

**We didn't try to build the perfect and most complex AI agent in 3 weeks.** Instead, we focused on steady, small iterations toward building agents that can be improved over time through data-driven measurements using Opik.

**Build → Measure → Learn**

---

## Core Principles

### 1. Start Simple, Add Complexity Only When Data Proves It's Needed

We didn't build elaborate subagent delegation, complex guardrails, or multi-layer orchestration from day one. We built simple agents first, measured their performance with Opik, and added complexity only where measurements showed it was necessary.

**Example**: Started with Gemini `generateObject()` calls → Measured precision/recall gaps → Evolved to ADK agents with tools when data showed function-calling improved accuracy.

---

### 2. Keep the Surface Area of Improvements Manageable

It's better to have a simple, maintainable agent you can improve than a complex one you can't debug. Each agent has a clear responsibility and evaluation criteria.

**Agent Boundaries**:
- **Ingredient Extractor**: Add/remove operations only
- **Recipe Manager**: CRUD operations with ingredient validation
- **Inventory Manager**: Quantity updates and pantry management

---

### 3. Let Measurements Guide Architecture

Opik traces inform every decision: which agents need tools, where agents fall short, what prompts need refinement. We're not guessing—we're measuring.

**Data-Driven Examples**:
- Opik traces showed "greek yogurt" unrecognized → promoted to ingredient DB
- Span metadata showed users mixing languages → added auto-translation to ingredient extractor

---

## What We Did Right

- Iterative Development
- Opik traces inform agent improvements and database enrichment
- Each agent has clear responsibility and evaluation criteria (ingredient recognition scores, recipe operations scores, etc.)
- Full tracing, custom evaluation task metrics, prompt versioning from day one
- Feedback Loop: metadata and tags attached to Opik spans allow inspecting spans using Opik REST APIs and building a feedback loop mechanism that improves our system based on Opik production traces

---

## Where We're Still Iterating (Honest Limitations)

Here's what we're actively improving:

### 1. Dataset Refinement Needed

**Current**: Mixed creation/update/deletion operations in a single recipe-manager dataset

**Future**: Split into separate datasets (creation-only, update-only, deletion-only) for precise evaluation

**Reason**: Mixed scenarios add friction to performance analysis—we can't isolate which operation type is underperforming

---

### 2. Audio Processing Pipeline Validation

**Current**: Manual testing only for voice input flows

**Future Work**: Implement Opik audio datasets to test end-to-end voice flows (voice transcription to inventory/recipe management).

**Why**: Need automated evaluation of end-to-end voice flows, not just text-based agent testing

---

### 3. Custom Metric Performance

**Status**: Still tuning F1 thresholds and metric definitions

**Learning**: What "good enough" means for each agent type (precision vs recall trade-offs)

**Iterating**: Recipe ingredient extraction needs >95% F1, but inventory updates can tolerate lower precision if recall is high

---

## What We Learned About Opik Integration

See [Opik Integration Guide → Challenges & Solutions](OPIK_INTEGRATION.md#integration-challenges--solutions) for full technical details.

---

## Development Metrics

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

---

## Timeline Reference

For a detailed chronological breakdown of our 29 milestones across 3 weeks, see **[TIMELINE.md](../TIMELINE.md)**.

**Key Phases**:
- **Week 1**: Infrastructure & voice onboarding
- **Week 2**: Core features & recipe management
- **Week 3**: Advanced features & production polish

---

**[← Back to README](../README.md)** | **[View Opik Integration →](OPIK_INTEGRATION.md)** | **[View Timeline →](../TIMELINE.md)**
