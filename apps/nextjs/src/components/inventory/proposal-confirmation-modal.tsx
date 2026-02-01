"use client";

import { useState } from "react";
import { Button } from "@/components/retroui/Button";
import { IngredientBadge } from "@/components/retroui/IngredientBadge";
import { SmallActionButton } from "@/components/retroui/SmallActionButton";
import { Alert } from "@/components/retroui/Alert";
import { X } from "lucide-react";
import { FormModal } from "@/components/shared/form-modal";
import { InventoryUpdateProposal, QuantityLevel } from "@/types/inventory";
import { toast } from "sonner";

interface ProposalConfirmationModalProps {
  isOpen: boolean;
  proposal: InventoryUpdateProposal;
  onClose: () => void;
  onUpdatesApplied: () => void;
}

export function ProposalConfirmationModal({
  isOpen,
  proposal: initialProposal,
  onClose,
  onUpdatesApplied,
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

  return (
    <FormModal isOpen={isOpen} onClose={handleClose} title="Confirm Updates">
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
            <div className="flex flex-wrap gap-3 pt-4">
              {proposal.recognized.map((item, index) => (
                <div key={index} className="relative inline-flex min-w-28">
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
