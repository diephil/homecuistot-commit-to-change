"use client";

import { VoiceInput } from "@/components/shared/VoiceInput";
import { Button } from "@/components/shared/Button";
import { VoiceGuidance } from "./VoiceGuidance";

type InputMode = "voice" | "text";
type VoiceGuidanceContext = "inventory" | "recipe" | "recipe-update";

interface QuickInputSectionProps {
  inputMode: InputMode;
  textValue: string;
  onInputModeChange: (mode: InputMode) => void;
  onTextChange: (value: string) => void;
  onTextSubmit: () => void;
  onVoiceComplete: (audioBlob: Blob) => void;
  disabled?: boolean;
  textPlaceholder?: string;
  submitButtonText?: string;
  multiline?: boolean;
  showVoiceGuidance?: boolean;
  voiceGuidanceContext?: VoiceGuidanceContext;
}

export function QuickInputSection({
  inputMode,
  textValue,
  onInputModeChange,
  onTextChange,
  onTextSubmit,
  onVoiceComplete,
  disabled = false,
  textPlaceholder = "Type here...",
  submitButtonText = "Process",
  multiline = true,
  showVoiceGuidance = false,
  voiceGuidanceContext = "inventory",
}: QuickInputSectionProps) {
  return (
    <div className="space-y-3 p-5 bg-secondary border-2 border-black rounded shadow-md">
      <p className="text-sm font-bold uppercase tracking-wide">Quick Add</p>

      {inputMode === "voice" ? (
        <div className="space-y-4">
          <VoiceInput
            onRecordingComplete={onVoiceComplete}
            disabled={disabled}
          />

          {showVoiceGuidance && <VoiceGuidance context={voiceGuidanceContext} />}

          <button
            type="button"
            onClick={() => onInputModeChange("text")}
            className="text-sm font-medium underline hover:no-underline"
            disabled={disabled}
          >
            Do you prefer typing?
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {multiline ? (
            <textarea
              value={textValue}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder={textPlaceholder}
              className="w-full h-32 p-3 border-2 border-black rounded font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black"
              disabled={disabled}
            />
          ) : (
            <input
              type="text"
              value={textValue}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder={textPlaceholder}
              className="w-full px-4 py-2 border-2 border-black rounded shadow-sm font-medium focus:outline-none focus:shadow-md transition-shadow"
              disabled={disabled}
              onKeyDown={(e) => {
                if (e.key === "Enter" && textValue.trim()) {
                  onTextSubmit();
                }
              }}
            />
          )}
          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={onTextSubmit}
              disabled={!textValue.trim() || disabled}
              className="flex-1"
            >
              {submitButtonText}
            </Button>
            <button
              type="button"
              onClick={() => onInputModeChange("voice")}
              className="text-sm font-medium underline hover:no-underline"
              disabled={disabled}
            >
              Use voice instead
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
