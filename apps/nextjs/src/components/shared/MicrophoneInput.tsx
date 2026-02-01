"use client";

import { useCallback, useEffect, useRef } from "react";
import { Mic, Loader2 } from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { cn } from "@/lib/utils";

interface MicrophoneInputProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled?: boolean;
  processing?: boolean;
  className?: string;
}

export function MicrophoneInput({
  onRecordingComplete,
  disabled = false,
  processing = false,
  className,
}: MicrophoneInputProps) {
  const {
    state: voiceState,
    duration,
    error: voiceError,
    permissionDenied,
    start,
    stop,
    consumeAudio,
  } = useVoiceInput();

  const pendingProcessRef = useRef(false);

  // Process audio when voice state transitions to 'stopped'
  useEffect(() => {
    if (voiceState === "stopped" && pendingProcessRef.current) {
      pendingProcessRef.current = false;
      const blob = consumeAudio();
      if (blob) {
        onRecordingComplete(blob);
      }
    }
  }, [voiceState, consumeAudio, onRecordingComplete]);

  const handleRecordStart = useCallback(() => {
    if (disabled || processing) return;
    start();
  }, [disabled, processing, start]);

  const handleRecordStop = useCallback(() => {
    if (voiceState === "recording") {
      pendingProcessRef.current = true;
      stop();
    }
  }, [voiceState, stop]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isRecording = voiceState === "recording";
  const showRecordingUI = isRecording && !processing;
  const isDisabled = disabled || processing || permissionDenied;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Hold-to-speak button */}
      <button
        onMouseDown={handleRecordStart}
        onMouseUp={handleRecordStop}
        onTouchStart={handleRecordStart}
        onTouchEnd={handleRecordStop}
        disabled={isDisabled}
        aria-label="Hold to record"
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
      {permissionDenied && (
        <p className="text-sm text-red-600">Microphone access denied</p>
      )}
      {voiceError && !permissionDenied && (
        <p className="text-sm text-red-600">{voiceError}</p>
      )}
    </div>
  );
}
