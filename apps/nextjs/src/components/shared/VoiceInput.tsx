"use client";

import { useEffect } from "react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { Button } from "@/components/shared/Button";
import { X, Square } from "lucide-react";

interface VoiceInputProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled?: boolean;
}

export function VoiceInput(props: VoiceInputProps) {
  const { onRecordingComplete, disabled } = props;
  const { state, duration, error, start, stop, cancel, consumeAudio } = useVoiceInput();

  const isRecording = state === "recording";
  const isStopped = state === "stopped";

  async function handleMicClick() {
    if (isRecording) {
      stop();
    } else {
      await start();
    }
  }

  // Auto-consume audio when stopped
  useEffect(() => {
    if (isStopped) {
      const blob = consumeAudio();
      if (blob) {
        onRecordingComplete(blob);
      }
    }
  }, [isStopped, consumeAudio, onRecordingComplete]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative inline-block">
        <Button
          type="button"
          variant={isRecording ? "secondary" : "default"}
          onClick={handleMicClick}
          disabled={disabled || isStopped}
          className={isRecording ? "bg-red-500 hover:bg-red-600 text-white border-red-700 gap-2" : "gap-2"}
          size="lg"
        >
          {isRecording ? (
            <Square className="h-5 w-5 fill-current" />
          ) : (
            <span className="text-xl">🎤</span>
          )}
          <span className="font-bold">{isRecording ? "Stop Recording" : "Record"}</span>
        </Button>

        {/* Cancel button (absolutely positioned to the right) */}
        {isRecording && (
          <button
            onClick={cancel}
            className="absolute left-[calc(100%+20px)] top-1/2 -translate-y-1/2 p-1.5 bg-red-400 hover:bg-red-500 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer opacity-90 hover:opacity-100"
            aria-label="Cancel recording"
          >
            <X className="h-4 w-4 text-white stroke-[2.5px]" />
          </button>
        )}
      </div>
      {isRecording && (
        <div className="text-center">
          <span className="text-sm font-bold">
            {formatDuration(duration)}
          </span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-100 border-2 border-red-500 rounded">
          <span className="text-sm font-medium text-red-700">{error}</span>
        </div>
      )}
    </div>
  );
}
