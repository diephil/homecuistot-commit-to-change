"use client";

import { cn } from "@/lib/utils";

/**
 * T005: IngredientChip - Shared component for ingredient display
 * Spec: specs/019-onboarding-revamp/contracts/components.md
 *
 * Used in:
 * - Step 2: Selectable mode for common ingredients multi-select
 * - Step 3: Read-only mode for displaying step 2 selections
 * - Future: Inventory page, recipe ingredients
 */

interface IngredientChipProps {
  name: string;
  selected?: boolean;
  readOnly?: boolean;
  variant?: "default" | "voice";
  selectionColor?: "green" | "blue";
  onToggle?: () => void;
  className?: string;
}

export function IngredientChip({
  name,
  selected = false,
  readOnly = false,
  variant = "default",
  selectionColor = "green",
  onToggle,
  className,
}: IngredientChipProps) {
  const isSelectable = !readOnly && onToggle;

  const handleClick = () => {
    if (isSelectable) {
      onToggle();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isSelectable && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onToggle();
    }
  };

  // Visual states per spec
  const baseStyles =
    "inline-flex items-center px-3 py-2 rounded font-bold text-sm transition-all capitalize";

  const selectedBgColor = selected
    ? selectionColor === "blue"
      ? "bg-blue-400"
      : "bg-green-400"
    : "bg-white";

  // Apply voice variant styling even when selectable
  const voiceVariantBg = variant === "voice" && selected ? "bg-cyan-300" : selectedBgColor;

  const selectableStyles = cn(
    // Default (unselected)
    "border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    voiceVariantBg,
    // Hover effect (selectable only)
    "hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]",
    "cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
  );

  const readOnlyStyles = cn(
    variant === "voice"
      ? "bg-cyan-200 border-2 border-cyan-500 opacity-90 cursor-default" // Voice-added: cyan
      : "bg-gray-200 border-2 border-gray-400 opacity-75 cursor-default" // Default: gray
  );

  return (
    <span
      className={cn(
        baseStyles,
        readOnly ? readOnlyStyles : selectableStyles,
        className
      )}
      role={isSelectable ? "button" : undefined}
      aria-pressed={isSelectable ? selected : undefined}
      tabIndex={isSelectable ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {name}
    </span>
  );
}
