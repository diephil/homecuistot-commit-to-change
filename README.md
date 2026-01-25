# Homecuistot

Know what you have, know what you can cook, eat better without thinking about it.

A meal planning app that helps you manage your pantry, discover recipes based on available ingredients, and simplify your daily cooking decisions.

## Why

HomeCuistot tackles a daily friction point: **"What's for dinner?"**

**Wellness angle:**

- Reduces reliance on takeout/fast food
- Minimizes food waste via "expiring soon" prioritization
- Builds sustainable home-cooking habits
- Removes decision fatigue stress

**Differentiated position:**
Most recipe apps fail because inventory management is tedious. Precise quantity tracking is overkill — users abandon it. HomeCuistot takes an opinionated stance:

1. **Approximate quantities are good enough** — "some chicken" beats "247g chicken breast"
2. **Voice-first input removes friction** — Conversational input is the future; typing ingredient lists is not

## Best Usage of Partners' Products: Opik & Google Gemini

This project demonstrates practical integration of sponsor technologies while contributing back to their ecosystems.

### Learn & Contribute to Opik

- This project uses Opik despite current TypeScript integration limitations. Part of the goal is to identify gaps and report them to help improve the ecosystem.

**Example:** 🚀 This project led to opening an issue and feature request for better Vercel AI SDK + TypeScript support in Opik -> [Github Issue](https://github.com/comet-ml/opik/issues/4798) - [Slack Opik Community](https://cometml.slack.com/archives/C01313D73BJ/p1768411737629269)

### Utilization of Gemini Models

- This project shows usage of the Gemini capabilities I discovered during Google Deepmind Workshop (22nd of January 2026). This is an opportunity to grow my Google Gemini skills.

**Example:** 🚀 Inside [this folder](./gemini-builds) you will find examples of built apps I did via AI Studio built, that helped me prototyping my ideas quickly

## Tech Stack

| Service         | Local                    | Production               |
| --------------- | ------------------------ | ------------------------ |
| **App**         | Next.js 16 + React 19    | Vercel                   |
| **Database**    | Supabase CLI             | Supabase Cloud           |
| **LLM Tracing** | Opik (Docker Compose)    | Opik Cloud               |
| **AI**          | Gemini via Vercel AI SDK | Gemini via Vercel AI SDK |

**Rationale:**

- **TypeScript** throughout for type safety and developer experience
- **Opik local** for running large experiments without hitting free tier span limits; **Opik Cloud** for production monitoring
- **Vercel AI SDK** with OpenAI and Gemini providers for flexible AI capabilities

## Live Demo

https://homecuistot-commit-to-change.vercel.app/

## Changelog

### Jan 25, 2026

- Dual-input onboarding: text fallback for voice input failures
- InfoCard component for user notifications
- Route structure simplified: /app/suggestions → /app
- Logout button in protected layout
- Bug fixes: login page and InfoCard styling
- Spec documentation for dual-input onboarding feature

### Jan 23, 2026

- Onboarding flow with voice input
- Gemini builds reference folder added

### Jan 21, 2026

- Login page revamped with new design
- New homepage layout
- Base pages UI foundation

### Jan 20, 2026

- shadcn/ui + RetroUI component library setup
- Database operations with Drizzle ORM
- PR template added

### Jan 19, 2026

- Supabase PostgreSQL integration
- Row Level Security policies
- Speckit workflow for feature planning

### Jan 18, 2026

- Google OAuth authentication
- Discord auth support -> to allow Encode jury to connect via their discord account
- Gemini AI integration with Vercel AI SDK
- Opik tracing for LLM observability
- GitHub Actions workflows

### Jan 17, 2026

- Initial monorepo setup
- Next.js 16 + React 19 baseline

## Developer

```bash
make dev-all    # Next.js + Opik + Supabase (full stack)
make dev        # Next.js only
make down       # Stop Opik + Supabase

# From apps/nextjs/
pnpm build      # Production build
pnpm lint       # ESLint
```
