"use client";

import { cn } from "@/lib/utils";

interface LastHeardDisplayProps {
  transcription: string;
  className?: string;
}

/**
 * Displays the last transcribed voice input
 * Used in VoiceTextInput and ProposalConfirmationModal
 */
export function LastHeardDisplay({
  transcription,
  className,
}: LastHeardDisplayProps) {
  return (
    <div
      className={cn(
        "px-4 py-3 bg-gray-100 border-2 border-black rounded text-center",
        className
      )}
    >
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
        Last heard
      </p>
      <p className="text-sm text-gray-800 italic">
        &ldquo;{transcription}&rdquo;
      </p>
    </div>
  );
}
