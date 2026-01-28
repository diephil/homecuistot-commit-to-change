"use client";

import { useState } from "react";
import { Button } from "@/components/retroui/Button";
import { HelpCircle } from "lucide-react";
import { AppHelpModal } from "./help-modal";

export function AppPageHeader() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">What Can I Cook?</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsHelpOpen(true)}
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>

      <AppHelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
}
