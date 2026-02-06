"use client";

import { HelpModal, HelpSection } from "@/components/shared/HelpModal";
import { IngredientBadge } from "@/components/shared/IngredientBadge";
import { QuantityLevel } from "@/types/inventory";

interface InventoryHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Simple badge component for help modal - shows only quantity level
function QuantityBadge({ level, label, bgColor }: { level: QuantityLevel; label: string; bgColor: string }) {
  return (
    <div className={`inline-flex items-center gap-2 border-2 border-black rounded-lg px-3 py-2 ${bgColor}`}>
      <span className={`font-black text-xs ${
        level === 3 ? 'text-green-600/60' :
        level === 2 ? 'text-yellow-600/60' :
        level === 1 ? 'text-orange-600/60' :
        'text-red-600/60'
      }`}>
        {label}
      </span>
    </div>
  );
}

export function InventoryHelpModal({ isOpen, onClose }: InventoryHelpModalProps) {
  return (
    <HelpModal isOpen={isOpen} onClose={onClose} title="How to Use Inventory">
      {/* Quantity Badges Section */}
      <HelpSection emoji="📊" title="Quantity Badges" bgColor="bg-purple-100">
        <p className="text-sm font-medium mb-3">
          Tap the ingredient to update its quantity level. Each dot represents one recipe you can cook with that ingredient:
        </p>
        <div className="space-y-3">

          <div className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded">
            <QuantityBadge level={3} label="PLENTY" bgColor="bg-green-100" />
            <span className="text-sm font-black text-green-600">= Good for 3+ usages</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded">
            <QuantityBadge level={2} label="SOME" bgColor="bg-yellow-100" />
            <span className="text-sm font-black text-yellow-600">= Good for 2 more usages</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded">
            <QuantityBadge level={1} label="ENOUGH" bgColor="bg-orange-100" />
            <span className="text-sm font-black text-orange-600">= Good for 1 more usage</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded">
            <QuantityBadge level={0} label="NO MORE" bgColor="bg-red-100" />
            <span className="text-sm font-black text-red-600">= Need to buy</span>
          </div>
        </div>
      </HelpSection>

      {/* Pantry Staples Section */}
      <HelpSection emoji="🏪" title="Pantry Staples" bgColor="bg-yellow-100">
        <p className="text-sm font-medium mb-3">
          Items marked as pantry staples are always considered available for recipe matching. Perfect for basics like salt, oil, or flour.
        </p>
        <div className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded">
          <div className="inline-flex items-center gap-2 border-2 border-black rounded-lg px-3 py-2 bg-blue-100">
            <span className="font-black text-xs text-blue-600/60">ALWAYS</span>
          </div>
          <span className="text-sm font-black text-blue-600">= Always available (∞)</span>
        </div>
      </HelpSection>

      {/* Feature 021: Unrecognized Items Section (FR-009) */}
      <HelpSection emoji="❓" title="Unrecognized Items" bgColor="bg-gray-100">
        <p className="text-sm font-medium">
          We&apos;re constantly improving recognition. These items might be automatically recognized in future updates, for now, we don&apos;t support them just yet!
        </p>
      </HelpSection>
    </HelpModal>
  );
}

// Re-export with old name for backwards compatibility
export { InventoryHelpModal as HelpModal };
