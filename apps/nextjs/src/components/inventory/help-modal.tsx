"use client";

import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { IngredientBadge } from "@/components/retroui/IngredientBadge";
import { QuantityLevel } from "@/types/inventory";
import { X } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-4">
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b-4 border-black">
            <h2 className="text-3xl font-bold">How to Use Inventory</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="space-y-5">
            {/* Quantity Badges Section */}
            <section className="p-4 bg-purple-100 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-xl font-black mb-3 flex items-center gap-2">
                <span className="text-2xl">📊</span> Quantity Badges
              </h3>
              <p className="text-sm font-medium mb-3">
                Each ingredient shows colored dots representing quantity:
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded">
                  <IngredientBadge
                    name="pasta"
                    level={0 as QuantityLevel}
                    variant="dots"
                    size="md"
                    interactive={false}
                  />
                  <span className="text-sm font-black text-red-600">= Out of stock (0 dots)</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded">
                  <IngredientBadge
                    name="pasta"
                    level={1 as QuantityLevel}
                    variant="dots"
                    size="md"
                    interactive={false}
                  />
                  <span className="text-sm font-black text-orange-600">= Running low (1 dot)</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded">
                  <IngredientBadge
                    name="pasta"
                    level={2 as QuantityLevel}
                    variant="dots"
                    size="md"
                    interactive={false}
                  />
                  <span className="text-sm font-black text-yellow-600">= Medium supply (2 dots)</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded">
                  <IngredientBadge
                    name="pasta"
                    level={3 as QuantityLevel}
                    variant="dots"
                    size="md"
                    interactive={false}
                  />
                  <span className="text-sm font-black text-green-600">= Full stock (3 dots)</span>
                </div>
              </div>
            </section>

            {/* Pantry Staples Section */}
            <section className="p-4 bg-yellow-100 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-xl font-black mb-3 flex items-center gap-2">
                <span className="text-2xl">🏪</span> Pantry Staples
              </h3>
              <p className="text-sm font-medium">
                Items marked as pantry staples are always considered available for recipe matching,
                regardless of quantity level. Perfect for basics like salt, oil, or flour.
              </p>
            </section>

            {/* Voice Input Section */}
            <section className="p-4 bg-blue-100 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-xl font-black mb-3 flex items-center gap-2">
                <span className="text-2xl">🎙️</span> Voice Input
              </h3>
              <p className="text-sm font-medium mb-3">
                Update multiple ingredients at once using natural language. Examples:
              </p>
              <ul className="space-y-1.5 text-sm font-medium pl-4">
                <li className="before:content-['•'] before:mr-2 before:text-blue-600 before:font-black">
                  &ldquo;I just bought milk and eggs&rdquo;
                </li>
                <li className="before:content-['•'] before:mr-2 before:text-blue-600 before:font-black">
                  &ldquo;Running low on tomatoes&rdquo;
                </li>
                <li className="before:content-['•'] before:mr-2 before:text-blue-600 before:font-black">
                  &ldquo;Ran out of cheese and onions&rdquo;
                </li>
                <li className="before:content-['•'] before:mr-2 before:text-blue-600 before:font-black">
                  &ldquo;Have plenty of garlic&rdquo;
                </li>
              </ul>
            </section>

            {/* Text Input Section */}
            <section className="p-4 bg-green-100 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-xl font-black mb-3 flex items-center gap-2">
                <span className="text-2xl">⌨️</span> Text Input
              </h3>
              <p className="text-sm font-medium">
                Prefer typing? Switch to text mode and enter inventory updates the same way.
              </p>
            </section>
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
