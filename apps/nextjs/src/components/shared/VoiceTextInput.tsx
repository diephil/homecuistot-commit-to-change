"use client";

import { useState, useCallback, useEffect } from "react";
import { Mic, Loader2, Send, X, Square } from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { Button } from "@/components/shared/Button";
import { LastHeardDisplay } from "./LastHeardDisplay";
import { cn } from "@/lib/utils";

/**
 * T006: VoiceTextInput - Shared component for mic recording + text fallback
 * Spec: specs/019-onboarding-revamp/contracts/components.md
 *
 * Used in:
 * - Onboarding step 3 (add/remove ingredients)
 * - Future: Recipe editing, inventory quick-add, voice notes
 */

type VoiceTextInputResult =
  | { type: "voice"; audioBlob: Blob }
  | { type: "text"; text: string };

interface VoiceTextInputProps {
  onSubmit: (input: VoiceTextInputResult) => void;
  disabled?: boolean;
  processing?: boolean;
  voiceLabel?: string;
  textPlaceholder?: string;
  textFallbackLabel?: string;
  instructions?: React.ReactNode;
  className?: string;
  /** Last transcription from voice input - displayed above the mic */
  lastTranscription?: string;
  /** Assistant response - displayed below last transcription when available */
  assistantResponse?: string;
}

export function VoiceTextInput({
  onSubmit,
  disabled = false,
  processing = false,
  voiceLabel = "Hold to record",
  textPlaceholder = "Type ingredients to add or remove...",
  textFallbackLabel = "Prefer to type instead?",
  instructions,
  className,
  lastTranscription,
  assistantResponse,
}: VoiceTextInputProps) {
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");
  const [textValue, setTextValue] = useState("");

  const {
    state: voiceState,
    duration,
    error: voiceError,
    permissionDenied,
    start,
    stop,
    cancel,
    consumeAudio,
  } = useVoiceInput();

  // Derive effective input mode based on permission status
  const effectiveInputMode = permissionDenied ? "text" : inputMode;

  // Process audio when voice state transitions to 'stopped' (user stop or auto-stop)
  useEffect(() => {
    if (voiceState === "stopped") {
      const blob = consumeAudio();
      if (blob) {
        onSubmit({ type: "voice", audioBlob: blob });
      }
    }
  }, [voiceState, consumeAudio, onSubmit]);

  const handleRecordStart = useCallback(() => {
    if (disabled || processing) return;
    start();
  }, [disabled, processing, start]);

  const handleRecordStop = useCallback(() => {
    if (voiceState === "recording") {
      stop();
    }
  }, [voiceState, stop]);

  const handleTextSubmit = useCallback(() => {
    if (textValue.trim() && !disabled && !processing) {
      onSubmit({ type: "text", text: textValue.trim() });
      setTextValue("");
    }
  }, [textValue, disabled, processing, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isRecording = voiceState === "recording";
  const showRecordingUI = isRecording && !processing;
  const isDisabled = disabled || processing;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Instructions */}
      {instructions && (
        <div className="text-sm text-gray-600">{instructions}</div>
      )}

      {/* Voice Mode */}
      {effectiveInputMode === "voice" && !permissionDenied && (
        <div className="flex flex-col items-center gap-4">
          {/* Last transcription display */}
          {lastTranscription && !processing && (
            <LastHeardDisplay
              transcription={lastTranscription}
              className="w-full max-w-md"
            />
          )}

          {/* Assistant response display
          {assistantResponse && !processing && (
            <div className="w-full max-w-md px-4 py-3 bg-blue-50 border-2 border-black rounded text-center">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                Assistant response
              </p>
              <p className="text-sm text-gray-800 italic">
                &ldquo;{assistantResponse}&rdquo;
              </p>
            </div>
          )} */}

          {/* Recording area with cancel button */}
          <div className="relative">
            {/* Hold-to-speak button */}
            <button
              onMouseDown={handleRecordStart}
              onMouseUp={handleRecordStop}
              onTouchStart={handleRecordStart}
              onTouchEnd={handleRecordStop}
              disabled={isDisabled}
              aria-label={voiceLabel}
              className={cn(
                "relative rounded-full p-6 min-h-[80px] min-w-[80px]",
                "border-4 md:border-6 border-black bg-pink-400",
                "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
                "hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]",
                "active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
                "transition-all cursor-pointer",
                showRecordingUI && "animate-pulse ring-4 ring-red-500",
                isDisabled && "opacity-50 !cursor-not-allowed"
              )}
            >
              {processing ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : showRecordingUI ? (
                <Square className="h-8 w-8 fill-current" />
              ) : (
                <Mic className="h-8 w-8" />
              )}

              {/* Recording duration display */}
              {showRecordingUI && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-bold bg-red-500 text-white px-2 py-1 rounded">
                  {formatDuration(duration)}
                </span>
              )}
            </button>

            {/* Cancel button (absolutely positioned to the right) */}
            {showRecordingUI && (
              <button
                onClick={cancel}
                className="absolute left-[calc(100%+20px)] top-1/2 -translate-y-1/2 p-2 bg-red-400 hover:bg-red-500 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer opacity-90 hover:opacity-100"
                aria-label="Cancel recording"
              >
                <X className="h-4 w-4 text-white stroke-[2.5px]" />
              </button>
            )}
          </div>

          {/* Status messages */}
          {showRecordingUI && (
            <p
              className="text-sm font-bold text-red-600"
              role="status"
              aria-live="polite"
            >
              Recording...
            </p>
          )}
          {processing && (
            <p
              className="text-sm font-bold text-blue-600"
              role="status"
              aria-live="polite"
            >
              Processing...
            </p>
          )}
          {voiceError && !permissionDenied && (
            <p className="text-sm text-red-600">{voiceError}</p>
          )}

          {/* Toggle to text (hidden during recording/processing) */}
          {!showRecordingUI && !processing && (
            <button
              onClick={() => setInputMode("text")}
              className="text-sm text-gray-600 hover:text-gray-900 underline cursor-pointer disabled:cursor-not-allowed"
              disabled={isDisabled}
              aria-label="Switch to text input"
            >
              {textFallbackLabel}
            </button>
          )}
        </div>
      )}

      {/* Text Mode */}
      {effectiveInputMode === "text" && (
        <div className="space-y-3">
          {/* Toggle back to voice */}
          {!permissionDenied && (
            <div className="text-center">
              <button
                onClick={() => setInputMode("voice")}
                className="text-sm text-gray-600 hover:text-gray-900 underline cursor-pointer disabled:cursor-not-allowed"
                disabled={isDisabled}
              >
                Use voice instead?
              </button>
            </div>
          )}

          {permissionDenied && (
            <p className="text-sm text-gray-600 text-center">
              Microphone access denied. Please use text input below.
            </p>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={textPlaceholder}
              className={cn(
                "flex-1 px-4 py-3 border-4 border-black rounded",
                "focus:outline-none focus:ring-2 focus:ring-pink-500",
                "min-h-[44px]"
              )}
              disabled={isDisabled}
            />
            <Button
              onClick={handleTextSubmit}
              disabled={isDisabled || !textValue.trim()}
              className={cn("min-h-[44px]", isDisabled || !textValue.trim() ? "cursor-not-allowed opacity-50" : "cursor-pointer")}
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
