"use client";

import { Card } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { ReactNode } from "react";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function FormModal({ isOpen, onClose, title, children }: FormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-4">
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-black">
            <h2 className="text-3xl font-bold">{title}</h2>
            <Button variant="ghost" onClick={onClose} size="icon">
              <span className="text-2xl">✕</span>
            </Button>
          </div>

          {/* Content */}
          {children}
        </div>
      </Card>
    </div>
  );
}
