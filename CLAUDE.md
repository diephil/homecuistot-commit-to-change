# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Homecuistot - meal planning app: "Know what you have, know what you can cook, eat better without thinking about it."

## Commands

```bash
# Dev server (Next.js)
make dev                    # or: cd apps/nextjs && pnpm dev

# LLM observability (Opik)
make opik                   # start local Opik (UI: http://localhost:5173)
make down                   # stop Opik

# Next.js scripts
cd apps/nextjs
pnpm build                  # build
pnpm lint                   # eslint
pnpm start                  # production server
```

## Architecture

**Monorepo structure:**
- `apps/nextjs/` - Next.js 16 app (React 19, Tailwind v4, React Compiler enabled)
- `infra/opik/` - Opik submodule for local LLM tracing

**AI/LLM integration:**
- Vercel AI SDK (`ai`) + Google Gemini (`@ai-sdk/google`)
- OpenTelemetry tracing via `@vercel/otel` → Opik exporter
- Instrumentation at `src/instrumentation.ts`

**API routes pattern:**
- `src/app/api/*/route.ts` - Next.js route handlers
- Use `OpikExporter.getSettings()` for telemetry in AI calls

## Environment

Copy `apps/nextjs/.env.local.example` → `.env.local`:
- `GOOGLE_GENERATIVE_AI_API_KEY` - from Google AI Studio
- `OPIK_URL_OVERRIDE` - default: `http://localhost:5173/api`
- `OPIK_PROJECT_NAME` - Opik project identifier
