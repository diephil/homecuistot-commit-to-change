"use client";

import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  ingredientName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmationModal({
  isOpen,
  ingredientName,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-4">
        <div className="p-6 space-y-6">
          {/* Header with warning icon */}
          <div className="flex items-center gap-3 pb-4 border-b-4 border-black">
            <div className="h-12 w-12 rounded-full bg-red-100 border-2 border-black flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Delete Ingredient</h2>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <p className="text-base font-medium">
              Are you sure you want to delete{" "}
              <span className="font-bold text-black">{ingredientName}</span> from your
              inventory?
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={onCancel}
              className="flex-1"
              size="lg"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={onConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white border-black"
              size="lg"
            >
              Delete
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
