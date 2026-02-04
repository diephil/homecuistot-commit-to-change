# Quickstart: Admin Unrecognized Ingredient Promotion

**Feature Branch**: `023-admin-ingredient-promotion`
**Status**: Implementation Ready
**Target Completion**: 5 phases, incremental commits

This guide walks developers through implementing the Admin Ingredient Promotion feature step-by-step, with code patterns, file locations, and validation checkpoints.

---

## Overview

The Admin Ingredient Promotion feature lets admins review unrecognized ingredients detected during recipe operations (captured in Opik LLM traces) and promote them into the ingredients database with proper categories.

**Key Architecture**:
- Browser (Admin UI) → Next.js API Routes → Opik REST API + Supabase PostgreSQL
- All Opik communication handled server-side (secrets protected)
- No frontend Opik SDK usage; REST API only

**Deliverables**:
1. Opik REST API service (`lib/services/opik-spans.ts`)
2. Three admin API routes (`/api/admin/*`)
3. Updated admin layout header with navigation and CTA
4. Admin welcome page (`/admin`)
5. Unrecognized items review page (`/admin/unrecognized`)

---

## Environment Setup

### Prerequisites

```bash
# From repository root
make dev-all                  # Starts Next.js + Opik + Supabase
# Monitor logs: Opik → http://localhost:5173, Next.js → http://localhost:3000
```

### Required Environment Variables

Check `.env.local`:

```env
GOOGLE_GENERATIVE_AI_API_KEY=sk-proj-...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
OPIK_URL_OVERRIDE=http://localhost:5173/api
OPIK_PROJECT_NAME=homecuistot-hackathon
OPIK_API_KEY=                              # Local: empty. Production: set from secrets
OPIK_WORKSPACE=                            # Local: empty. Production: philippe-diep

ADMIN_USER_IDS=user-id-1,user-id-2        # Comma-separated admin UUIDs
```

**To get your admin user ID during development**:
1. Log in to the app
2. Open browser DevTools → Application → Local Storage
3. Find key `supabase.auth.token`, copy the JWT
4. Decode at jwt.io, extract `sub` field (your user UUID)
5. Add to `ADMIN_USER_IDS` in `.env.local`

### Verify Opik Connection

```bash
curl http://localhost:5173/api/v1/private/projects
# Should return: {"data": [{"name": "homecuistot-hackathon", ...}]}
```

---

## Phase 1: Opik Service Foundation

**Deliverable**: `apps/nextjs/src/lib/services/opik-spans.ts`
**Time**: 20 minutes
**Dependencies**: None (foundation for all other phases)

### Step 1a: Create Opik Service

**Location**: `apps/nextjs/src/lib/services/opik-spans.ts`

Create the service module that wraps Opik REST API calls:

```typescript
import { logger } from '@/lib/logger'

const OPIK_URL = process.env.OPIK_URL_OVERRIDE || 'http://localhost:5173/api'
const OPIK_PROJECT_NAME = process.env.OPIK_PROJECT_NAME || 'homecuistot-hackathon'
const OPIK_API_KEY = process.env.OPIK_API_KEY
const OPIK_WORKSPACE = process.env.OPIK_WORKSPACE

interface OpikSpan {
  id: string
  trace_id: string
  name: string
  tags: string[]
  metadata?: {
    totalUnrecognized?: number
    unrecognized?: string[]
  }
  created_at?: string
}

interface SearchSpansResponse {
  data: OpikSpan[]
}

interface UpdateSpanRequest {
  trace_id: string
  tags: string[]
}

function getOpikHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Production (Opik Cloud): API key + workspace header
  // NOTE: authorization value has NO "Bearer " prefix
  if (OPIK_API_KEY) {
    headers['authorization'] = OPIK_API_KEY
  }
  if (OPIK_WORKSPACE) {
    headers['Comet-Workspace'] = OPIK_WORKSPACE
  }

  return headers
}

/**
 * Search for spans with `unrecognized_items` tag but NOT `promotion_reviewed`
 * Returns the most recent unprocessed span or null if none found
 */
export async function getNextUnprocessedSpan(): Promise<OpikSpan | null> {
  try {
    const url = new URL(`${OPIK_URL}/v1/private/spans/search`)

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: getOpikHeaders(),
      body: JSON.stringify({
        project_name: OPIK_PROJECT_NAME,
        filters: [
          { field: 'tags', operator: 'contains', value: 'unrecognized_items' },
          { field: 'tags', operator: 'not_contains', value: 'promotion_reviewed' },
        ],
        limit: 1,
        sort_by: [{ field: 'created_at', direction: 'desc' }], // Most recent first
      }),
    })

    if (!response.ok) {
      logger.error('Opik search spans failed', {
        status: response.status,
        statusText: response.statusText,
      })
      return null
    }

    const data: SearchSpansResponse = await response.json()
    return data.data?.[0] ?? null
  } catch (error) {
    logger.error('Opik search spans error', { error })
    return null
  }
}

/**
 * Get a span by ID from Opik
 * Used to re-fetch current state (tags, trace_id) before PATCH
 */
export async function getSpanById(params: {
  spanId: string
}): Promise<OpikSpan | null> {
  try {
    const url = new URL(`${OPIK_URL}/v1/private/spans/${params.spanId}`)
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getOpikHeaders(),
    })

    if (!response.ok) {
      logger.error('Opik get span failed', {
        spanId: params.spanId,
        status: response.status,
      })
      return null
    }

    return await response.json()
  } catch (error) {
    logger.error('Opik get span error', { error })
    return null
  }
}

/**
 * Mark a span as reviewed by adding promotion_reviewed tag
 *
 * IMPORTANT: Always re-fetches the span first (GET by ID) to get
 * current tags, then appends promotion_reviewed. Never use stale
 * tags from the initial search.
 */
export async function markSpanAsReviewed(params: {
  spanId: string
}): Promise<boolean> {
  try {
    // Step 1: Re-fetch span to get current state
    const span = await getSpanById({ spanId: params.spanId })
    if (!span) return false

    // Step 2: Append promotion_reviewed to current tags
    const currentTags = span.tags || []
    if (currentTags.includes('promotion_reviewed')) return true // already tagged
    const newTags = [...currentTags, 'promotion_reviewed']

    // Step 3: PATCH with merged tags
    const url = new URL(`${OPIK_URL}/v1/private/spans/${params.spanId}`)
    const response = await fetch(url.toString(), {
      method: 'PATCH',
      headers: getOpikHeaders(),
      body: JSON.stringify({
        trace_id: span.trace_id,
        tags: newTags,
      }),
    })

    if (!response.ok) {
      logger.error('Opik update span failed', {
        spanId: params.spanId,
        status: response.status,
        statusText: response.statusText,
      })
      return false
    }

    return true
  } catch (error) {
    logger.error('Opik mark span reviewed error', { error })
    return false
  }
}
```

### Step 1b: Test Opik Service

Create a quick test script to verify Opik connectivity:

```bash
# From apps/nextjs/
pnpm tsx scripts/test-opik.ts
```

**Script**: `apps/nextjs/scripts/test-opik.ts`

```typescript
import { getNextUnprocessedSpan } from '../src/lib/services/opik-spans'

async function main() {
  console.log('Testing Opik connection...')
  const span = await getNextUnprocessedSpan()

  if (span) {
    console.log('✓ Found span:', {
      id: span.id,
      tags: span.tags,
      unrecognized: span.metadata?.unrecognized?.length ?? 0,
    })
  } else {
    console.log('✓ Connected to Opik, no unprocessed spans found')
  }
}

main().catch(console.error)
```

**Validation Checkpoint**:
- Service imports without errors
- `getNextUnprocessedSpan()` returns either a span or null
- No TypeScript errors

---

## Phase 2: Admin API Routes

**Deliverable**: 3 API routes in `apps/nextjs/src/app/api/admin/`
**Time**: 30 minutes
**Dependencies**: Phase 1 (Opik service)

### Step 2a: Create `/api/admin/spans/next` Route

**Location**: `apps/nextjs/src/app/api/admin/spans/next/route.ts`

Fetches next unprocessed span and returns deduplicated, DB-filtered ingredient list:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { adminDb } from '@/db/client'
import { ingredients } from '@/db/schema'
import { getNextUnprocessedSpan, markSpanAsReviewed } from '@/lib/services/opik-spans'
import { sql } from 'drizzle-orm'
import { logger } from '@/lib/logger'

interface SpanResponse {
  spanId: string
  traceId: string
  items: string[]
  totalInSpan: number
}

export async function GET(request: NextRequest) {
  // Authentication check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminIds = process.env.ADMIN_USER_IDS?.split(',').map(id => id.trim()) || []
  if (!adminIds.includes(user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const span = await getNextUnprocessedSpan()

    if (!span) {
      return NextResponse.json({
        spanId: null,
        traceId: null,
        items: [],
        totalInSpan: 0,
      })
    }

    // Extract unrecognized items from metadata
    const rawItems = span.metadata?.unrecognized ?? []

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      logger.warn('Span has malformed metadata', { spanId: span.id })
      return NextResponse.json({
        spanId: null,
        traceId: null,
        items: [],
        totalInSpan: 0,
      })
    }

    // Deduplicate items (case-insensitive)
    const deduplicatedItems = Array.from(
      new Set(rawItems.map(item => item.toLowerCase()))
    )

    // Filter out items already in database (case-insensitive lookup)
    const existingNames = await adminDb
      .select({ name: ingredients.name })
      .from(ingredients)
      .where(
        sql`LOWER(${ingredients.name}) IN (${sql.join(
          deduplicatedItems.map(name => sql`${name}`),
          sql`, `
        )})`
      )

    const existingSet = new Set(existingNames.map(row => row.name.toLowerCase()))
    const newItems = deduplicatedItems.filter(item => !existingSet.has(item))

    // If all items already exist, skip this span
    if (newItems.length === 0) {
      logger.info('All items in span already in database, marking as reviewed', {
        spanId: span.id
      })

      // Auto-tag as reviewed since there's nothing to do
      await markSpanAsReviewed({ spanId: span.id })

      return NextResponse.json({
        spanId: null,
        traceId: null,
        items: [],
        totalInSpan: span.metadata?.totalUnrecognized ?? 0,
      })
    }

    const response: SpanResponse = {
      spanId: span.id,
      traceId: span.trace_id,
      items: newItems,
      totalInSpan: span.metadata?.totalUnrecognized ?? rawItems.length,
    }

    return NextResponse.json(response)
  } catch (error) {
    logger.error('Error fetching next span', { error })
    return NextResponse.json(
      { error: 'Failed to fetch span' },
      { status: 500 }
    )
  }
}
```

### Step 2b: Create `/api/admin/ingredients/promote` Route

**Location**: `apps/nextjs/src/app/api/admin/ingredients/promote/route.ts`

Promotes selected ingredients and tags span as reviewed:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { adminDb } from '@/db/client'
import { ingredients } from '@/db/schema'
import { markSpanAsReviewed } from '@/lib/services/opik-spans'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const PromoteRequestSchema = z.object({
  spanId: z.string().uuid(),
  promotions: z.array(
    z.object({
      name: z.string().min(1),
      category: z.string().min(1),
    })
  ).min(1),
})

const VALID_CATEGORIES = [
  'meat', 'cereal', 'fish', 'molluscs', 'crustaceans', 'bee_ingredients', 'synthesized',
  'poultry', 'eggs', 'dairy', 'fruit', 'vegetables', 'beans', 'nuts', 'seed', 'plants',
  'mushroom', 'cheeses', 'oils_and_fats', 'non_classified', 'e100_e199', 'ferments',
  'salt', 'starch', 'alcohol', 'aroma', 'cocoa', 'water', 'parts', 'compound_ingredients',
]

export async function POST(request: NextRequest) {
  // Authentication check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminIds = process.env.ADMIN_USER_IDS?.split(',').map(id => id.trim()) || []
  if (!adminIds.includes(user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const validated = PromoteRequestSchema.parse(body)

    // Validate categories
    for (const promotion of validated.promotions) {
      if (!VALID_CATEGORIES.includes(promotion.category)) {
        return NextResponse.json(
          { error: `Invalid category: ${promotion.category}` },
          { status: 400 }
        )
      }
    }

    // Insert ingredients, handle duplicates gracefully
    let promotedCount = 0
    let skippedCount = 0

    for (const promotion of validated.promotions) {
      try {
        await adminDb
          .insert(ingredients)
          .values({
            name: promotion.name.trim().toLowerCase(),
            category: promotion.category,
          })
          .onConflictDoNothing()

        promotedCount++
      } catch (error) {
        logger.warn('Failed to insert ingredient', {
          name: promotion.name,
          error
        })
        skippedCount++
      }
    }

    // Mark span as reviewed (GET-then-PATCH pattern)
    const spanTagged = await markSpanAsReviewed({ spanId: validated.spanId })

    if (!spanTagged) {
      logger.error('Failed to tag span after promotion', {
        spanId: validated.spanId
      })
    }

    return NextResponse.json({
      promoted: promotedCount,
      skipped: skippedCount,
      spanTagged,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }

    logger.error('Error promoting ingredients', { error })
    return NextResponse.json(
      { error: 'Failed to promote ingredients' },
      { status: 500 }
    )
  }
}
```

### Step 2c: Create `/api/admin/spans/mark-reviewed` Route

**Location**: `apps/nextjs/src/app/api/admin/spans/mark-reviewed/route.ts`

Tags span as reviewed without promoting any ingredients (dismiss-all case):

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { markSpanAsReviewed } from '@/lib/services/opik-spans'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const MarkReviewedSchema = z.object({
  spanId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  // Authentication check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminIds = process.env.ADMIN_USER_IDS?.split(',').map(id => id.trim()) || []
  if (!adminIds.includes(user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const validated = MarkReviewedSchema.parse(body)

    const spanTagged = await markSpanAsReviewed({ spanId: validated.spanId })

    return NextResponse.json({
      spanTagged,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }

    logger.error('Error marking span as reviewed', { error })
    return NextResponse.json(
      { error: 'Failed to mark span as reviewed' },
      { status: 500 }
    )
  }
}
```

**Validation Checkpoint**:
- All 3 routes create without TypeScript errors
- Routes authenticate user and check admin permissions
- Zod schemas validate input
- Test with Postman or curl (see Testing section below)

---

## Phase 3: Admin Layout Header Update

**Deliverable**: Updated `apps/nextjs/src/app/(admin)/admin/layout.tsx`
**Time**: 10 minutes
**Dependencies**: Phases 1-2 (API routes exist)

### Step 3a: Update Layout with Navigation

Modify the admin layout to add "Unrecognized Items" nav link and "Go To App" CTA:

```typescript
import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/app/LogoutButton'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header role="banner" className="border-b-4 border-black bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Top row: title and logout */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-black uppercase">🛡️ Admin Dashboard</h1>
            <LogoutButton />
          </div>

          {/* Navigation bar */}
          <nav className="flex gap-4 items-center border-t-4 border-black pt-3">
            <AdminNavLink href="/admin/unrecognized" label="Unrecognized Items" />
            <div className="flex-1" />
            <Link
              href="/app"
              className="bg-cyan-300 hover:bg-cyan-400 border-3 border-black px-6 py-2 font-black uppercase text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
              → Go To App
            </Link>
          </nav>
        </div>
      </header>

      <main role="main" className="flex-1">
        {children}
      </main>
    </div>
  )
}

function AdminNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`px-4 py-2 border-2 border-black font-bold uppercase transition ${
        isActive
          ? 'bg-yellow-300 border-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
          : 'bg-white hover:bg-gray-100'
      }`}
    >
      {label}
    </Link>
  )
}
```

**Validation Checkpoint**:
- Layout renders without errors
- Navigation links appear in header
- Active state styling works
- "Go To App" CTA links to `/app`

---

## Phase 4: Admin Welcome Page

**Deliverable**: Updated `apps/nextjs/src/app/(admin)/admin/page.tsx`
**Time**: 15 minutes
**Dependencies**: Phase 3 (layout exists)

### Step 4a: Create Welcome Page

Replace the placeholder page with a proper welcome page listing features:

```typescript
import { PageContainer } from '@/components/PageContainer'
import Link from 'next/link'

export default function AdminDashboardPage() {
  return (
    <PageContainer
      maxWidth="2xl"
      gradientFrom="from-pink-100"
      gradientVia="via-purple-100"
      gradientTo="to-blue-100"
    >
      <div className="space-y-6 md:space-y-8">
        {/* Hero section */}
        <div className="border-4 md:border-6 border-black bg-gradient-to-br from-yellow-200 to-yellow-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black uppercase mb-3">
            Welcome to Admin
          </h1>
          <p className="text-lg md:text-xl font-bold">
            Manage your HomeCuistot ingredient catalog and system settings
          </p>
        </div>

        {/* Features grid */}
        <div className="grid gap-6 md:gap-8">
          {/* Unrecognized Items feature */}
          <Link href="/admin/unrecognized">
            <div className="border-4 md:border-6 border-black bg-gradient-to-br from-green-200 to-green-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🧪</div>
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-black uppercase mb-2">
                    Review Unrecognized Items
                  </h2>
                  <p className="text-base md:text-lg font-bold mb-4">
                    Review ingredients detected during recipe operations and promote them to the database with proper categories. Build a richer ingredient catalog.
                  </p>
                  <div className="inline-block bg-cyan-300 border-3 border-black px-4 py-2 font-black uppercase text-sm">
                    → Open Feature
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Coming soon section */}
          <div className="border-4 md:border-6 border-black bg-gradient-to-br from-blue-200 to-blue-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-black uppercase mb-4">
              Coming Soon
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 font-bold">
                <span className="text-xl">📊</span>
                <span>System Analytics — Monitor user activity and engagement metrics</span>
              </li>
              <li className="flex items-start gap-3 font-bold">
                <span className="text-xl">⚙️</span>
                <span>Configuration Management — Adjust system settings and feature flags</span>
              </li>
              <li className="flex items-start gap-3 font-bold">
                <span className="text-xl">👥</span>
                <span>User Management — View and manage user accounts and permissions</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
```

**Validation Checkpoint**:
- Welcome page renders with neobrutalist styling
- Unrecognized Items card is clickable and links to `/admin/unrecognized`
- Admin can navigate back from feature page to welcome page using browser back button

---

## Phase 5: Unrecognized Items Review Page

**Deliverable**: `apps/nextjs/src/app/(admin)/admin/unrecognized/page.tsx`
**Time**: 45 minutes
**Dependencies**: Phases 1-4 (all API routes and layout exist)

### Step 5a: Create Page Component

Create the full-featured review page with form state management:

```typescript
'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/PageContainer'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { Text } from '@/components/shared/Text'
import { Alert } from '@/components/shared/Alert'
import { toast } from 'sonner'

interface LoadedSpan {
  spanId: string
  traceId: string
  existingTags: string[]
  unrecognizedItems: string[]
}

interface ItemPromotion {
  name: string
  category: string
}

const INGREDIENT_CATEGORIES = [
  'non_classified',
  'meat',
  'poultry',
  'fish',
  'molluscs',
  'crustaceans',
  'eggs',
  'dairy',
  'cheeses',
  'fruit',
  'vegetables',
  'beans',
  'nuts',
  'seed',
  'plants',
  'mushroom',
  'cereal',
  'starch',
  'oils_and_fats',
  'salt',
  'alcohol',
  'aroma',
  'cocoa',
  'water',
  'bee_ingredients',
  'e100_e199',
  'ferments',
  'synthesized',
  'parts',
  'compound_ingredients',
]

export default function UnrecognizedItemsPage() {
  const [loadedSpan, setLoadedSpan] = useState<LoadedSpan | null>(null)
  const [promotions, setPromotions] = useState<Record<string, ItemPromotion>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load first/next span
  const handleLoadSpan = async () => {
    setIsLoading(true)
    setError(null)
    setLoadedSpan(null)
    setPromotions({})

    try {
      const response = await fetch('/api/admin/spans/next')
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to load span')
        toast.error('Failed to load span')
        return
      }

      if (!data.spanId) {
        setError(data.message || 'No unprocessed spans found')
        toast.info(data.message || 'No more spans to review')
        return
      }

      setLoadedSpan(data)

      // Initialize promotions with default category
      const initialPromotions: Record<string, ItemPromotion> = {}
      data.unrecognizedItems.forEach((item: string) => {
        initialPromotions[item] = { name: item, category: 'non_classified' }
      })
      setPromotions(initialPromotions)

      toast.success(`Loaded ${data.unrecognizedItems.length} items`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  // Promote selected items
  const handlePromote = async () => {
    if (!loadedSpan) return

    const selectedItems = Object.values(promotions).filter(
      item => item.category !== null && item.category !== undefined
    )

    if (selectedItems.length === 0) {
      toast.warning('Select at least one item to promote')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/ingredients/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spanId: loadedSpan.spanId,
          traceId: loadedSpan.traceId,
          existingTags: loadedSpan.existingTags,
          promotions: selectedItems,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to promote ingredients')
        toast.error(data.error || 'Failed to promote ingredients')
        return
      }

      toast.success(`Promoted ${data.promotedCount} ingredient(s)`)

      if (data.skippedCount > 0) {
        toast.info(`${data.skippedCount} item(s) were duplicates`)
      }

      // Reset for next span
      setLoadedSpan(null)
      setPromotions({})
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      toast.error(message)
    } finally {
      setIsProcessing(false)
    }
  }

  // Dismiss all items
  const handleDismissAll = async () => {
    if (!loadedSpan) return

    if (!confirm('Dismiss all items without promoting? This cannot be undone.')) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/spans/mark-reviewed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spanId: loadedSpan.spanId,
          traceId: loadedSpan.traceId,
          existingTags: loadedSpan.existingTags,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to dismiss span')
        toast.error(data.error || 'Failed to dismiss span')
        return
      }

      toast.success('Span dismissed')

      // Reset for next span
      setLoadedSpan(null)
      setPromotions({})
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      toast.error(message)
    } finally {
      setIsProcessing(false)
    }
  }

  // Remove item from review
  const handleRemoveItem = (itemName: string) => {
    const updated = { ...promotions }
    delete updated[itemName]
    setPromotions(updated)
  }

  // Update category for item
  const handleCategoryChange = (itemName: string, category: string) => {
    setPromotions(prev => ({
      ...prev,
      [itemName]: { name: itemName, category },
    }))
  }

  return (
    <PageContainer
      maxWidth="2xl"
      gradientFrom="from-yellow-100"
      gradientVia="via-green-100"
      gradientTo="to-cyan-100"
    >
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="border-4 md:border-6 border-black bg-gradient-to-br from-lime-300 to-green-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black uppercase mb-2">
            Review Unrecognized Items
          </h1>
          <p className="text-base md:text-lg font-bold">
            Promote detected ingredients to the database or dismiss them
          </p>
        </div>

        {/* Error message */}
        {error && (
          <Alert variant="error">
            <strong>Error:</strong> {error}
          </Alert>
        )}

        {/* Load CTA or review form */}
        {!loadedSpan ? (
          <div className="border-4 md:border-6 border-black bg-gradient-to-br from-blue-200 to-blue-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10">
            <div className="text-center space-y-4">
              <Text size="lg" weight="bold">
                Click below to load the next unrecognized ingredient span
              </Text>
              <Button
                onClick={handleLoadSpan}
                disabled={isLoading}
                className="bg-cyan-300 hover:bg-cyan-400 border-4 border-black px-8 py-4 font-black uppercase text-lg"
              >
                {isLoading ? 'Loading...' : '↓ Load Next Span'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Review form */}
            <div className="border-4 md:border-6 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-black uppercase mb-4">
                {loadedSpan.unrecognizedItems.length} Item(s) to Review
              </h2>

              <div className="space-y-4 mb-6">
                {loadedSpan.unrecognizedItems.map(item => (
                  <ItemReviewRow
                    key={item}
                    itemName={item}
                    promotion={promotions[item]}
                    categories={INGREDIENT_CATEGORIES}
                    onCategoryChange={(cat) => handleCategoryChange(item, cat)}
                    onRemove={() => handleRemoveItem(item)}
                  />
                ))}
              </div>

              {Object.keys(promotions).length === 0 ? (
                <div className="text-center py-4 bg-yellow-100 border-2 border-black p-4">
                  <p className="font-bold">All items dismissed</p>
                </div>
              ) : null}
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 flex-wrap">
              <Button
                onClick={handlePromote}
                disabled={
                  isProcessing ||
                  Object.keys(promotions).length === 0
                }
                className="flex-1 bg-green-300 hover:bg-green-400 border-4 border-black px-6 py-4 font-black uppercase"
              >
                {isProcessing ? 'Processing...' : `✓ Promote (${Object.keys(promotions).length})`}
              </Button>

              <Button
                onClick={handleDismissAll}
                disabled={isProcessing}
                variant="secondary"
                className="flex-1 bg-red-300 hover:bg-red-400 border-4 border-black px-6 py-4 font-black uppercase"
              >
                {isProcessing ? 'Processing...' : '✗ Dismiss All'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  )
}

interface ItemReviewRowProps {
  itemName: string
  promotion: ItemPromotion | undefined
  categories: string[]
  onCategoryChange: (category: string) => void
  onRemove: () => void
}

function ItemReviewRow({
  itemName,
  promotion,
  categories,
  onCategoryChange,
  onRemove,
}: ItemReviewRowProps) {
  return (
    <div className="border-3 border-black p-4 bg-gray-50 flex gap-3 items-end">
      <div className="flex-1 space-y-2">
        <label className="block text-sm font-bold uppercase">Item</label>
        <div className="font-bold bg-white border-2 border-black p-2">
          {itemName}
        </div>
      </div>

      <div className="flex-1 space-y-2">
        <label className="block text-sm font-bold uppercase">Category</label>
        <select
          value={promotion?.category || 'non_classified'}
          onChange={e => onCategoryChange(e.target.value)}
          className="w-full border-2 border-black p-2 font-bold bg-white"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={onRemove}
        className="border-2 border-black bg-red-200 hover:bg-red-300 px-4 py-2 font-bold uppercase"
      >
        ✗
      </button>
    </div>
  )
}
```

**Validation Checkpoint**:
- Page loads without errors
- Button to load span appears initially
- Can click to load a span (requires test data in Opik)
- Category dropdown works
- Promote and Dismiss buttons trigger API calls
- Toast notifications display success/error messages

---

## Testing Guide

### Manual Testing Checklist

#### Test Data Setup

1. **Generate unrecognized items in Opik**:
   ```bash
   # Create a recipe with an ingredient not in the database
   # This triggers the LLM to detect it as unrecognized
   # Opik automatically captures it with `unrecognized_items` tag
   ```

2. **Verify Opik has spans**:
   ```bash
   curl -X POST http://localhost:5173/api/v1/private/spans/search \
     -H 'Content-Type: application/json' \
     -d '{
       "project_name": "homecuistot-hackathon",
       "filters": [
         { "field": "tags", "operator": "contains", "value": "unrecognized_items" }
       ],
       "limit": 5
     }' | jq
   ```

#### Phase-by-Phase Tests

**Phase 1: Opik Service**
- [ ] `pnpm tsx scripts/test-opik.ts` returns span or "no spans" message
- [ ] No errors in console

**Phase 2: API Routes**
```bash
# Test fetch next span
curl -X GET http://localhost:3000/api/admin/spans/next \
  -H 'Cookie: <your-auth-cookie>'

# Expected: { spanId, traceId, existingTags, unrecognizedItems[] }

# Test promote ingredients
curl -X POST http://localhost:3000/api/admin/ingredients/promote \
  -H 'Content-Type: application/json' \
  -H 'Cookie: <your-auth-cookie>' \
  -d '{
    "spanId": "...",
    "traceId": "...",
    "existingTags": [...],
    "promotions": [
      { "name": "free-range chicken", "category": "poultry" }
    ]
  }'

# Expected: { status: "success", promotedCount: 1, spanUpdated: true }
```

**Phase 3-5: UI Tests**
- [ ] Navigate to `/admin` → see welcome page with feature card
- [ ] Click "Unrecognized Items" in header → navigate to `/admin/unrecognized`
- [ ] Click "Load Next Span" → span data loads and displays items
- [ ] Select categories for items
- [ ] Click "Promote" → items inserted, toast shows success
- [ ] Verify promoted ingredients appear in Drizzle Studio:
  ```bash
  pnpm db:studio
  # Navigate to ingredients table, verify new items with correct category
  ```
- [ ] Load next span → verify previous span is not shown again
- [ ] Click "Dismiss All" → span marked reviewed without promotions

### API Route Testing with Postman

**Environment Variables**:
- `baseUrl`: `http://localhost:3000`
- `adminCookie`: Copy from browser DevTools → Application → Cookies → `next-auth.session-token`

**Collection**:

| Endpoint | Method | Headers | Body | Notes |
|----------|--------|---------|------|-------|
| `{{baseUrl}}/api/admin/spans/next` | GET | Cookie header | — | Returns next unprocessed span |
| `{{baseUrl}}/api/admin/ingredients/promote` | POST | Cookie, Content-Type | Promotion payload | Insert ingredients + tag span |
| `{{baseUrl}}/api/admin/spans/mark-reviewed` | POST | Cookie, Content-Type | {spanId, traceId, existingTags} | Tag span without inserting |

---

## Database Verification

After promoting ingredients, verify in Drizzle Studio:

```bash
# From apps/nextjs/
pnpm db:studio
```

Navigate to `ingredients` table:
- Filter by `category = 'poultry'` (or whatever you promoted)
- Verify promoted names appear in lowercase
- Confirm `createdAt` timestamp is recent

---

## Troubleshooting

### "No unprocessed spans found"
- **Cause**: No spans with `unrecognized_items` tag yet
- **Solution**: Create recipes with unrecognized ingredients to generate spans

### API 401 Unauthorized
- **Cause**: Not authenticated or not an admin
- **Solution**: Log in with a verified admin user ID in `ADMIN_USER_IDS` env var

### Opik API 500 error
- **Cause**: Opik service down or misconfigured URL
- **Solution**:
  - Check `OPIK_URL_OVERRIDE` in `.env.local`
  - Verify Opik running: `docker ps | grep opik`
  - Check Opik logs: `docker logs <opik-container>`

### Ingredient inserts silently skipped
- **Cause**: Duplicate ingredient name (already in DB)
- **Solution**: Check database for existing ingredients with `LOWER(name) = ?`

### Categories not recognized
- **Cause**: Invalid category submitted
- **Solution**: Verify against 30-item enum in `opik-spans.ts`

---

## Commit Strategy

After each phase, commit with descriptive message:

```bash
# Phase 1
git add apps/nextjs/src/lib/services/opik-spans.ts
git commit -m "feat(admin): add Opik REST API service for span operations"

# Phase 2
git add apps/nextjs/src/app/api/admin/
git commit -m "feat(admin): add API routes for ingredient promotion workflow"

# Phase 3
git add apps/nextjs/src/app/\(admin\)/admin/layout.tsx
git commit -m "feat(admin): add header navigation and Go To App CTA"

# Phase 4
git add apps/nextjs/src/app/\(admin\)/admin/page.tsx
git commit -m "feat(admin): replace placeholder with welcome page"

# Phase 5
git add apps/nextjs/src/app/\(admin\)/admin/unrecognized/
git commit -m "feat(admin): implement unrecognized items review page"
```

---

## Next Steps After Implementation

1. **Monitoring**: Set up logs to track promotion success rates
2. **Analytics**: Measure how many unique ingredients added per admin session
3. **Refinement**: Gather admin feedback on UX (category selection, dismiss flow)
4. **Batch Processing**: Future phase could process multiple items concurrently
5. **Audit Trail**: Store promotion history for accountability

---

## Key Files Summary

| File | Purpose | Status |
|------|---------|--------|
| `src/lib/services/opik-spans.ts` | Opik REST API wrapper | Create in Phase 1 |
| `src/app/api/admin/spans/next/route.ts` | Fetch next unprocessed span | Create in Phase 2 |
| `src/app/api/admin/ingredients/promote/route.ts` | Promote ingredients | Create in Phase 2 |
| `src/app/api/admin/spans/mark-reviewed/route.ts` | Mark span as reviewed | Create in Phase 2 |
| `src/app/(admin)/admin/layout.tsx` | Admin layout with nav | Modify in Phase 3 |
| `src/app/(admin)/admin/page.tsx` | Welcome page | Modify in Phase 4 |
| `src/app/(admin)/admin/unrecognized/page.tsx` | Review page | Create in Phase 5 |

All paths relative to `apps/nextjs/`.
