import { useState, useRef, useCallback, useEffect } from "react";

/**
 * T004: useVoiceInput hook for voice capture with MediaRecorder API
 * Spec: specs/004-onboarding-flow/research.md lines 124-243
 */

const MAX_RECORDING_DURATION_MS = 60 * 1000;

interface UseVoiceInputReturn {
  isRecording: boolean;
  recordingDuration: number;
  audioBlob: Blob | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearAudioBlob: () => void;
  clearRecordingArtifacts: () => void;
  reset: () => void;
  error: Error | null;
  permissionDenied: boolean;
}

export function useVoiceInput(): UseVoiceInputReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoStopTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getOptimalMimeType = (): string => {
    const preferred = "audio/webm;codecs=opus";
    if (MediaRecorder.isTypeSupported(preferred)) {
      return preferred;
    }

    const fallbacks = [
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4", // Safari fallback
    ];

    for (const mimeType of fallbacks) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType;
      }
    }

    return ""; // Browser will choose default
  };

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();

      // Immediately update UI state (onstop handler will complete the cleanup)
      setIsRecording(false);

      // Clear duration timer immediately to stop incrementing
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      // Reset all state before starting
      setError(null);
      setPermissionDenied(false);
      setAudioBlob(null);
      setRecordingDuration(0);
      chunksRef.current = [];

      // Clear any existing timers
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current);
        autoStopTimerRef.current = null;
      }

      // Request microphone with enhanced audio settings
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      const mimeType = getOptimalMimeType();
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || "audio/webm",
        });
        setAudioBlob(blob);

        // Cleanup stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        // Clear auto-stop timer (duration timer already cleared in stopRecording)
        if (autoStopTimerRef.current) {
          clearTimeout(autoStopTimerRef.current);
          autoStopTimerRef.current = null;
        }
      };

      mediaRecorder.onerror = (event: Event) => {
        console.error("MediaRecorder error:", event);
        const errorMsg =
          event instanceof ErrorEvent && event.error
            ? event.error.message
            : "Recording failed";
        setError(new Error(errorMsg));
        stopRecording();
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start duration timer
      durationTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      // Auto-stop after maximum duration
      autoStopTimerRef.current = setTimeout(() => {
        stopRecording();
      }, MAX_RECORDING_DURATION_MS);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setPermissionDenied(true);
          setError(new Error("Microphone permission denied"));
        } else if (err.name === "NotFoundError") {
          setError(new Error("No microphone found"));
        } else {
          setError(err);
        }
      } else {
        setError(new Error("Unknown error occurred"));
      }
      setIsRecording(false);
    }
  }, [stopRecording]);

  const clearAudioBlob = useCallback(() => {
    setAudioBlob(null);
    chunksRef.current = [];
  }, []);

  const clearRecordingArtifacts = useCallback(() => {
    setAudioBlob(null);
    setRecordingDuration(0);
    chunksRef.current = [];
  }, []);

  const reset = useCallback(() => {
    setIsRecording(false);
    setAudioBlob(null);
    setRecordingDuration(0);
    setError(null);
    setPermissionDenied(false);
    chunksRef.current = [];
  }, []);

  // Cleanup on unmount: stop recording, clear timers, release stream
  useEffect(() => {
    return () => {
      // Stop recording if active
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }

      // Release media stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      // Clear all timers
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current);
      }
    };
  }, []);

  return {
    isRecording,
    recordingDuration,
    audioBlob,
    startRecording,
    stopRecording,
    clearAudioBlob,
    clearRecordingArtifacts,
    reset,
    error,
    permissionDenied,
  };
}
