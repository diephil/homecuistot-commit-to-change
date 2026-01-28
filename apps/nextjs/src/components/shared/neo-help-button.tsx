"use client";

import { useState, ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NeoHelpButtonProps {
  className?: string;
  renderModal: (params: { isOpen: boolean; onClose: () => void }) => ReactNode;
}

export function NeoHelpButton(props: NeoHelpButtonProps) {
  const { className, renderModal } = props;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          // Neo-brutalism base
          "border-4 border-black bg-yellow-300",
          // Size & spacing
          "p-3",
          // Shadow & hover effects
          "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          "hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
          "active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
          // Movement
          "transition-all duration-150",
          "hover:translate-x-[-2px] hover:translate-y-[-2px]",
          "active:translate-x-[2px] active:translate-y-[2px]",
          // Interactive
          "cursor-pointer",
          "hover:bg-yellow-400",
          className
        )}
        aria-label="Open help"
      >
        <HelpCircle className="h-6 w-6 stroke-[3px]" />
      </button>

      {renderModal({ isOpen, onClose: () => setIsOpen(false) })}
    </>
  );
}
