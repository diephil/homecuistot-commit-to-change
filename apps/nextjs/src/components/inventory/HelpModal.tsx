"use client";

import { HelpModal, HelpSection, HelpExampleList } from "@/components/shared/HelpModal";
import { IngredientBadge } from "@/components/shared/IngredientBadge";
import { QuantityLevel } from "@/types/inventory";

interface InventoryHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InventoryHelpModal({ isOpen, onClose }: InventoryHelpModalProps) {
  return (
    <HelpModal isOpen={isOpen} onClose={onClose} title="How to Use Inventory">
      {/* Speak to Update Section */}
      <HelpSection emoji="💬" title="SPEAK TO UPDATE THE LIST" bgColor="bg-cyan-100">
        <HelpExampleList
          examples={[
            "I just bought milk and eggs",
            "I have enough onions for at least 2 meals",
            "Running low on tomatoes",
            "I always have pasta in my pantry.",
          ]}
          bulletColor="text-black"
        />
      </HelpSection>

      {/* Text Input Section */}
      <HelpSection emoji="⌨️" title="Text Input" bgColor="bg-green-100">
        <p className="text-sm font-medium">
          Prefer typing? Switch to text mode and enter inventory updates the same way.
        </p>
      </HelpSection>

      {/* Quantity Badges Section */}
      <HelpSection emoji="📊" title="Quantity Badges" bgColor="bg-purple-100">
        <p className="text-sm font-medium mb-3">
          Tap the ingredient to update its quantity level. Each dot represents one recipe you can cook with that ingredient:
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
            <span className="text-sm font-black text-red-600">= Need to buy</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded">
            <IngredientBadge
              name="pasta"
              level={1 as QuantityLevel}
              variant="dots"
              size="md"
              interactive={false}
            />
            <span className="text-sm font-black text-orange-600">= Good for 1 more usage</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded">
            <IngredientBadge
              name="pasta"
              level={2 as QuantityLevel}
              variant="dots"
              size="md"
              interactive={false}
            />
            <span className="text-sm font-black text-yellow-600">= Good for 2 more usages</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded">
            <IngredientBadge
              name="pasta"
              level={3 as QuantityLevel}
              variant="dots"
              size="md"
              interactive={false}
            />
            <span className="text-sm font-black text-green-600">= Good for 3+ usages</span>
          </div>
        </div>
      </HelpSection>

      {/* Pantry Staples Section */}
      <HelpSection emoji="🏪" title="Pantry Staples" bgColor="bg-yellow-100">
        <p className="text-sm font-medium">
          Items marked as pantry staples are always considered available for recipe matching,
          regardless of quantity level. Perfect for basics like salt, oil, or flour.
        </p>
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
