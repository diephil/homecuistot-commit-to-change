"use client";

import { Button } from "@/components/shared/Button";
import { Card } from "@/components/shared/Card";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  itemName: string;
  itemType: "ingredient" | "recipe";
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  itemName,
  itemType,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  const typeLabel = itemType === "ingredient" ? "Ingredient" : "Recipe";
  const contextText =
    itemType === "ingredient"
      ? "from your inventory"
      : "from your recipes";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-4">
        <div className="p-6 space-y-6">
          {/* Header with warning icon */}
          <div className="flex items-center gap-3 pb-4 border-b-4 border-black">
            <div className="h-12 w-12 rounded-full bg-yellow-100 border-2 border-black flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Delete {typeLabel}</h2>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <p className="text-base font-medium">
              Delete <span className="font-bold text-black">{itemName}</span> {contextText}?
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={onCancel}
              className="flex-1"
              size="lg"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={onConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white border-black"
              size="lg"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
