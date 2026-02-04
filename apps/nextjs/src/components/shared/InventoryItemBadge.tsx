"use client";

import { IngredientBadge, quantityWords } from "@/components/shared/IngredientBadge";
import { SmallActionButton } from "@/components/shared/SmallActionButton";
import { QuantityLevel } from "@/types/inventory";
import { Infinity, X } from "lucide-react";

export interface InventoryItemBadgeProps {
  name: string;
  level: QuantityLevel;
  isStaple: boolean;
  onLevelChange?: (newLevel: QuantityLevel) => void;
  onToggleStaple?: () => void;
  onDismiss?: () => void;
  /** Show quantity as words instead of dots */
  useWord?: boolean;
  /** Reduce opacity to de-emphasize this item */
  dimmed?: boolean;
  /** Hide the change indicator pill */
  hideDiff?: boolean;
  /** Show change indicator pill */
  changeIndicator?: {
    type: "quantity" | "toStaple" | "fromStaple" | "new";
    previousQuantity?: number;
    proposedQuantity?: number;
  };
}

export function InventoryItemBadge({
  name,
  level,
  isStaple,
  useWord,
  onLevelChange,
  onToggleStaple,
  onDismiss,
  dimmed,
  hideDiff = false,
  changeIndicator,
}: InventoryItemBadgeProps) {
  return (
    <div className={`relative inline-flex min-w-28 transition-opacity ${dimmed ? "opacity-25" : ""}`}>
      <IngredientBadge
        name={name}
        level={level}
        variant="dots"
        size="md"
        interactive
        isStaple={isStaple}
        useWord={useWord}
        onLevelChange={isStaple ? undefined : onLevelChange}
        onClick={isStaple && onToggleStaple ? onToggleStaple : undefined}
      />

      {/* Infinity button - only show when not a staple */}
      {!isStaple && onToggleStaple && (
        <SmallActionButton
          icon={Infinity}
          variant="blue"
          onClick={(e) => {
            e.stopPropagation();
            onToggleStaple();
          }}
          title="Move to Pantry Staples"
          className="absolute -top-2 right-5"
        />
      )}

      {/* Dismiss/Delete button - always at top right */}
      {onDismiss && (
        <SmallActionButton
          icon={X}
          variant="red"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          title="Remove"
          className="absolute -top-2 -right-1"
        />
      )}

      {/* Change indicator pill - top left (flat, non-clickable) */}
      {!hideDiff && changeIndicator?.type === "quantity" && (
        <span className={`absolute -top-3 -left-1 bg-blue-400 border-2 border-black text-xs px-2 py-0.5 rounded-full font-bold ${useWord && changeIndicator.previousQuantity !== changeIndicator.proposedQuantity ? "line-through" : ""}`}>
          {useWord
            ? quantityWords[(changeIndicator.previousQuantity ?? 0) as QuantityLevel].label
            : `${changeIndicator.previousQuantity} → ${changeIndicator.proposedQuantity}`}
        </span>
      )}
      {!hideDiff && changeIndicator?.type === "toStaple" && (
        <span className={`absolute -top-3 -left-1 bg-blue-400 border-2 border-black text-xs px-2 py-0.5 rounded-full font-bold ${useWord && changeIndicator.previousQuantity !== changeIndicator.proposedQuantity ? "line-through" : ""}`}>
          {useWord
            ? quantityWords[(changeIndicator.previousQuantity ?? 0) as QuantityLevel].label
            : `${changeIndicator.previousQuantity ?? "?"} → ∞`}
        </span>
      )}
      {!hideDiff && changeIndicator?.type === "fromStaple" && (
        <span className={`absolute -top-3 -left-1 bg-yellow-400 border-2 border-black text-xs px-2 py-0.5 rounded-full font-bold ${useWord ? "line-through" : ""}`}>
          {useWord
            ? "ALWAYS"
            : `∞ → ${changeIndicator.proposedQuantity ?? 3}`}
        </span>
      )}
      {!hideDiff && changeIndicator?.type === "new" && (
        <span className="absolute -top-3 -left-1 bg-blue-400 border-2 border-black text-xs px-2 py-0.5 rounded-full font-bold">
          NEW
        </span>
      )}
    </div>
  );
}
