import { useState, useRef, useCallback } from 'react';

/**
 * T004: useVoiceInput hook for voice capture with MediaRecorder API
 * Spec: specs/004-onboarding-flow/research.md lines 124-243
 */

interface UseVoiceInputReturn {
  isRecording: boolean;
  recordingDuration: number;
  audioBlob: Blob | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
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

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setPermissionDenied(false);
      setAudioBlob(null);
      chunksRef.current = [];

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
          type: mimeType || 'audio/webm',
        });
        setAudioBlob(blob);
        setIsRecording(false);

        // Cleanup stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        // Clear timers
        if (durationTimerRef.current) {
          clearInterval(durationTimerRef.current);
          durationTimerRef.current = null;
        }
        if (autoStopTimerRef.current) {
          clearTimeout(autoStopTimerRef.current);
          autoStopTimerRef.current = null;
        }
        setRecordingDuration(0);
      };

      mediaRecorder.onerror = (event: Event) => {
        const errorEvent = event as ErrorEvent;
        console.error('MediaRecorder error:', errorEvent.error);
        setError(new Error('Recording failed'));
        stopRecording();
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start duration timer
      durationTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      // Auto-stop after 60 seconds
      autoStopTimerRef.current = setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 60 * 1000);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setPermissionDenied(true);
          setError(new Error('Microphone permission denied'));
        } else if (err.name === 'NotFoundError') {
          setError(new Error('No microphone found'));
        } else {
          setError(err);
        }
      } else {
        setError(new Error('Unknown error occurred'));
      }
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return {
    isRecording,
    recordingDuration,
    audioBlob,
    startRecording,
    stopRecording,
    error,
    permissionDenied,
  };
}
