"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { Alert } from "@/components/shared/Alert";
import { FormModal } from "@/components/shared/FormModal";
import { LastHeardDisplay } from "@/components/shared/LastHeardDisplay";
import { InventoryItemBadge } from "@/components/shared/InventoryItemBadge";
import { InventoryUpdateProposal, QuantityLevel } from "@/types/inventory";
import { toast } from "sonner";

interface ProposalConfirmationModalProps {
  isOpen: boolean;
  proposal: InventoryUpdateProposal;
  onClose: () => void;
  onUpdatesApplied: () => void;
  /** Transcription from voice input to display above detected ingredients */
  transcription?: string;
}

export function ProposalConfirmationModal({
  isOpen,
  proposal: initialProposal,
  onClose,
  onUpdatesApplied,
  transcription,
}: ProposalConfirmationModalProps) {
  const [proposal, setProposal] = useState(initialProposal);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsSaving(false);
    onClose();
  };

  const handleConfirm = async () => {
    if (proposal.recognized.length === 0) return;

    setIsSaving(true);

    try {
      const response = await fetch("/api/inventory/apply-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposal }),
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

  const handleDismissIngredient = (index: number) => {
    setProposal({
      ...proposal,
      recognized: proposal.recognized.filter((_, i) => i !== index),
    });
  };

  const handleToggleStaple = (index: number) => {
    setProposal({
      ...proposal,
      recognized: proposal.recognized.map((r, i) => {
        if (i !== index) return r;
        // Toggle: false/undefined → true, true → false
        const isCurrentlyStaple = r.proposedPantryStaple === true;
        return { ...r, proposedPantryStaple: !isCurrentlyStaple };
      }),
    });
  };

  const handleLevelChange = (index: number, newLevel: QuantityLevel) => {
    setProposal({
      ...proposal,
      recognized: proposal.recognized.map((r, i) =>
        i === index ? { ...r, proposedQuantity: newLevel } : r
      ),
    });
  };

  return (
    <FormModal isOpen={isOpen} onClose={handleClose} title="Confirm Updates">
      <div className="space-y-6">
        {/* Transcription display */}
        {transcription && <LastHeardDisplay transcription={transcription} />}

        {/* Detected Ingredients */}
        {proposal.recognized.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-bold uppercase tracking-wide">
              Detected Ingredients ({proposal.recognized.length})
            </p>
            <p className="text-xs text-gray-600">
              Tap badges to adjust quantity. Use ∞ to toggle pantry staple.
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              {proposal.recognized.map((item, index) => {
                const isStaple = item.proposedPantryStaple === true;
                const wasStaple = item.previousPantryStaple === true;
                const isAddingToStaples = isStaple && !wasStaple;
                const isRemovingFromStaples = !isStaple && wasStaple;
                const hasQuantityChange =
                  item.previousQuantity !== null &&
                  item.previousQuantity !== item.proposedQuantity &&
                  !isAddingToStaples;

                // Determine change indicator
                let changeIndicator: {
                  type: "quantity" | "toStaple" | "fromStaple";
                  previousQuantity?: number;
                  proposedQuantity?: number;
                } | undefined;

                if (isAddingToStaples) {
                  changeIndicator = {
                    type: "toStaple",
                    previousQuantity: item.previousQuantity ?? item.proposedQuantity,
                  };
                } else if (isRemovingFromStaples) {
                  changeIndicator = {
                    type: "fromStaple",
                    proposedQuantity: item.proposedQuantity,
                  };
                } else if (hasQuantityChange) {
                  changeIndicator = {
                    type: "quantity",
                    previousQuantity: item.previousQuantity!,
                    proposedQuantity: item.proposedQuantity,
                  };
                }

                return (
                  <InventoryItemBadge
                    key={index}
                    name={item.ingredientName}
                    level={item.proposedQuantity as QuantityLevel}
                    isStaple={isStaple}
                    onLevelChange={(newLevel) => handleLevelChange(index, newLevel)}
                    onToggleStaple={() => handleToggleStaple(index)}
                    onDismiss={() => handleDismissIngredient(index)}
                    changeIndicator={changeIndicator}
                  />
                );
              })}
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

        {/* Empty state */}
        {proposal.recognized.length === 0 && proposal.unrecognized.length === 0 && (
          <p className="text-center text-gray-500 py-4">No updates to confirm</p>
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
    </FormModal>
  );
}
