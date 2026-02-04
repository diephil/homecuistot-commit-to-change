"use client";

import { Button } from "@/components/shared/Button";
import { SCENE_TEXT } from "@/lib/story-onboarding/constants";

interface Scene3StoreProps {
  onContinue: () => void;
}

export function Scene3Store({ onContinue }: Scene3StoreProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 py-8">
      <div className="max-w-md w-full space-y-6">
        {SCENE_TEXT.scene3.map((segment, i) => (
          <p
            key={i}
            className="text-lg font-bold leading-relaxed opacity-0 animate-[fadeIn_0.5s_ease-in_forwards]"
            style={{ animationDelay: `${i * 0.4}s` }}
          >
            {segment}
          </p>
        ))}

        <div
          className="pt-4 opacity-0 animate-[fadeIn_0.5s_ease-in_forwards]"
          style={{ animationDelay: `${SCENE_TEXT.scene3.length * 0.4}s` }}
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
