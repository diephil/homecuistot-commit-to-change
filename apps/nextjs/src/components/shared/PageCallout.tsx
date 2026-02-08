"use client";

import { X } from "lucide-react";

interface PageCalloutProps {
  emoji: string;
  title: string;
  description: string;
  bgColor?: "cyan" | "pink" | "yellow" | "orange";
  /** Optional YouTube video ID for video CTA */
  videoId?: string;
  /** Optional callback when video CTA clicked */
  onOpenVideo?: () => void;
  /** Optional callback when dismiss button clicked */
  onDismiss?: () => void;
  /** Whether to show dismiss button (default: true if onDismiss provided) */
  showDismiss?: boolean;
}

export function PageCallout({
  emoji,
  title,
  description,
  bgColor = "cyan",
  videoId,
  onOpenVideo,
  onDismiss,
  showDismiss = !!onDismiss,
}: PageCalloutProps) {
  const bgColorClass = {
    cyan: "bg-cyan-50",
    pink: "bg-pink-50",
    yellow: "bg-yellow-50",
    orange: "bg-orange-50",
  }[bgColor];

  const hasVideo = videoId && onOpenVideo;

  return (
    <div
      className={`relative ${bgColorClass} border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
    >
      {/* Dismiss button - crystal clear, top-right */}
      {showDismiss && onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 md:top-4 md:right-4 bg-orange-500 hover:bg-orange-600 border-4 border-black px-3 py-2 md:px-4 md:py-2 font-black uppercase text-xs md:text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-1 md:gap-2"
          aria-label="Dismiss video tutorial"
        >
          <X className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Dismiss</span>
        </button>
      )}

      {/* Content with extra padding on right if dismiss button present */}
      <div className={showDismiss && onDismiss ? "pr-20 md:pr-24" : ""}>
        <p className="text-base font-semibold text-black/80">
          {emoji} {title}
        </p>
        <div className="mt-1">
          <p className="text-sm text-black/60">{description}</p>
          {/* Video CTA button */}
          {hasVideo && (
            <button
              onClick={onOpenVideo}
              className="text-sm font-bold text-black/80 underline hover:text-black mt-2 inline-flex items-center gap-1"
            >
              Watch how to use the microphone →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
