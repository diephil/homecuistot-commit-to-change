# Shared Components

Reusable components extracted from inventory and recipe modals.

## Components

### `FormModal`
Standard modal wrapper with header and close button.

**Usage:**
```tsx
<FormModal isOpen={isOpen} onClose={handleClose} title="My Form">
  {/* Your content here */}
</FormModal>
```

**Features:**
- Fixed overlay with semi-transparent background
- Responsive Card container (max-w-2xl, max-h-90vh)
- Header with title and close (✕) button
- Consistent neo-brutalist styling

---

### `QuickInputSection`
Voice/text input toggle section for LLM-powered extraction.

**Usage:**
```tsx
<QuickInputSection
  inputMode={inputMode}
  textValue={textInput}
  onInputModeChange={setInputMode}
  onTextChange={setTextInput}
  onTextSubmit={handleTextSubmit}
  onVoiceComplete={handleVoiceComplete}
  textPlaceholder="Type your input..."
  submitButtonText="Process"
  multiline={true}
/>
```

**Props:**
- `inputMode`: "voice" | "text" - Current input mode
- `textValue`: string - Text input value
- `onInputModeChange`: (mode) => void - Toggle between voice/text
- `onTextChange`: (value) => void - Text input change handler
- `onTextSubmit`: () => void - Submit text for processing
- `onVoiceComplete`: (blob) => void - Voice recording complete handler
- `disabled?`: boolean - Disable all inputs
- `textPlaceholder?`: string - Placeholder for text input
- `submitButtonText?`: string - Label for submit button (default: "Process")
- `multiline?`: boolean - Use textarea (true) or input (false)
- `showVoiceGuidance?`: boolean - Show voice input examples with badge (default: false)

**Features:**
- "QUICK ADD" section with bg-secondary styling
- Voice mode: VoiceInput component + optional VoiceGuidance component
- Voice guidance: Reusable component with example phrases
- Text mode: textarea/input + submit button + "Use voice instead" link
- Enter key submits in single-line mode
- Consistent styling across both modes

---

### `VoiceGuidance`
Reusable voice input examples guide.

**Usage:**
```tsx
<VoiceGuidance />
```

**Features:**
- Neo-brutalist blue box with 4px border
- Shows 4 example voice commands
- Font-black headings and blue bullets
- Consistent styling across usage

---

### `LoadingState`
Centered loading spinner with message.

**Usage:**
```tsx
<LoadingState message="Processing..." />
```

**Features:**
- Animated spinner (border-4 border-black)
- Customizable message
- Centered layout with proper spacing

---

## Used In

- ✅ `RecipeForm` - recipe creation/editing

---

## Design System

All components follow the neo-brutalist design language:
- Bold borders (border-2, border-4)
- Black borders and text
- Shadow effects (shadow-md, shadow-[2px_2px_0px_0px_rgba(0,0,0,1)])
- bg-secondary for elevated sections
- Uppercase labels with tracking-wide
