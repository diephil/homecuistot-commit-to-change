"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/**
 * useVoiceInput - Voice capture with state machine pattern
 *
 * States: idle → recording → stopped → idle
 * - idle: Ready to record
 * - recording: Actively capturing audio
 * - stopped: Audio blob ready for pickup
 *
 * Consumer must call consumeAudio() to get blob and return to idle.
 */

const MAX_RECORDING_MS = 60_000;

type VoiceState = "idle" | "recording" | "stopped";

interface UseVoiceInputReturn {
  state: VoiceState;
  duration: number;
  error: string | null;
  permissionDenied: boolean;
  start: () => Promise<void>;
  stop: () => void;
  consumeAudio: () => Blob | null;
}

export function useVoiceInput(): UseVoiceInputReturn {
  const [state, setState] = useState<VoiceState>("idle");
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);

  const cleanupTimers = useCallback(() => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
  }, []);

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const getOptimalMimeType = (): string => {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return "";
  };

  const stop = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    cleanupTimers();
  }, [cleanupTimers]);

  const start = useCallback(async () => {
    // Prevent starting if already recording
    if (state === "recording") return;

    // Reset state
    setError(null);
    setPermissionDenied(false);
    setDuration(0);
    chunksRef.current = [];
    audioBlobRef.current = null;
    cleanupTimers();

    // Check browser support
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError("Browser doesn't support audio recording");
      return;
    }

    try {
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
        // Create blob from chunks
        const mType = mimeType || "audio/webm";
        audioBlobRef.current = new Blob(chunksRef.current, { type: mType });

        // Cleanup
        cleanupStream();
        cleanupTimers();

        // Transition to stopped
        setState("stopped");
      };

      mediaRecorder.onerror = () => {
        setError("Recording failed");
        cleanupStream();
        cleanupTimers();
        setState("idle");
      };

      // Start recording
      mediaRecorder.start();
      setState("recording");
      startTimeRef.current = Date.now();

      // Duration timer (timestamp-based for accuracy)
      durationTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);
      }, 100);

      // Auto-stop timer
      autoStopTimerRef.current = setTimeout(() => {
        stop();
      }, MAX_RECORDING_MS);

    } catch (err) {
      cleanupStream();

      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setPermissionDenied(true);
          setError("Microphone permission denied");
        } else if (err.name === "NotFoundError") {
          setError("No microphone found");
        } else {
          setError(err.message);
        }
      } else {
        setError("Unknown error");
      }
      setState("idle");
    }
  }, [state, cleanupTimers, cleanupStream, stop]);

  const consumeAudio = useCallback((): Blob | null => {
    const blob = audioBlobRef.current;
    audioBlobRef.current = null;
    chunksRef.current = [];
    setDuration(0);
    setState("idle");
    return blob;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      cleanupStream();
      cleanupTimers();
    };
  }, [cleanupStream, cleanupTimers]);

  return {
    state,
    duration,
    error,
    permissionDenied,
    start,
    stop,
    consumeAudio,
  };
}
