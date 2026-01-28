# Component Contracts: Demo Data Reset

**Feature**: 017-demo-data-reset | **Date**: 2026-01-28

## ConfirmationModal

**Location**: `apps/nextjs/src/components/app/confirmation-modal.tsx`

### Props

```typescript
interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  confirmButtonClass: string
  isLoading: boolean
  onConfirm: () => void
  onCancel: () => void
}
```

### Behavior

- Renders overlay with centered modal when `isOpen` is true
- Prevents body scroll when open
- Clicking overlay calls `onCancel` (unless loading)
- Cancel button calls `onCancel`
- Confirm button calls `onConfirm`
- Both buttons disabled when `isLoading`
- Confirm button shows loading state text

### Styling

Neo-brutalist per constitution:
- Overlay: `fixed inset-0 z-50 bg-black/50`
- Modal: `border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`
- Cancel: `border-4 border-black bg-gray-200 hover:bg-gray-300`
- Confirm: Uses `confirmButtonClass` prop for color

---

## StartDemoButton

**Location**: `apps/nextjs/src/components/app/start-demo-button.tsx`

### Props

None (self-contained client component)

### State

```typescript
const [isModalOpen, setIsModalOpen] = useState(false)
const [isLoading, setIsLoading] = useState(false)
```

### Behavior

1. Renders blue neo-brutalist button with "🚀 Start Demo" text
2. Click opens ConfirmationModal
3. On confirm: calls `startDemoData()` server action
4. On success: calls `router.refresh()` to show demo data
5. On failure: shows alert with error
6. Stays on /app page (no navigation)

### Styling

Blue neo-brutalist button:
```css
px-4 py-2 font-bold border-4 border-black
bg-blue-400 hover:bg-blue-500 text-white text-sm
cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
active:shadow-none transition-all
```

---

## ResetUserDataButton (Modified)

**Location**: `apps/nextjs/src/components/app/reset-user-data-button.tsx`

### Changes

- Extract inline modal to use shared `ConfirmationModal`
- Keep existing behavior (redirect to onboarding on success)
- Keep red styling

---

## Page Layout Change

**Location**: `apps/nextjs/src/app/(protected)/app/page.tsx`

### Before

```tsx
<section className="flex justify-center pt-8">
  <ResetUserDataButton />
</section>
```

### After

```tsx
<section className="flex justify-center gap-4 pt-8">
  <StartDemoButton />
  <ResetUserDataButton />
</section>
```

Buttons displayed side-by-side with gap.
