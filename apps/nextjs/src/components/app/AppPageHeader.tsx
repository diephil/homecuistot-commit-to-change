"use client";

import { NeoHelpButton } from "@/components/shared/NeoHelpButton";
import { AppHelpModal } from "./HelpModal";

export function AppPageHeader() {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold">What Can I Cook?</h1>
      <NeoHelpButton
        renderModal={({ isOpen, onClose }) => (
          <AppHelpModal isOpen={isOpen} onClose={onClose} />
        )}
      />
    </div>
  );
}
