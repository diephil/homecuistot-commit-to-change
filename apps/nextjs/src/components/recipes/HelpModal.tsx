"use client";

import { HelpModal, HelpSection, HelpExampleList } from "@/components/shared/HelpModal";
import { Badge } from "@/components/shared/Badge";
import { cn } from "@/lib/utils";

interface RecipeHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RecipeHelpModal({ isOpen, onClose }: RecipeHelpModalProps) {
  return (
    <HelpModal isOpen={isOpen} onClose={onClose} title="How to Manage Recipes">
      {/* Ingredients Section */}
      <HelpSection emoji="🥗" title="Ingredients" bgColor="bg-yellow-100">
        <p className="text-sm font-medium mb-3">
          You can mark ingredients as:
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded">
            <Badge variant="outline" size="sm" className="bg-white/50">
              <span className={cn('mr-1', 'text-amber-500')}>★</span>
              pasta
            </Badge>
            <span className="text-sm font-medium">Essential ingredients you must have to cook the recipe</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded">
            <Badge variant="outline" size="sm" className="bg-white/50">
              <span className={cn('mr-1', 'text-gray-300')}>★</span>
              basil
            </Badge>
            <span className="text-sm font-medium">Nice-to-have ingredients, can be skipped in the recipe</span>
          </div>
        </div>
      </HelpSection>

      {/* Tips Section */}
      <HelpSection emoji="💡" title="Tips" bgColor="bg-purple-100">
        <p className="text-sm font-medium">
          Be specific about key ingredients. The more detail you provide, the better
          the system can match recipes with your available inventory.
        </p>
      </HelpSection>
    </HelpModal>
  );
}
