"use client";

import { useEffect } from "react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { Button } from "@/components/shared/Button";

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
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        variant={isRecording ? "secondary" : "default"}
        onClick={handleMicClick}
        disabled={disabled || isStopped}
        className={isRecording ? "bg-red-500 hover:bg-red-600 text-white border-red-700 gap-2" : "gap-2"}
        size="lg"
      >
        <span className="text-xl">{isRecording ? "🔴" : "🎤"}</span>
        <span className="font-bold">{isRecording ? "Stop Recording" : "Record"}</span>
      </Button>
      {isRecording && (
        <div className="text-center">
          <span className="text-sm font-bold">
            {formatDuration(duration)} / 1:00
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
