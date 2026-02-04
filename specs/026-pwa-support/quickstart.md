# Quickstart: PWA Support

**Feature**: 026-pwa-support
**Time**: ~15 minutes

## Prerequisites

✅ **Icons ready** in `apps/nextjs/public/icons/`:
- `icon-192x192.png`, `icon-512x512.png` (+ additional sizes)
- `apple-touch-icon.png` (180x180)
- `favicon.ico`

## Implementation Steps

### Step 1: Create Web App Manifest

Create `apps/nextjs/src/app/manifest.ts`:

```typescript
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HomeCuistot',
    short_name: 'HomeCuistot',
    description: 'AI-powered voice assistant for home cooks',
    start_url: '/',
    display: 'standalone',
    background_color: '#fb923c', // orange-400 (splash background)
    theme_color: '#fb923c',      // status bar color
    icons: [
      { src: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
      { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-256x256.png', sizes: '256x256', type: 'image/png' },
      { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
```

### Step 2: Update Layout Metadata

Edit `apps/nextjs/src/app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: "HomeCuistot",
  description: "AI-powered voice assistant for home cooks. Know what you have, know what you can cook, eat better without thinking about it.",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HomeCuistot',
  },
  icons: {
    icon: '/icons/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
};
```

## Verification

### Local Testing

```bash
cd apps/nextjs
pnpm dev
```

1. Open http://localhost:3000 in Chrome
2. Open DevTools → Application → Manifest
3. Verify manifest loads without errors
4. Check icons display correctly

### Lighthouse Audit

1. Open Chrome DevTools → Lighthouse
2. Run PWA audit
3. Verify "Installable" checkmarks pass

### Mobile Testing

**Android Chrome**:
1. Visit app URL on phone
2. Tap menu → "Add to Home screen"
3. Verify icon appears on home screen
4. Launch from icon → should open fullscreen (no browser UI)

**iOS Safari**:
1. Visit app URL on iPhone/iPad
2. Tap share → "Add to Home Screen"
3. Verify icon appears on home screen
4. Launch from icon → should open fullscreen (no Safari UI)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Manifest not loading | Check `/manifest.webmanifest` returns JSON |
| Icons not showing | Verify file paths match manifest, check console errors |
| Not installable | Lighthouse shows specific failures, usually icons or HTTPS |
| iOS not fullscreen | Verify `apple-mobile-web-app-capable` meta tag present |
