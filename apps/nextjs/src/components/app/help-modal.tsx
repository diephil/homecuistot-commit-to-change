"use client";

import { HelpModal, HelpSection } from "@/components/shared/help-modal";

interface AppHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppHelpModal({ isOpen, onClose }: AppHelpModalProps) {
  return (
    <HelpModal isOpen={isOpen} onClose={onClose} title="How This Page Works">
      {/* Ready To Cook Section */}
      <HelpSection emoji="✅" title="Ready To Cook Recipes" bgColor="bg-green-100">
        <p className="text-sm font-medium">
          Recipes where you have all required ingredients in your inventory.
          Click &quot;Mark as Cooked&quot; to log your meal and automatically deduct
          ingredients from your inventory.
        </p>
      </HelpSection>

      {/* Almost Available Section */}
      <HelpSection emoji="🛒" title="Almost Available Recipes" bgColor="bg-yellow-100">
        <p className="text-sm font-medium mb-3">
          Recipes missing just a few ingredients. The missing items are shown
          so you know what to pick up on your next shopping trip.
        </p>
      </HelpSection>

      {/* Cooking History Section */}
      <HelpSection emoji="📖" title="Cooking History" bgColor="bg-blue-100">
        <p className="text-sm font-medium">
          Track what you&apos;ve cooked and when. This helps you remember your meals
          and see your cooking patterns over time.
        </p>
      </HelpSection>

      {/* Workflow Section */}
      <HelpSection emoji="🔄" title="Recommended Workflow" bgColor="bg-purple-100">
        <div className="space-y-2 text-sm font-medium">
          <p className="flex items-center gap-2">
            <span className="font-black">1.</span> Add recipes in the Recipes page
          </p>
          <p className="flex items-center gap-2">
            <span className="font-black">2.</span> Update ingredient quantities in the Inventory page
          </p>
          <p className="flex items-center gap-2">
            <span className="font-black">3.</span> Check this page to see what you can cook
          </p>
          <p className="flex items-center gap-2">
            <span className="font-black">4.</span> Mark recipes as cooked to automatically update your inventory
          </p>
        </div>
      </HelpSection>
    </HelpModal>
  );
}
