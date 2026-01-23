# Quickstart Guide: Voice-Enabled Onboarding

**Feature**: 004-onboarding-flow
**Date**: 2026-01-23
**Estimated Setup Time**: 5-10 minutes

This guide walks you through setting up and testing the voice-enabled kitchen onboarding feature locally.

---

## Prerequisites

- **Node.js**: 18+ (check with `node --version`)
- **pnpm**: Installed globally (install with `npm install -g pnpm`)
- **Google AI API Key**: Required for Gemini integration
  - Get key from [Google AI Studio](https://aistudio.google.com/app/apikey)
  - Free tier includes 15 requests/minute, 1500 requests/day
- **Microphone**: For testing voice input (text fallback available)

---

## Installation

### 1. Clone and Install Dependencies

```bash
# Navigate to project root
cd /path/to/homecuistot-commit-to-change

# Install dependencies
cd apps/nextjs
pnpm install
```

### 2. Configure Environment Variables

Create or update `apps/nextjs/.env.local`:

```env
# Google Gemini API (required for voice processing)
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here

# Supabase (existing - should already be configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_key

# Opik telemetry (optional - for monitoring)
OPIK_URL_OVERRIDE=http://localhost:5173/api
```

**Important**: Never commit `.env.local` to git (already in `.gitignore`)

### 3. Start Development Server

```bash
# Option 1: Next.js only (no Opik/Supabase local services)
pnpm dev

# Option 2: Full stack with telemetry (from project root)
cd ../../
make dev-all
```

Server starts at: `http://localhost:3000`

---

## Testing the Feature

### Step 1: Navigate to Onboarding

1. Open browser to `http://localhost:3000`
2. Login with Google OAuth (or existing account)
3. Navigate to `/onboarding` route

**Expected**: Welcome screen with microphone permission notice

### Step 2: Test Badge Selection (Step 2)

1. Click "Get Started" button
2. Select dishes from suggested list (e.g., "Scrambled Eggs", "Pasta")
3. Select fridge ingredients (e.g., "Eggs", "Milk", "Tomatoes")
4. Select pantry items (e.g., "Rice", "Flour", "Salt")
5. Click "Continue" to advance to step 3

**Expected**: Smooth slide animation, selected badges visually distinct

### Step 3: Test Voice Input (Step 3)

**Prerequisites**: Microphone connected and browser permission granted

1. Hold down the large microphone button
2. Speak clearly: "Add eggs, remove tomatoes, I can also cook grilled cheese"
3. Release button when finished speaking
4. Wait for processing (pulsing indicator should appear)

**Expected**:
- Pulsing recording indicator while speaking
- "Processing..." text with inline spinner
- Updated ingredient/dish lists after ~2-5 seconds
- "Complete Setup" button becomes enabled

**Test Cases**:
```text
✅ "Add eggs and tomatoes" → Adds to ingredients
✅ "Remove milk" → Removes from ingredients
✅ "I can cook pasta" → Adds to dishes
✅ "Add eggs" (when eggs already present) → Shows duplicate toast
✅ Speak gibberish → Shows error "Couldn't understand. Try again."
```

### Step 4: Test Text Fallback

**Test 1: Permission Denied**
1. Deny microphone permission when browser prompts
2. **Expected**: Microphone button hidden, text input visible with message

**Test 2: Consecutive Failures**
1. Allow microphone permission
2. Hold mic button and make loud noise (not speech)
3. Wait for error: "Couldn't understand. Try again."
4. Retry with more loud noise (second failure)
5. **Expected**: Message "Still having trouble. Would you like to type instead?"
6. Text input field highlighted below mic button

**Test 3: Text Input Processing**
1. Type in text input: "Add chicken, remove cheese"
2. Click submit button or press Enter
3. **Expected**: Same processing flow as voice, updates list in 2-5 seconds

### Step 5: Complete Onboarding

1. After making ≥1 voice/text change in step 3
2. Click "Complete Setup" button (should be enabled)
3. **Expected**: Redirected to `/suggestions` page (profile persistence in separate feature)

---

## Verification Checklist

- [ ] Welcome screen displays correctly (step 1)
- [ ] Badge selection works for dishes/fridge/pantry (step 2)
- [ ] "Clear All" button deselects all badges
- [ ] "Continue" button advances to step 3 with slide animation
- [ ] Microphone button requests permission on first tap
- [ ] Voice recording shows pulsing indicator and duration timer
- [ ] Voice processing updates lists correctly (add/remove operations)
- [ ] Duplicate detection shows toast notification
- [ ] Text fallback appears after 2 consecutive voice failures
- [ ] Text input processes natural language correctly
- [ ] "Complete Setup" button disabled until voice/text change made
- [ ] Navigation redirects to `/suggestions` after completion

---

## Common Issues & Solutions

### Issue: "GOOGLE_GENERATIVE_AI_API_KEY is not defined"

**Solution**:
1. Verify `.env.local` exists in `apps/nextjs/` directory
2. Check API key is set correctly (no quotes needed)
3. Restart dev server after adding environment variable

### Issue: Microphone not working

**Solution**:
1. Check browser console for permission errors
2. Verify microphone works in other apps (system settings)
3. Try different browser (Chrome/Firefox recommended, Safari may have issues)
4. Use text fallback for testing if microphone unavailable

### Issue: Voice processing always fails

**Solution**:
1. Verify Google AI API key is valid (test at [AI Studio](https://aistudio.google.com/))
2. Check rate limits not exceeded (15 req/min free tier)
3. Inspect network tab for API call failures
4. Check server logs for Gemini API errors

### Issue: Audio format not supported

**Solution**:
1. Check browser supports WebM (Chrome, Firefox, Edge ✅ | Safari ⚠️)
2. Fallback should auto-select compatible format
3. Check console for MediaRecorder errors
4. Try different browser if persistent

### Issue: Slide animations not smooth

**Solution**:
1. Check no browser extensions interfering (disable ad blockers)
2. Verify no console errors slowing down React
3. Test on physical device for mobile experience

---

## Development Tips

### Enable Detailed Logging

Add to `apps/nextjs/src/app/api/onboarding/process-voice/route.ts`:

```typescript
console.log('[Voice Processing] Input:', { audioLength, textLength, context });
console.log('[Gemini Response]:', result);
```

### Test Without Voice API

Mock the Gemini response for faster iteration:

```typescript
// Temporary mock for development
const mockResult: VoiceUpdate = {
  add: { dishes: ["Mock Dish"], ingredients: ["Mock Ingredient"] },
  remove: { dishes: [], ingredients: [] },
};
return NextResponse.json(mockResult);
```

### Test Responsive Design

1. Open Chrome DevTools (F12)
2. Click device toolbar icon (mobile view)
3. Test on various screen sizes: iPhone SE, iPad, Desktop
4. Verify touch targets ≥44px, no horizontal scroll

**Neobrutalism Design Features** (Phase 8):
- Thick black borders (4px mobile, 6px desktop) on all interactive elements
- Solid box shadows with hover translation effects on badges
- Vibrant gradient progress bar (yellow → orange → pink)
- Playful asymmetry with section rotations on desktop (md: breakpoint)
- All headings styled with font-black and uppercase
- ARIA live regions for screen reader announcements

### Monitor API Usage

Track Gemini API quota at [AI Studio](https://aistudio.google.com/app/apikey):
- Free tier: 15 requests/minute, 1500/day
- Monitor usage during testing to avoid rate limits

---

## Next Steps

After successful local testing:

1. **Write Tests**: Add unit tests for voice processing logic (vitest)
2. **Error Tracking**: Add Sentry or similar for production error monitoring
3. **A/B Testing**: Test hold-to-speak vs tap-to-toggle patterns with users
4. **Performance Monitoring**: Track voice processing latency with Opik
5. **Profile Persistence**: Implement in separate feature (out of scope for this feature)

---

## Additional Resources

- **Gemini API Docs**: [https://ai.google.dev/gemini-api/docs](https://ai.google.dev/gemini-api/docs)
- **MediaRecorder API**: [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- **Next.js API Routes**: [Official Guide](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- **Supabase Auth**: [Docs](https://supabase.com/docs/guides/auth)

---

## Accessibility Features (Phase 10)

The onboarding flow includes comprehensive accessibility support:
- **ARIA Live Regions**: Status updates announced to screen readers
- **Touch Targets**: All interactive elements ≥44x44px (WCAG 2.1 AA)
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Error Messages**: Clear, actionable error messaging with role="alert"
- **Progress Indication**: Screen reader announces current step changes

---

**Last Updated**: 2026-01-23
**Support**: File issues in project GitHub repository
