"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { VoiceTextInput } from "@/components/shared/VoiceTextInput";
import { InventoryItemBadge } from "@/components/shared/InventoryItemBadge";
import { Button } from "@/components/shared/Button";
import {
  SCENE_TEXT,
  SARAH_PANTRY_STAPLES,
} from "@/lib/story-onboarding/constants";
import { hasRequiredItems } from "@/lib/story-onboarding/transforms";
import type { DemoInventoryItem } from "@/lib/story-onboarding/types";
import type { QuantityLevel } from "@/types/inventory";

interface ProcessInputResponse {
  add: Array<{ name: string; quantityLevel: QuantityLevel }>;
  rm: string[];
  transcribedText?: string;
  unrecognized?: string[];
}

interface Scene4VoiceProps {
  inventory: DemoInventoryItem[];
  onUpdateInventory: (items: DemoInventoryItem[]) => void;
  onContinue: () => void;
}

export function Scene4Voice({
  inventory,
  onUpdateInventory,
  onContinue,
}: Scene4VoiceProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInputOnce, setHasInputOnce] = useState(false);
  const [lastTranscription, setLastTranscription] = useState<string>();
  const [showHint, setShowHint] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Check if user has already added ingredients (from localStorage)
  useEffect(() => {
    const hasAddedItems = inventory.some((item) =>
      !item.isPantryStaple && item.isNew
    );
    if (hasAddedItems) {
      setHasInputOnce(true);
    }
  }, [inventory]);

  // Show hint after 5s of inactivity
  useEffect(() => {
    if (!hasInputOnce && !processing) {
      hintTimerRef.current = setTimeout(() => setShowHint(true), 5000);
      return () => clearTimeout(hintTimerRef.current);
    }
  }, [hasInputOnce, processing]);

  const canContinue = hasRequiredItems(inventory);

  const trackedItems = inventory.filter((item) => !item.isPantryStaple);

  const processInput = useCallback(
    async (
      input: { type: "voice"; audioBlob: Blob } | { type: "text"; text: string },
    ) => {
      setProcessing(true);
      setError(null);
      setShowHint(false);

      try {
        const currentIngredients = inventory
          .filter((i) => !i.isPantryStaple && i.quantityLevel > 0)
          .map((i) => i.name);

        let body: Record<string, unknown>;
        if (input.type === "voice") {
          const buffer = await input.audioBlob.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(buffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              "",
            ),
          );
          body = { audioBase64: base64, mimeType: input.audioBlob.type, currentIngredients };
        } else {
          body = { text: input.text, currentIngredients };
        }

        const response = await fetch("/api/onboarding/story/process-input", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(
            data.error || "Processing failed. Please try again.",
          );
        }

        const data: ProcessInputResponse = await response.json();
        setLastTranscription(data.transcribedText);
        setHasInputOnce(true);
        setAttemptCount((prev) => prev + 1);

        // Show toast for unrecognized ingredients
        if (data.unrecognized && data.unrecognized.length > 0) {
          const items = data.unrecognized.join(", ");
          toast.warning(`Not recognized: ${items}`, {
            description: "These ingredients weren't found in our database",
          });
        }

        // Show success toast for recognized ingredients
        if (data.add && data.add.length > 0) {
          const items = data.add.map((item) => item.name).join(", ");
          toast.success(`Added: ${items}`, {
            description: `${data.add.length} ingredient${data.add.length > 1 ? "s" : ""} added to inventory`,
          });
        }

        // Update inventory with recognized items
        const updatedInventory = [...inventory.map((item) => ({ ...item }))];

        for (const item of data.add ?? []) {
          const name = item.name;
          const quantityLevel = item.quantityLevel ?? 3; // Default to 3 if missing
          const existing = updatedInventory.find(
            (invItem) => invItem.name.toLowerCase() === name.toLowerCase(),
          );
          if (existing) {
            existing.quantityLevel = quantityLevel;
            existing.isNew = true;
          } else {
            updatedInventory.push({
              name,
              category: "non_classified",
              quantityLevel,
              isPantryStaple: false,
              isNew: true,
            });
          }
        }

        for (const name of data.rm ?? []) {
          const existing = updatedInventory.find(
            (item) => item.name.toLowerCase() === name.toLowerCase(),
          );
          if (existing) {
            existing.quantityLevel = 0;
          }
        }

        onUpdateInventory(updatedInventory);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Try again.",
        );
      } finally {
        setProcessing(false);
      }
    },
    [inventory, onUpdateInventory],
  );

  // Time/place setting is first element
  const [setting, ...dialogue] = SCENE_TEXT.scene4Intro;

  return (
    <div className="flex flex-col items-center min-h-[80vh] px-6 py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Time/place setting */}
        <p
          className="text-sm font-mono font-semibold uppercase tracking-widest text-black/50 animate-[fadeIn_0.5s_ease-in_both]"
          style={{ animationDelay: "0s" }}
        >
          {setting}
        </p>

        {/* Dialogue */}
        {dialogue.map((segment, i) => (
          <p
            key={i}
            className="text-lg font-bold leading-relaxed animate-[fadeIn_0.5s_ease-in_both]"
            style={{ animationDelay: `${(i + 1) * 0.4}s` }}
          >
            {segment}
          </p>
        ))}

        {/* Instructions */}
        <div
          className="space-y-1 animate-[fadeIn_0.5s_ease-in_both]"
          style={{ animationDelay: `${SCENE_TEXT.scene4Intro.length * 0.4}s` }}
        >
          {SCENE_TEXT.scene4Instructions.map((segment, i) => (
            <p
              key={i}
              className={
                i === 2
                  ? "text-xl font-black italic text-pink-600"
                  : "text-base font-semibold text-black/70"
              }
            >
              {segment}
            </p>
          ))}
        </div>

        {/* Voice/text input */}
        <div
          className="animate-[fadeIn_0.5s_ease-in_both]"
          style={{
            animationDelay: `${(SCENE_TEXT.scene4Intro.length + 1) * 0.4}s`,
          }}
        >
          <VoiceTextInput
            onSubmit={processInput}
            processing={processing}
            voiceLabel={hasInputOnce ? "Add more" : "Hold to record"}
            textPlaceholder='e.g. I bought parmesan, eggs, and some bananas'
            lastTranscription={lastTranscription}
          />
        </div>

        {/* Urgency banner after 3 attempts */}
        {attemptCount >= 3 && (
          <div className="bg-pink-100 border-4 border-pink-600 p-4 rounded-none animate-[fadeIn_0.5s_ease-in_both] shadow-[4px_4px_0px_0px_rgba(219,39,119,1)]">
            <p className="text-lg font-black text-pink-600 text-center">
              🍝 Hurry up, Sarah is hungry!
            </p>
          </div>
        )}

        {/* Hint after 5s inactivity */}
        {/* {showHint && !hasInputOnce && (
          <p className="text-sm text-black/40 text-center animate-[fadeIn_0.5s_ease-in_both]">
            Try saying &quot;I bought parmesan, eggs, and some bananas&quot;
          </p>
        )} */}

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 font-semibold text-center">
            {error}
          </p>
        )}

        {/* Updated inventory display */}
        {hasInputOnce && (
          <div className="space-y-2 animate-[fadeIn_0.5s_ease-in_both]">
            <h3 className="text-lg font-black">Updated Inventory</h3>
            <div className="flex flex-wrap gap-2">
              {trackedItems.map((item, i) => (
                <InventoryItemBadge
                  key={i}
                  name={item.name}
                  level={item.quantityLevel}
                  isStaple={false}
                  useWord
                  changeIndicator={
                    item.isNew ? { type: "new" } : undefined
                  }
                />
              ))}
            </div>

            {/* Staples always shown */}
            <h3 className="text-lg font-black mt-4">Staples (always available)</h3>
            <div className="flex flex-wrap gap-2">
              {SARAH_PANTRY_STAPLES.map((item, i) => (
                <InventoryItemBadge
                  key={i}
                  name={item.name}
                  level={3}
                  isStaple
                  useWord
                />
              ))}
            </div>
          </div>
        )}

        {/* Continue button — gated on required items */}
        <div className="pt-4">
          <Button
            variant="default"
            size="lg"
            className={`w-full justify-center ${!canContinue ? "opacity-40" : ""}`}
            onClick={onContinue}
            disabled={!canContinue}
          >
            {canContinue ? "Continue \u2192" : "Add eggs & parmesan to continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
