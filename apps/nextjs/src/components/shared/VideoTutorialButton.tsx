"use client";

import { PlayCircle } from "lucide-react";

interface VideoTutorialButtonProps {
  /** YouTube video ID */
  videoId: string;
  /** Page context for analytics/styling */
  pageContext: "inventory" | "recipes";
  /** Callback when button clicked */
  onOpen: () => void;
  /** Additional Tailwind classes */
  className?: string;
}

/**
 * Persistent button that always remains visible for accessing video tutorial
 *
 * Features:
 * - Always visible regardless of dismissal state
 * - Left-aligned positioning below page title
 * - PlayCircle icon for clear video intent
 * - Neobrutalist styling with thick borders and shadows
 * - Responsive touch targets (44x44px minimum on mobile)
 *
 * @example
 * ```tsx
 * <VideoTutorialButton
 *   videoId={VIDEO_IDS.INVENTORY}
 *   pageContext="inventory"
 *   onOpen={() => setVideoModalOpen(true)}
 * />
 * ```
 */
export function VideoTutorialButton({
  videoId,
  pageContext,
  onOpen,
  className = "",
}: VideoTutorialButtonProps) {
  return (
    <button
      onClick={onOpen}
      className={`inline-flex items-center gap-2 bg-cyan-400 hover:bg-cyan-500 border-4 border-black px-4 py-2 md:px-6 md:py-3 font-black uppercase text-sm md:text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${className}`}
      aria-label={`Watch ${pageContext} tutorial video`}
    >
      <PlayCircle className="w-5 h-5 md:w-6 md:h-6" />
      <span>Watch Tutorial</span>
    </button>
  );
}
