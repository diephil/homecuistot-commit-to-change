"use client";

import { useEffect } from "react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { Button } from "@/components/retroui/Button";

interface VoiceInputProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled?: boolean;
}

export function VoiceInput(props: VoiceInputProps) {
  const { onRecordingComplete, disabled } = props;
  const { state, duration, error, start, stop, consumeAudio } = useVoiceInput();

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
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        onClick={handleMicClick}
        disabled={disabled || isStopped}
        className={isRecording ? "flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white border-red-700" : "flex items-center gap-2"}
      >
        {isRecording ? "🔴" : "🎤"}
        {isRecording ? "Stop" : "Record"}
      </Button>
      {isRecording && (
        <span className="text-sm text-muted-foreground">
          {formatDuration(duration)} / 1:00
        </span>
      )}
      {error && (
        <span className="text-sm text-red-500">{error}</span>
      )}
    </div>
  );
}
