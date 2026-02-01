"use client";

import { useState } from "react";
import { Button } from "@/components/retroui/Button";
import { IngredientBadge } from "@/components/retroui/IngredientBadge";
import { SmallActionButton } from "@/components/retroui/SmallActionButton";
import { Alert } from "@/components/retroui/Alert";
import { X } from "lucide-react";
import { FormModal } from "@/components/shared/form-modal";
import { QuickInputSection } from "@/components/shared/quick-input-section";
import { LoadingState } from "@/components/shared/loading-state";
import {
  InventoryDisplayItem,
  InventoryUpdateProposal,
  ModalStage,
  InputMode,
  InventoryUpdateExtraction,
  QuantityLevel,
} from "@/types/inventory";
import { toast } from "sonner";

interface InventoryUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdatesApplied: () => void;
  existingInventory: InventoryDisplayItem[];
}

export function InventoryUpdateModal({
  isOpen,
  onClose,
  onUpdatesApplied,
  existingInventory,
}: InventoryUpdateModalProps) {
  const [stage, setStage] = useState<ModalStage>("input");
  const [inputMode, setInputMode] = useState<InputMode>("voice");
  const [textInput, setTextInput] = useState("");
  const [proposal, setProposal] = useState<InventoryUpdateProposal | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setStage("input");
    setInputMode("voice");
    setTextInput("");
    setProposal(null);
    setIsSaving(false);
    onClose();
  };

  // Voice recording complete
  const handleVoiceRecordingComplete = async (audioBlob: Blob) => {
    setStage("processing");

    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      const audioBase64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1];
          resolve(base64);
        };
      });

      // Process voice
      const response = await fetch("/api/inventory/process-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64 }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || "Failed to process voice");
      }

      const extraction: InventoryUpdateExtraction = await response.json();
      await validateAndCreateProposal(extraction);
    } catch (error) {
      console.error("Voice processing error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to process voice");
      setStage("input");
    }
  };

  // Text submission
  const handleTextSubmit = async () => {
    if (!textInput.trim()) {
      toast.error("Please enter some text");
      return;
    }

    setStage("processing");

    try {
      const response = await fetch("/api/inventory/process-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textInput }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || "Failed to process text");
      }

      const extraction: InventoryUpdateExtraction = await response.json();
      await validateAndCreateProposal(extraction);
    } catch (error) {
      console.error("Text processing error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to process text");
      setStage("input");
    }
  };

  // Validate and create proposal
  const validateAndCreateProposal = async (extraction: InventoryUpdateExtraction) => {
    try {
      // Validate ingredient names
      const response = await fetch("/api/inventory/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredientNames: extraction.updates.map((u) => u.ingredientName),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to validate ingredients");
      }

      const validation = await response.json();

      // Build proposal with previous quantities
      const recognized = validation.recognized.map((r: {
        inputName: string;
        matchedName: string;
        ingredientId: string;
      }) => {
        const update = extraction.updates.find(
          (u) => u.ingredientName.toLowerCase() === r.inputName.toLowerCase()
        )!;
        const existing = existingInventory.find(
          (item) => item.ingredientId === r.ingredientId
        );

        return {
          ingredientId: r.ingredientId,
          ingredientName: r.matchedName,
          previousQuantity: existing?.quantityLevel ?? null,
          proposedQuantity: update.quantityLevel,
        };
      });

      setProposal({
        recognized,
        unrecognized: validation.unrecognized,
      });
      setStage("confirmation");
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Failed to validate ingredients");
      setStage("input");
    }
  };

  // Confirm and save
  const handleConfirm = async () => {
    if (!proposal || proposal.recognized.length === 0) return;

    setIsSaving(true);

    try {
      const response = await fetch("/api/inventory/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: proposal.recognized.map((r) => ({
            ingredientId: r.ingredientId,
            quantityLevel: r.proposedQuantity,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save updates");
      }

      toast.success(`Updated ${proposal.recognized.length} ingredient(s)`);
      handleClose();
      onUpdatesApplied();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save updates");
    } finally {
      setIsSaving(false);
    }
  };

  // Dismiss a detected ingredient
  const handleDismissIngredient = (index: number) => {
    if (!proposal) return;
    setProposal({
      ...proposal,
      recognized: proposal.recognized.filter((_, i) => i !== index),
    });
  };

  return (
    <FormModal isOpen={isOpen} onClose={handleClose} title="Update Inventory">
      {/* Input Stage */}
      {stage === "input" && (
        <QuickInputSection
          inputMode={inputMode}
          textValue={textInput}
          onInputModeChange={setInputMode}
          onTextChange={setTextInput}
          onTextSubmit={handleTextSubmit}
          onVoiceComplete={handleVoiceRecordingComplete}
          textPlaceholder="e.g., I just bought milk and eggs, running low on tomatoes"
          submitButtonText="Process"
          multiline={true}
          showVoiceGuidance={true}
        />
      )}

      {/* Processing Stage */}
      {stage === "processing" && <LoadingState message="Processing..." />}

      {/* Confirmation Stage */}
      {stage === "confirmation" && proposal && (
        <div className="space-y-6">
          {/* Detected Ingredients */}
          {proposal.recognized.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-bold uppercase tracking-wide">
                Detected Ingredients ({proposal.recognized.length})
              </p>
              <p className="text-xs text-gray-600">
                Tap badges to adjust quantity before saving
              </p>
              <div className="flex flex-wrap gap-3">
                {proposal.recognized.map((item, index) => (
                  <div key={index} className="relative inline-flex">
                    <IngredientBadge
                      name={item.ingredientName}
                      level={item.proposedQuantity as QuantityLevel}
                      variant="dots"
                      size="md"
                      interactive={true}
                      onLevelChange={(newLevel) => {
                        setProposal({
                          ...proposal,
                          recognized: proposal.recognized.map((r, i) =>
                            i === index ? { ...r, proposedQuantity: newLevel } : r
                          ),
                        });
                      }}
                    />
                    <SmallActionButton
                      icon={X}
                      variant="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismissIngredient(index);
                      }}
                      title="Dismiss ingredient"
                      className="absolute -top-1 -right-1"
                    />
                    {item.previousQuantity !== null && item.previousQuantity !== item.proposedQuantity && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-400 border-2 border-black text-xs px-2 py-0.5 rounded-full font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {item.previousQuantity} → {item.proposedQuantity}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unrecognized Warning */}
          {proposal.unrecognized.length > 0 && (
            <Alert status="warning">
              <div className="space-y-1">
                <p className="font-semibold">Couldn&apos;t recognize:</p>
                <p className="text-sm">{proposal.unrecognized.join(", ")}</p>
                <p className="text-sm">These items will be skipped.</p>
              </div>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="default"
              onClick={handleConfirm}
              disabled={isSaving || proposal.recognized.length === 0}
              className="flex-1 bg-black hover:bg-gray-800 text-white border-black"
              size="lg"
            >
              {isSaving ? "Saving..." : `Save ${proposal.recognized.length} Update(s)`}
            </Button>
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={isSaving}
              size="lg"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </FormModal>
  );
}
