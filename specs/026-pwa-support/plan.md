# Implementation Plan: PWA Support

**Branch**: `026-pwa-support` | **Date**: 2026-02-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/026-pwa-support/spec.md`

## Summary

Add PWA installability to Homecuistot enabling fullscreen standalone mode and splashscreen on launch. No service worker/offline support. Icons need transparent backgrounds and PWA-standard naming.

## Technical Context

**Language/Version**: TypeScript 5+ (strict mode)
**Primary Dependencies**: Next.js 16 App Router (built-in PWA metadata support via Metadata API)
**Storage**: N/A (config-only feature)
**Testing**: Manual testing on iOS Safari and Android Chrome
**Target Platform**: Mobile web (iOS Safari, Android Chrome), Desktop (Chrome, Edge)
**Project Type**: Web application (Next.js monorepo)
**Performance Goals**: N/A (static config)
**Constraints**: No service worker
**Scale/Scope**: Single app configuration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. MVP-First | ✅ PASS | Simple config feature, ships fast |
| II. Pragmatic Type Safety | ✅ N/A | No runtime code |
| III. Essential Validation | ✅ N/A | Browser validates manifest |
| IV. Test-Ready | ✅ N/A | Manual browser testing |
| V. Type Derivation | ✅ N/A | Uses Next.js Metadata types |
| VI. Named Parameters | ✅ N/A | No new functions |
| VII. Neobrutalism Design | ✅ PASS | Splashscreen uses app brand colors |

**Non-Negotiable Safeguards**: ✅ All pass (no data/auth/security changes)

## Project Structure

### Documentation (this feature)

```text
specs/026-pwa-support/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
apps/nextjs/
├── public/
│   └── icons/
│       ├── icon-192x192.png    # PWA icon (transparent bg)
│       ├── icon-512x512.png    # PWA icon (transparent bg)
│       └── apple-touch-icon.png # iOS home screen icon
└── src/
    └── app/
        ├── layout.tsx          # Add PWA metadata (existing file)
        └── manifest.ts         # Web app manifest (new file)
```

**Structure Decision**: Next.js App Router supports `manifest.ts` for dynamic manifest generation. Icons go in `/public/icons/` with standard PWA naming.

## Complexity Tracking

> No violations - simple config feature

## Icon Asset Status

**Status**: ✅ READY

**Icons** (in `apps/nextjs/public/icons/`):
| File | Size | Format | Purpose |
|------|------|--------|---------|
| `icon-72x72.png` | 72x72 | RGBA | Small Android |
| `icon-96x96.png` | 96x96 | RGBA | Android |
| `icon-128x128.png` | 128x128 | RGBA | Chrome Web Store |
| `icon-144x144.png` | 144x144 | RGBA | Android |
| `icon-152x152.png` | 152x152 | RGBA | iPad |
| `icon-192x192.png` | 192x192 | RGBA | Android home screen |
| `icon-256x256.png` | 256x256 | RGBA | Windows |
| `icon-384x384.png` | 384x384 | RGBA | Android splash |
| `icon-512x512.png` | 512x512 | RGBA | Android splash, Lighthouse |
| `apple-touch-icon.png` | 180x180 | RGBA | iOS home screen |
| `favicon.ico` | - | ICO | Browser tab |

**Design**: Coral/pink gradient background, rounded corners, yellow magnifying glass with fried egg icon
