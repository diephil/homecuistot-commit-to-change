# AI Coding Assistant Context

This document provides context for AI coding assistants (Claude Code, Gemini CLI, GitHub Copilot, Cursor, etc.)

## Project Overview

Homecuistot - meal planning app: "Know what you have, know what you can cook, eat better without thinking about it."

## Commands

```bash
# Development
make dev                    # Next.js only
make dev-all                # Next.js + Opik + Supabase (full stack)
make down                   # stop Opik + Supabase

# Individual services
make opstart / make opdown  # Opik (UI: http://localhost:5173)
make sbstart / make sbstop  # Supabase local

# Next.js (from apps/nextjs/)
pnpm dev                    # dev server
pnpm build                  # build
pnpm lint                   # eslint
```

## Architecture

**Monorepo:**

- `apps/nextjs/` - Next.js 16, React 19, Tailwind v4, React Compiler
- `infra/opik/` - Opik submodule for LLM tracing

**AI/LLM:**

- Vercel AI SDK + Google Gemini (`@ai-sdk/google`)
- OpenTelemetry → Opik exporter (`src/instrumentation.ts`)
- API routes: `src/app/api/*/route.ts`
- Use `OpikExporter.getSettings()` for telemetry in AI calls

**Auth:**

- Supabase Auth with Google OAuth
- Server client: `@/utils/supabase/server` (async `createClient()`)
- Browser client: `@/utils/supabase/client`
- OAuth callback: `/auth/callback` → exchanges code for session
- Route groups: `(auth)` for login, `(protected)` for authenticated pages

## Environment

`apps/nextjs/.env.local`:

- `GOOGLE_GENERATIVE_AI_API_KEY` - Google AI Studio
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Supabase key
- `OPIK_URL_OVERRIDE` - default: `http://localhost:5173/api`
