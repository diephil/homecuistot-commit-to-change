"use client";

import { HelpModal, HelpSection, HelpExampleList } from "@/components/shared/help-modal";
import { IngredientBadge } from "@/components/retroui/IngredientBadge";
import { QuantityLevel } from "@/types/inventory";

interface InventoryHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
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
            <span className="text-sm font-black text-orange-600">= Good for 1 recipe</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded">
            <IngredientBadge
              name="pasta"
              level={2 as QuantityLevel}
              variant="dots"
              size="md"
              interactive={false}
            />
            <span className="text-sm font-black text-yellow-600">= Good for 2 recipes</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded">
            <IngredientBadge
              name="pasta"
              level={3 as QuantityLevel}
              variant="dots"
              size="md"
              interactive={false}
            />
            <span className="text-sm font-black text-green-600">= Good for 3+ recipes</span>
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

      {/* Voice Input Section */}
      <HelpSection emoji="🎙️" title="Voice Input" bgColor="bg-blue-100">
        <p className="text-sm font-medium mb-3">
          Update multiple ingredients at once using natural language. Examples:
        </p>
        <HelpExampleList
          examples={[
            "I just bought milk and eggs",
            "Running low on tomatoes",
            "Ran out of cheese and onions",
            "Have plenty of garlic",
          ]}
          bulletColor="text-blue-600"
        />
      </HelpSection>

      {/* Text Input Section */}
      <HelpSection emoji="⌨️" title="Text Input" bgColor="bg-green-100">
        <p className="text-sm font-medium">
          Prefer typing? Switch to text mode and enter inventory updates the same way.
        </p>
      </HelpSection>
    </HelpModal>
  );
}

// Re-export with old name for backwards compatibility
export { InventoryHelpModal as HelpModal };
