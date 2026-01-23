# Voice Onboarding Feature - Technical Research & Decisions

**Date:** 2026-01-22
**Target Environment:** Next.js 16 + React 19 + TypeScript 5+ + @ai-sdk/google
**Context:** Onboarding voice feature for meal planning app (audio → JSON extraction)

---

## 1. Gemini API Integration with @ai-sdk/google

### Model Selection

**Decision: Use `gemini-2.5-flash` for audio-to-JSON extraction**

**Rationale:**
- **Audio Support:** Gemini 2.5 Flash has native audio input capabilities with enhanced performance
- **Structured Output:** Full support for `responseSchema` with JSON Schema (announced 2025, actively maintained in 2026)
- **Speed:** Flash variant optimized for real-time interactions vs slower Pro models
- **Context Window:** 1M token context window handles long audio inputs (up to 9.5 hours)
- **Cost-Effectiveness:** Flash models balance performance with API costs

**Alternative Considered:** `gemini-2.0-flash-exp` - experimental model with similar capabilities but less stable

### Audio Format Support

**Decision: Primary format is `audio/webm` (with Opus codec), fallback to `audio/mp3`**

**Supported Formats (verified 2026):**
- ✅ `audio/webm` (recommended - best browser support)
- ✅ `audio/mp3`
- ✅ `audio/wav`
- ✅ `audio/ogg`
- ✅ `audio/flac`
- ✅ `audio/aiff`
- ✅ `audio/aac`
- ✅ `audio/m4a`

**Rationale:**
- WebM/Opus widely supported in modern browsers (Chrome, Firefox, Edge)
- Efficient compression reduces payload size for API calls
- MP3 fallback for Safari/iOS compatibility
- Gemini downsamples to 16 kbps internally, so high-quality input not required

**Audio Processing Details:**
- 1 second audio = 32 tokens
- 1 minute audio = 1,920 tokens
- Maximum audio length: 9.5 hours per prompt

### Structured JSON Response Configuration

**Decision: Use `responseSchema` with Zod for type-safe schema definition**

**Implementation Pattern (from AI SDK docs):**

```typescript
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { z } from 'zod';

const OnboardingDataSchema = z.object({
  dietaryRestrictions: z.array(z.string()),
  allergies: z.array(z.string()),
  favoriteCuisines: z.array(z.string()),
  householdSize: z.number(),
  cookingSkillLevel: z.enum(['beginner', 'intermediate', 'advanced']),
});

const result = await generateText({
  model: google('gemini-2.5-flash'),
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Extract onboarding information from this audio. Return dietary restrictions, allergies, favorite cuisines, household size, and cooking skill level.',
        },
        {
          type: 'file',
          mediaType: 'audio/webm',
          data: audioBase64, // Base64-encoded audio
        },
      ],
    },
  ],
  schema: OnboardingDataSchema,
  schemaName: 'OnboardingData',
});
```

**Rationale:**
- **Type Safety:** Zod schemas work seamlessly with TypeScript
- **Validation:** Client-side validation before sending to backend
- **JSON Schema Support:** Gemini API supports JSON Schema natively (2025+ enhancement)
- **@ai-sdk/google Integration:** Verified pattern from official AI SDK documentation

### Base64 Encoding Requirements

**Decision: Encode audio as Base64 string before sending to Gemini API**

**Implementation:**
```typescript
// Browser-side encoding
const audioBlob = await getRecordedAudioBlob();
const arrayBuffer = await audioBlob.arrayBuffer();
const base64Audio = Buffer.from(arrayBuffer).toString('base64');

// Alternative using FileReader API
const reader = new FileReader();
reader.readAsDataURL(audioBlob);
reader.onloadend = () => {
  const base64Audio = reader.result.split(',')[1]; // Remove data:audio/webm;base64, prefix
};
```

**Rationale:**
- Required format for file content in AI SDK's `type: 'file'` message content
- Consistent with documented patterns for PDF, image, video inputs
- Enables direct API calls without multipart form encoding

---

## 2. MediaRecorder API Implementation

### Optimal Audio Format

**Decision: `audio/webm;codecs=opus` with fallback strategy**

**Implementation:**
```typescript
const getOptimalMimeType = (): string => {
  const preferred = 'audio/webm;codecs=opus';
  if (MediaRecorder.isTypeSupported(preferred)) {
    return preferred;
  }

  const fallbacks = [
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4', // Safari fallback
  ];

  for (const mimeType of fallbacks) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  return ''; // Browser will choose default
};
```

**Rationale:**
- **Opus Codec:** Best compression for voice (low bitrate, high quality)
- **WebM Container:** Widely supported (Chrome, Firefox, Edge)
- **Safari Support:** MP4/AAC fallback for iOS devices
- **Browser Detection:** Always test with `isTypeSupported()` before instantiation

**Browser Support Matrix:**
- Chrome/Edge: `audio/webm;codecs=opus` ✅
- Firefox: `audio/ogg;codecs=opus` ✅
- Safari: `audio/mp4` (AAC codec) ✅

### Microphone Permission Patterns

**Decision: Progressive permission request with clear user messaging**

**Implementation:**
```typescript
const requestMicrophonePermission = async (): Promise<MediaStream | null> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      }
    });
    return stream;
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      // User denied permission
      showPermissionDeniedUI();
    } else if (error.name === 'NotFoundError') {
      // No microphone found
      showNoMicrophoneUI();
    } else {
      // Other errors (NotSupportedError, etc.)
      showGenericErrorUI();
    }
    return null;
  }
};
```

**Rationale:**
- **Enhanced Audio Quality:** Enable noise suppression and echo cancellation for better transcription
- **Error-Specific Handling:** Different UI responses for permission denied vs hardware issues
- **Progressive Enhancement:** Request permission only when user initiates voice input (not on page load)

### Error Handling Strategies

**Decision: Multi-layered error handling with graceful degradation**

**Error Types & Responses:**

1. **Permission Denied (`NotAllowedError`):**
   - Show inline message: "Microphone access required. Please enable in browser settings."
   - Provide text input fallback immediately
   - Store denial state to avoid repeated prompts

2. **No Microphone (`NotFoundError`):**
   - Show message: "No microphone detected. Please use text input."
   - Auto-switch to text input mode
   - Hide voice input button

3. **Recording Errors (`MediaRecorderErrorEvent`):**
   - Monitor `onerror` event handler
   - Stop recording automatically
   - Log error details for debugging
   - Show retry option or text fallback

**Implementation:**
```typescript
mediaRecorder.onerror = (event: MediaRecorderErrorEvent) => {
  console.error('MediaRecorder error:', event.error);

  if (event.error.name === 'SecurityError') {
    // Stream became unavailable (tab backgrounded, permission revoked)
    showReconnectUI();
  } else {
    // Generic error - offer text fallback
    showTextFallbackUI();
  }

  mediaRecorder.stop();
};
```

**Rationale:**
- **User-Centric:** Clear error messages guide users to solutions
- **Defensive:** Handle edge cases (tab backgrounding, permission revocation mid-recording)
- **Graceful Degradation:** Always provide text input as fallback

### Auto-Stop Recording Strategies

**Decision: Time-based limit (60 seconds) with manual stop option**

**Rationale:**
- **Time Limit Approach (Chosen):**
  - ✅ Simple implementation
  - ✅ Predictable UX (users know maximum duration)
  - ✅ Prevents excessive API costs (1 min = 1,920 tokens)
  - ✅ No false positives from pauses in speech
  - ⚠️ May cut off verbose users

- **Silence Detection Approach (Not Chosen):**
  - ❌ Complex implementation (requires Web Audio API analysis)
  - ❌ False positives from natural pauses
  - ❌ Requires threshold tuning (environment-dependent)
  - ✅ More natural conversation flow

**Implementation:**
```typescript
const MAX_RECORDING_DURATION = 60 * 1000; // 60 seconds

const startRecording = () => {
  mediaRecorder.start();

  // Auto-stop after 60 seconds
  const timeoutId = setTimeout(() => {
    if (mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      showMaxDurationReachedMessage();
    }
  }, MAX_RECORDING_DURATION);

  // Clear timeout if manually stopped
  mediaRecorder.onstop = () => {
    clearTimeout(timeoutId);
  };
};
```

**Future Enhancement:** Add silence detection as opt-in feature after validating time-based approach

---

## 3. Voice Input UX Patterns

### Hold-to-Speak vs Tap-to-Toggle

**Decision: Hold-to-speak (Push-to-Talk) for initial implementation**

**Rationale:**

**Hold-to-Speak (Chosen):**
- ✅ **Cleaner Audio:** User knows exactly when recording starts/stops
- ✅ **No Endpoint Detection:** Eliminates false stops from pauses
- ✅ **Intuitive:** Familiar pattern (walkie-talkies, voice messages)
- ✅ **Mobile-Friendly:** Natural for touchscreens
- ⚠️ **Physical Strain:** Holding button may be uncomfortable for long recordings
- ⚠️ **Accessibility Concern:** Difficult for users with motor impairments

**Tap-to-Toggle (Alternative):**
- ✅ **No Physical Strain:** Better for long recordings
- ✅ **Faster Responses:** Can stream during recording
- ❌ **Timing Issues:** Users may wait too long after tap or pause mid-sentence
- ❌ **Requires Endpoint Detection:** Complex implementation
- ❌ **Less Predictable:** Users unsure when recording stops

**Implementation Decision:**
- Start with hold-to-speak for simplicity and accuracy
- Add tap-to-toggle as opt-in preference after user feedback
- Provide clear visual indication of recording state

**UX Guidance:**
- Display "Hold to speak" label on button
- Provide haptic feedback on press/release (mobile)
- Show recording duration timer during hold

### Visual Feedback During Recording

**Decision: Pulsing indicator + duration timer + waveform visualization (progressive)**

**Implementation Phases:**

**Phase 1 (MVP):** Pulsing Indicator + Timer
```typescript
<button
  className={cn(
    "relative rounded-full",
    isRecording && "animate-pulse ring-4 ring-red-500"
  )}
>
  {isRecording && (
    <span className="absolute -top-8 left-1/2 -translate-x-1/2">
      {formatDuration(recordingDuration)}
    </span>
  )}
  <MicrophoneIcon />
</button>
```

**Phase 2 (Enhancement):** Add Waveform Visualization
- Use Web Audio API `AnalyserNode` for real-time audio level
- Display animated bars or circular waveform
- Provides user confidence that voice is being captured

**Rationale:**
- **Pulsing Indicator:** Clear visual signal recording is active
- **Duration Timer:** Helps users stay within time limit
- **Waveform (Future):** Professional feel, confirms audio capture
- **Progressive Enhancement:** Start simple, add complexity based on user feedback

**Accessibility Considerations:**
- Announce "Recording started" to screen readers via `aria-live="polite"`
- Provide color-blind friendly indicators (not just red/green)
- Ensure contrast ratios meet WCAG 2.1 AA standards

### Text Fallback UI Patterns

**Decision: Always-visible text input option (not hidden behind voice failure)**

**Implementation:**
```typescript
<div className="flex flex-col gap-4">
  {/* Voice Input */}
  <div className="flex items-center gap-2">
    <VoiceRecordButton />
    <span className="text-sm text-muted-foreground">or type below</span>
  </div>

  {/* Text Input (Always Available) */}
  <Textarea
    placeholder="Tell us about your dietary preferences..."
    className="min-h-[120px]"
  />
</div>
```

**Rationale:**
- **Accessibility First:** Voice input not accessible to all users (deaf, speech impairments, noisy environments)
- **User Preference:** Some users prefer typing regardless of technical capability
- **Friction Reduction:** No need to attempt and fail voice to unlock text input
- **Mobile Consideration:** Voice may be inappropriate in public settings

**Error State Enhancement:**
- If voice fails 2+ times, highlight text input with gentle prompt: "Try typing instead?"
- Never auto-focus text input unless user explicitly switches modes

### Consecutive Failure Recovery

**Decision: 2-strike rule with progressive guidance**

**Implementation Logic:**
```typescript
const [voiceFailureCount, setVoiceFailureCount] = useState(0);

const handleVoiceError = () => {
  const newCount = voiceFailureCount + 1;
  setVoiceFailureCount(newCount);

  if (newCount === 1) {
    // First failure: gentle retry
    showToast("Couldn't process audio. Please try again.");
  } else if (newCount === 2) {
    // Second failure: suggest text input
    showToast("Having trouble with voice? Try typing below.");
    highlightTextInput();
  } else {
    // Third+ failure: auto-switch to text mode
    setInputMode('text');
    showToast("Switched to text input. You can try voice again anytime.");
  }
};
```

**Rationale:**
- **2 Strikes:** Balance between giving users chance to retry and avoiding frustration
- **Progressive Disclosure:** Don't overwhelm on first failure
- **Reset on Success:** Clear failure count if voice input succeeds
- **Non-Punitive:** Allow users to retry voice even after auto-switch

**Accessibility Note:** Follow error messaging best practices:
- Use `aria-live="polite"` for non-critical errors
- Use `aria-describedby` to associate error messages with input
- Set `aria-invalid="true"` on failed input attempts

---

## 4. Mobile-First Responsive Design

### Minimum Touch Target Sizes

**Decision: 44×44px minimum for all interactive elements (WCAG AAA + platform guidelines)**

**Standards Reference:**
- **WCAG 2.2 Level AA:** 24×24px minimum (baseline)
- **WCAG 2.2 Level AAA:** 44×44px minimum (recommended)
- **iOS Human Interface Guidelines:** 44×44pt minimum
- **Android Material Design:** 48×48dp minimum
- **Microsoft Fluent Design:** 44×44px minimum

**Implementation:**
```typescript
// Tailwind CSS config
module.exports = {
  theme: {
    extend: {
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
    },
  },
};

// Component usage
<button className="min-h-touch min-w-touch rounded-full p-3">
  <MicrophoneIcon className="h-6 w-6" />
</button>
```

**Rationale:**
- **Accessibility:** 44×44px accommodates users with motor impairments
- **Platform Consistency:** Aligns with iOS/Android native guidelines
- **Error Reduction:** Larger targets reduce accidental taps
- **Future-Proof:** Exceeds current WCAG requirements (24px AA)

**Exception:** Text links within paragraphs exempt from size requirement (WCAG 2.5.8 exception)

### Preventing Horizontal Overflow with CSS Rotations

**Decision: Container-based overflow control + transform containment**

**Problem:** CSS `transform: rotate()` can cause elements to extend beyond viewport on mobile

**Solution:**
```css
/* Parent container */
.voice-input-container {
  overflow: hidden; /* Clip overflowing content */
  position: relative;
  max-width: 100%;
}

/* Rotated element */
.rotating-mic-icon {
  transform: rotate(45deg);
  contain: layout paint; /* Contain paint and layout */
  max-width: 100%;
  box-sizing: border-box; /* Include padding/borders in width */
}

/* Global mobile safeguard */
body {
  overflow-x: hidden; /* Prevent horizontal scroll on body */
  max-width: 100vw;
}
```

**Rationale:**
- **overflow: hidden on parent:** Clips children that extend beyond bounds
- **contain: layout paint:** CSS containment prevents overflow propagation
- **box-sizing: border-box:** Ensures padding/borders don't cause overflow
- **max-width: 100%:** Prevents fixed-width elements from exceeding viewport

**Testing Strategy:**
- Test on physical devices (iOS Safari, Android Chrome)
- Use browser DevTools responsive mode with various screen sizes
- Validate with long content and edge cases

### Responsive Shadow and Border Scaling

**Decision: Use CSS custom properties (variables) with breakpoint-based scaling**

**Implementation:**
```css
/* Tailwind v4 syntax with CSS variables */
@theme {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.15);

  --border-mobile: 1px;
  --border-tablet: 2px;
  --border-desktop: 3px;
}

/* Component with responsive shadow/border */
.voice-input-card {
  box-shadow: var(--shadow-sm);
  border-width: var(--border-mobile);

  @media (min-width: 768px) {
    box-shadow: var(--shadow-md);
    border-width: var(--border-tablet);
  }

  @media (min-width: 1024px) {
    box-shadow: var(--shadow-lg);
    border-width: var(--border-desktop);
  }
}
```

**Rationale:**
- **Mobile-First:** Start with subtle shadows/borders, scale up for larger screens
- **Visual Hierarchy:** Larger screens benefit from stronger depth cues
- **Performance:** CSS variables avoid redundant calculations
- **Tailwind v4 Native:** Leverages Tailwind's CSS variable system

**Design Principles:**
- **Elevation System:** Shadows imply depth (bigger shadow = higher elevation)
- **Proportional Scaling:** Border thickness scales with screen size for visual consistency
- **Accessibility:** Ensure sufficient contrast regardless of shadow strength

**Alternative Approach (clamp-based):**
```css
.voice-input-card {
  box-shadow: 0 clamp(2px, 0.5vw, 10px) clamp(4px, 1vw, 15px) rgba(0, 0, 0, 0.1);
  border-width: clamp(1px, 0.2vw, 3px);
}
```
- **Fluid Scaling:** Smooth transition between breakpoints
- **Single Definition:** No media queries needed
- **Consideration:** Less predictable than discrete breakpoints

---

## Summary of Key Decisions

| Area | Decision | Primary Rationale |
|------|----------|------------------|
| **Gemini Model** | `gemini-2.5-flash` | Balance of speed, structured output support, cost |
| **Audio Format** | `audio/webm;codecs=opus` | Best compression for voice, wide browser support |
| **Input Pattern** | Hold-to-speak (push-to-talk) | Cleaner audio, intuitive UX, simpler implementation |
| **Fallback Strategy** | Always-visible text input | Accessibility-first, reduces friction |
| **Touch Target Size** | 44×44px minimum | WCAG AAA + platform guidelines compliance |
| **Failure Recovery** | 2-strike rule with progressive guidance | Balance between retry opportunity and frustration prevention |
| **Visual Feedback** | Pulsing indicator + timer (MVP) | Clear recording state, simple implementation |
| **Overflow Prevention** | Container overflow hidden + containment | Prevents transform-related horizontal scroll |

---

## Implementation Checklist

- [ ] Set up `@ai-sdk/google` with `gemini-2.5-flash` model
- [ ] Implement Zod schema for onboarding data structure
- [ ] Create MediaRecorder wrapper with format fallback logic
- [ ] Add microphone permission flow with error-specific handling
- [ ] Build hold-to-speak voice input button (44×44px minimum)
- [ ] Implement 60-second recording time limit
- [ ] Add pulsing visual indicator and duration timer
- [ ] Create always-visible text input fallback
- [ ] Implement 2-strike failure recovery logic
- [ ] Add ARIA live regions for screen reader announcements
- [ ] Test responsive design on physical iOS/Android devices
- [ ] Validate horizontal overflow prevention with rotations
- [ ] Implement responsive shadow/border scaling with CSS variables

---

## References

### Gemini API & AI SDK
- [Gemini 2.5 Native Audio Upgrade](https://blog.google/products/gemini/gemini-audio-model-updates/)
- [Generate Structured Output (JSON) with Gemini API](https://firebase.google.com/docs/ai-logic/generate-structured-output)
- [Google Announces JSON Schema Support in Gemini API](https://blog.google/technology/developers/gemini-api-structured-outputs/)
- [Audio Understanding | Gemini API](https://ai.google.dev/gemini-api/docs/audio)
- [AI SDK - Gemini Provider](https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai)

### MediaRecorder API
- [Record Audio with MediaRecorder | Chrome Developers](https://developer.chrome.com/blog/mediarecorder)
- [opus-media-recorder GitHub](https://github.com/kbumsik/opus-media-recorder)
- [MediaRecorder API | WebKit](https://webkit.org/blog/11353/mediarecorder-api/)
- [MediaRecorder: error event | MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/error_event)

### Voice Input UX
- [Tap and Talk vs Push-to-Talk | Medium](https://medium.com/@grebler/tap-and-talk-vs-push-to-talk-3ce14919372b)
- [Voice User Interface Design: Mobile UX Standard](https://www.resourcifi.com/voice-user-interface-design-the-new-standard-for-mobile-ux/)
- [Voice User Interfaces 2025: Smarter, Touchless UX](https://naskay.com/blog/voice-user-interfaces-2025-smarter-touchless-design/)
- [Microinteractions: Accessible UI Feedback](https://www.accessibilitychecker.org/blog/microinteractions/)
- [Ultimate Guide to Error Messaging Accessibility | UXPin](https://www.uxpin.com/studio/blog/ultimate-guide-to-error-messaging-accessibility/)

### Mobile-First Design & Accessibility
- [Understanding SC 2.5.8: Target Size (Minimum) | W3C](https://www.wcag.com/developers/2-5-8-target-size-minimum-level-aa/)
- [Accessible Target Sizes Cheatsheet | Smashing Magazine](https://www.smashingmagazine.com/2023/04/accessible-tap-target-sizes-rage-taps-clicks/)
- [Prevent Horizontal Scroll on Mobile](https://foxscribbler.com/prevent-horizontal-scroll-on-mobile/)
- [CSS Grid Responsive Design: Mobile-First Approach](https://medium.com/codetodeploy/css-grid-responsive-design-the-mobile-first-approach-that-actually-works-194bdab9bc52)
- [Designing Beautiful Shadows in CSS | Josh W. Comeau](https://www.joshwcomeau.com/css/designing-shadows/)
- [Responsive Design - Tailwind CSS](https://tailwindcss.com/docs/responsive-design)

---

**Last Updated:** 2026-01-22
**Next Review:** After MVP implementation and user testing
