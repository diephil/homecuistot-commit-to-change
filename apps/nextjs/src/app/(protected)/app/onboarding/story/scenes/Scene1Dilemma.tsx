"use client";

import { Button } from "@/components/shared/Button";
import { SCENE_TEXT } from "@/lib/story-onboarding/constants";

interface Scene1DilemmaProps {
  onContinue: () => void;
}

export function Scene1Dilemma({ onContinue }: Scene1DilemmaProps) {
  // First segment is the time/place setting
  const [setting, ...narrative] = SCENE_TEXT.scene1;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Time/place setting — distinct styling */}
        <p
          className="text-sm font-mono font-semibold uppercase tracking-widest text-black/50 animate-[fadeIn_0.5s_ease-in_both]"
          style={{ animationDelay: "0s" }}
        >
          {setting}
        </p>

        {/* Narrative segments */}
        {narrative.map((segment, i) => (
          <p
            key={i}
            className="text-lg font-bold leading-relaxed animate-[fadeIn_0.5s_ease-in_both]"
            style={{ animationDelay: `${(i + 1) * 0.4}s` }}
          >
            {segment}
          </p>
        ))}

        <div
          className="pt-4 animate-[fadeIn_0.5s_ease-in_both]"
          style={{ animationDelay: `${SCENE_TEXT.scene1.length * 0.4}s` }}
        >
          <Button
            variant="default"
            size="lg"
            className="w-full justify-center"
            onClick={onContinue}
          >
            Continue →
          </Button>
        </div>
      </div>
    </div>
  );
}
