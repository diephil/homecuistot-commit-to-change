"use client";

import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type SmallActionButtonVariant = "red" | "yellow" | "blue" | "gray";

interface SmallActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  variant?: SmallActionButtonVariant;
}

const variantStyles: Record<SmallActionButtonVariant, string> = {
  red: "bg-red-300 text-red-700",
  yellow: "bg-yellow-300 text-yellow-700",
  blue: "bg-blue-300 text-blue-700",
  gray: "bg-gray-300 text-gray-700",
};

export const SmallActionButton = forwardRef<HTMLButtonElement, SmallActionButtonProps>(
  ({ icon: Icon, variant = "gray", className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "h-5 w-5 rounded-full border border-black flex items-center justify-center transition-all cursor-pointer",
          "shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
          "hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
          "active:shadow-none active:translate-x-0.5 active:translate-y-0.5",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        <Icon className="h-3 w-3" />
      </button>
    );
  }
);

SmallActionButton.displayName = "SmallActionButton";
