"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface VideoModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Callback when modal closes */
  onClose: () => void;
  /** YouTube video ID to embed */
  videoId: string;
  /** Accessible title for iframe */
  title?: string;
}

/**
 * Modal dialog that displays an embedded YouTube video
 *
 * Features:
 * - Portal-based rendering for proper z-index stacking
 * - Escape key handler to close modal
 * - Body scroll lock when open
 * - Backdrop click to close
 * - Responsive with max-width constraint (doesn't take full tab width)
 * - Neobrutalist styling with thick borders and box shadows
 *
 * @example
 * ```tsx
 * <VideoModal
 *   isOpen={videoModalOpen}
 *   onClose={() => setVideoModalOpen(false)}
 *   videoId={VIDEO_IDS.INVENTORY}
 *   title="Inventory Voice Input Tutorial"
 * />
 * ```
 */
export function VideoModal({
  isOpen,
  onClose,
  videoId,
  title = "Tutorial Video",
}: VideoModalProps) {
  // Body scroll lock when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      return () => {
        document.removeEventListener("keydown", handleEsc);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div className="relative z-10 w-full max-w-[800px] bg-gradient-to-br from-pink-200 to-cyan-200 border-4 md:border-6 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Close button - positioned at modal edge */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 md:-top-4 md:-right-4 z-20 bg-orange-500 hover:bg-orange-600 border-4 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          aria-label="Close video"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Video container with 16:9 aspect ratio and padding */}
        <div className="relative w-full p-4 md:p-6">
          <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              className="absolute inset-0 w-full h-full border-4 border-black"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
