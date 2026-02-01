"use client";

import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { Battery, BatteryLow, BatteryMedium, BatteryWarning } from "lucide-react";
import React, { ButtonHTMLAttributes, useState } from "react";

type QuantityLevel = 0 | 1 | 2 | 3;

const ingredientBadgeVariants = cva(
  "inline-flex items-center gap-2 border-2 border-black font-medium transition-all duration-200 cursor-pointer select-none",
  {
    variants: {
      variant: {
        battery: "rounded-full px-4 py-2",
        dots: "rounded-lg px-3 py-2",
        fill: "rounded-md px-4 py-2 relative overflow-hidden",
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
      level: {
        0: "",
        1: "",
        2: "",
        3: "",
      },
    },
    defaultVariants: {
      variant: "battery",
      size: "md",
      level: 3,
    },
  },
);

export interface IngredientBadgeProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange">,
    VariantProps<typeof ingredientBadgeVariants> {
  name: string;
  level: QuantityLevel;
  onLevelChange?: (newLevel: QuantityLevel) => void;
  interactive?: boolean;
  variant: "battery" | "dots" | "fill";
  isStaple?: boolean;
}

// Battery Bar Variant (Option 1)
function BatteryBars({ level }: { level: QuantityLevel }) {
  const bars = [1, 2, 3];

  // Color schemes based on level
  const colorScheme = {
    0: { bg: "bg-red-400", barBorder: "border-red-600" },
    1: { bg: "bg-amber-400", barBorder: "border-amber-700" },
    2: { bg: "bg-lime-400", barBorder: "border-lime-700" },
    3: { bg: "bg-green-400", barBorder: "border-green-700" },
  }[level];

  const BatteryIcon = {
    0: BatteryWarning,
    1: BatteryLow,
    2: BatteryMedium,
    3: Battery,
  }[level];

  return (
    <>
      <BatteryIcon className="h-4 w-4" />
      <div className="flex gap-1">
        {bars.map((bar) => (
          <div
            key={bar}
            className={cn(
              "w-3 h-5 border-2 rounded-sm transition-all duration-200",
              colorScheme.barBorder,
              bar <= level ? colorScheme.bg : "bg-white"
            )}
          />
        ))}
      </div>
    </>
  );
}

// Dot Matrix Variant (Option 2)
function DotMatrix({ level, isStaple }: { level: QuantityLevel; isStaple?: boolean }) {
  const dots = [1, 2, 3];

  const stapleColorScheme = { dotBorder: "border-blue-600", dotFill: "bg-blue-600" };

  const colorScheme = isStaple ? stapleColorScheme : {
    0: { dotBorder: "border-red-600", dotFill: "bg-red-600" },
    1: { dotBorder: "border-orange-600", dotFill: "bg-orange-600" },
    2: { dotBorder: "border-yellow-600", dotFill: "bg-yellow-600" },
    3: { dotBorder: "border-green-600", dotFill: "bg-green-600" },
  }[level];

  return (
    <div className="flex gap-1">
      {dots.map((dot) => (
        <div
          key={dot}
          className={cn(
            "h-3 w-3 rounded-full border-2 transition-all duration-200",
            colorScheme.dotBorder,
            dot <= level ? colorScheme.dotFill : "bg-white"
          )}
        />
      ))}
    </div>
  );
}

// Fill Level Gauge Variant (Option 3)
function FillGauge({ level }: { level: QuantityLevel }) {
  const fillPercentage = {
    0: 0,
    1: 33,
    2: 66,
    3: 100,
  }[level];

  const colorScheme = {
    0: { border: "border-red-600", fill: "bg-red-400" },
    1: { border: "border-orange-600", fill: "bg-orange-400" },
    2: { border: "border-yellow-600", fill: "bg-yellow-400" },
    3: { border: "border-green-600", fill: "bg-green-400" },
  }[level];

  return (
    <div className="relative w-24 h-4 border-2 border-black bg-white rounded-sm overflow-hidden">
      <div
        className={cn(
          "absolute left-0 top-0 h-full transition-all duration-300 ease-out",
          colorScheme.fill
        )}
        style={{ width: `${fillPercentage}%` }}
      />
      {/* Divider lines */}
      <div className="absolute left-1/3 top-0 h-full w-0.5 bg-black/20" />
      <div className="absolute left-2/3 top-0 h-full w-0.5 bg-black/20" />
    </div>
  );
}

export const IngredientBadge = React.forwardRef<HTMLButtonElement, IngredientBadgeProps>(
  (
    {
      name,
      level,
      onLevelChange,
      interactive = true,
      variant = "battery",
      size = "md",
      isStaple = false,
      className = "",
      onClick,
      ...props
    },
    forwardedRef
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (interactive && onLevelChange) {
        const nextLevel = ((level + 1) % 4) as QuantityLevel;
        onLevelChange(nextLevel);
      }
      onClick?.(e);
    };

    // Background color based on variant and level
    const getBgColor = () => {
      if (isStaple) {
        return variant === "battery" ? "bg-blue-400" : "bg-blue-100";
      }
      if (variant === "battery") {
        return {
          0: "bg-red-400",
          1: "bg-amber-400",
          2: "bg-lime-400",
          3: "bg-green-400",
        }[level];
      }
      if (variant === "dots") {
        return {
          0: "bg-red-100",
          1: "bg-orange-100",
          2: "bg-yellow-100",
          3: "bg-green-100",
        }[level];
      }
      return "bg-white";
    };

    const ariaLabel = `${name}, ${level} ${level === 1 ? "use" : "uses"} remaining`;

    return (
      <button
        ref={forwardedRef}
        role="button"
        aria-label={ariaLabel}
        tabIndex={0}
        className={cn(
          ingredientBadgeVariants({ variant, size }),
          getBgColor(),
          interactive && "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
          interactive && "hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
          interactive && "active:shadow-none",
          interactive && "active:translate-y-1",
          interactive && "active:translate-x-0.5",
          interactive && "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black",
          !interactive && "cursor-default",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <span className="font-semibold truncate max-w-[120px]">{name}</span>

        {variant === "battery" && <BatteryBars level={level} />}
        {variant === "dots" && <DotMatrix level={level} isStaple={isStaple} />}
        {variant === "fill" && <FillGauge level={level} />}
      </button>
    );
  }
);

IngredientBadge.displayName = "IngredientBadge";
