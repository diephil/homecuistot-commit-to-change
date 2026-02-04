"use client";

import { ArrowLeft } from "lucide-react";

const TOTAL_SCENES = 7;

interface StoryProgressBarProps {
  currentScene: number;
  onBack?: () => void;
}

export function StoryProgressBar({ currentScene, onBack }: StoryProgressBarProps) {
  return (
    <div className="sticky top-0 z-10 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-b-2 border-black/10 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center gap-3">
        {/* Back button */}
        <button
          onClick={onBack}
          disabled={!onBack}
          className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full border-2 border-black transition-all ${
            onBack
              ? "bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
              : "opacity-0 pointer-events-none"
          }`}
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Progress segments */}
        <div className="flex-1 flex gap-1.5">
          {Array.from({ length: TOTAL_SCENES }, (_, i) => {
            const sceneNum = i + 1;
            const isComplete = sceneNum < currentScene;
            const isCurrent = sceneNum === currentScene;

            return (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full border border-black/20 transition-all duration-300 ${
                  isComplete
                    ? "bg-green-400"
                    : isCurrent
                      ? "bg-yellow-400"
                      : "bg-black/5"
                }`}
              />
            );
          })}
        </div>

        {/* Scene counter */}
        <span className="shrink-0 text-xs font-black tabular-nums">
          {currentScene}/{TOTAL_SCENES}
        </span>
      </div>
    </div>
  );
}
