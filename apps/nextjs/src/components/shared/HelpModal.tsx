"use client";

import { Card } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { X } from "lucide-react";
import { ReactNode } from "react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function HelpModal({ isOpen, onClose, title, children }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-4">
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b-4 border-black">
            <h2 className="text-3xl font-bold">{title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-5">
            {children}
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t-4 border-black">
            <Button
              variant="default"
              onClick={onClose}
              className="bg-black text-white hover:bg-gray-800 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
              size="lg"
            >
              Got it!
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface HelpSectionProps {
  emoji: string;
  title: string;
  bgColor: string;
  children: ReactNode;
}

export function HelpSection({ emoji, title, bgColor, children }: HelpSectionProps) {
  return (
    <section className={`p-4 ${bgColor} border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
      <h3 className="text-xl font-black mb-3 flex items-center gap-2">
        <span className="text-2xl">{emoji}</span> {title}
      </h3>
      {children}
    </section>
  );
}

interface HelpExampleListProps {
  examples: string[];
  bulletColor?: string;
}

export function HelpExampleList({ examples, bulletColor = "text-blue-600" }: HelpExampleListProps) {
  return (
    <ul className="space-y-1.5 text-sm font-medium pl-4">
      {examples.map((example, index) => (
        <li key={index} className={`before:content-['•'] before:mr-2 ${bulletColor} before:font-black`}>
          &ldquo;{example}&rdquo;
        </li>
      ))}
    </ul>
  );
}
