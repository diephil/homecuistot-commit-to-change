"use client";

import { Button } from "@/components/retroui/Button";
import { Alert } from "@/components/retroui/Alert";
import { InventoryUpdateProposal, InventoryDisplayItem } from "@/types/inventory";

interface UpdateConfirmationProps {
  proposal: InventoryUpdateProposal;
  existingInventory: InventoryDisplayItem[]; // eslint-disable-line @typescript-eslint/no-unused-vars
  onConfirm: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function UpdateConfirmation({
  proposal,
  onConfirm,
  onCancel,
  isSaving,
}: UpdateConfirmationProps) {
  const getQuantityLabel = (level: number) => {
    const labels = {
      0: "Need to buy",
      1: "1 recipe",
      2: "2 recipes",
      3: "3+ recipes",
    };
    return labels[level as keyof typeof labels] || "Unknown";
  };

  const getDotColor = (level: number) => {
    const colors = {
      0: "bg-red-600",
      1: "bg-orange-600",
      2: "bg-yellow-600",
      3: "bg-green-600",
    };
    return colors[level as keyof typeof colors] || "bg-gray-600";
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Review Changes</h3>

      {/* Recognized Updates */}
      {proposal.recognized.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            {proposal.recognized.length} ingredient(s) to update:
          </p>
          <div className="space-y-2">
            {proposal.recognized.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex-1">
                  <p className="font-semibold">{item.ingredientName}</p>
                  {item.previousQuantity !== null ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <div
                          className={`h-3 w-3 rounded-full ${getDotColor(item.previousQuantity)}`}
                        />
                        <span>{getQuantityLabel(item.previousQuantity)}</span>
                      </div>
                      <span>→</span>
                      <div className="flex items-center gap-1">
                        <div
                          className={`h-3 w-3 rounded-full ${getDotColor(item.proposedQuantity)}`}
                        />
                        <span>{getQuantityLabel(item.proposedQuantity)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      <span className="text-green-600 font-semibold">(new)</span> →{" "}
                      {getQuantityLabel(item.proposedQuantity)}
                    </p>
                  )}
                </div>
                {item.confidence === "low" && (
                  <span className="text-xs px-2 py-1 bg-yellow-200 border border-yellow-600 rounded">
                    Low confidence
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unrecognized Items Warning */}
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
      <div className="flex gap-3 pt-4 border-t-2 border-black">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={isSaving}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          variant="default"
          onClick={onConfirm}
          disabled={isSaving || proposal.recognized.length === 0}
          className="flex-1"
        >
          {isSaving ? "Saving..." : `Save ${proposal.recognized.length} Update(s)`}
        </Button>
      </div>
    </div>
  );
}
