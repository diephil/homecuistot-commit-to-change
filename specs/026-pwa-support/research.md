# Research: PWA Support

**Feature**: 026-pwa-support
**Date**: 2026-02-05

## Research Topics

### 1. Next.js 16 PWA Manifest Implementation

**Decision**: Use `manifest.ts` route handler in App Router

**Rationale**:
- Next.js 13+ App Router supports `manifest.ts|js` file in `/app` directory
- Generates `/manifest.webmanifest` automatically
- Type-safe with `MetadataRoute.Manifest` type
- No additional dependencies needed

**Alternatives Considered**:
- `next-pwa` package: Overkill for no-offline PWA, adds service worker complexity
- Static `manifest.json` in `/public`: Works but less type-safe, harder to maintain
- Manual `<link rel="manifest">`: Requires additional config, Next.js handles this automatically

### 2. Standalone Display Mode

**Decision**: Use `display: 'standalone'` in manifest

**Rationale**:
- Removes browser UI (address bar, navigation) - exactly what user requested
- Widely supported on iOS Safari and Android Chrome
- Alternative `fullscreen` mode hides status bar too, which is too aggressive

**Alternatives Considered**:
- `fullscreen`: Hides even status bar, causes UX issues with notch/safe areas
- `minimal-ui`: Still shows some browser controls, doesn't meet requirement
- `browser`: Default, doesn't change anything

### 3. Splashscreen Configuration

**Decision**: Use `background_color` + `theme_color` + 512x512 icon

**Rationale**:
- Android Chrome auto-generates splash from manifest values
- iOS uses `apple-touch-startup-image` meta tags (not manifest) but can be skipped for MVP
- Simple: just needs background color matching app brand + large icon

**Alternatives Considered**:
- Custom splash images for each device size: Too much work for MVP, iOS-only feature
- CSS-based splash: Requires service worker to intercept, explicitly out of scope

### 4. Icon Requirements

**Decision**: Three icon files minimum

**Rationale**:
| File | Size | Purpose |
|------|------|---------|
| `icon-192x192.png` | 192x192 | Android home screen, manifest required |
| `icon-512x512.png` | 512x512 | Android splash, Lighthouse audit requirement |
| `apple-touch-icon.png` | 180x180 | iOS home screen (linked via metadata) |

**Alternatives Considered**:
- Single maskable icon: Modern approach but more complex, needs safe zone design
- SVG icon: Not universally supported in manifests yet

### 5. iOS-Specific Metadata

**Decision**: Add `apple-mobile-web-app-capable` meta tag via Next.js Metadata

**Rationale**:
- iOS Safari requires explicit meta tag for standalone mode
- `apple-mobile-web-app-status-bar-style` controls status bar appearance
- Next.js Metadata API supports these via `appleWebApp` config

**Alternatives Considered**:
- Manual `<meta>` tags in head: Works but Metadata API is cleaner
- Ignore iOS: Incomplete feature delivery

## Implementation Approach

```typescript
// apps/nextjs/src/app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HomeCuistot',
    short_name: 'HomeCuistot',
    description: 'AI-powered voice assistant for home cooks',
    start_url: '/',
    display: 'standalone',
    background_color: '#fbbf24', // yellow-400 (brand color)
    theme_color: '#fbbf24',
    icons: [
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
```

```typescript
// apps/nextjs/src/app/layout.tsx - metadata additions
export const metadata: Metadata = {
  // ... existing
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HomeCuistot',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
}
```

## Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| Service worker needed? | No - explicit requirement to exclude offline support |
| iOS splash images? | Deferred - complex device-specific setup, Android auto-generates from manifest |
| Maskable icons? | Deferred - would require redesigning icon with safe zone |
