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
      {/* Create Recipe Section */}
      <HelpSection emoji="➕" title="CREATE A NEW RECIPE" bgColor="bg-cyan-100">
        <HelpExampleList
          examples={[
            "Add a pasta carbonara with eggs, bacon, and parmesan.",
            "I want to track my chicken stir-fry recipe.",
            "Create a tomato soup with onions, garlic, and basil.",
          ]}
          bulletColor="text-black"
        />
      </HelpSection>

      {/* Update Recipe Section */}
      <HelpSection emoji="✏️" title="UPDATE AN EXISTING RECIPE" bgColor="bg-blue-100">
        <HelpExampleList
          examples={[
            "Add mushrooms to my carbonara as optional.",
            "Remove bacon from the stir-fry.",
            "Make parmesan optional in carbonara.",
          ]}
          bulletColor="text-black"
        />
      </HelpSection>

      {/* Delete Recipe Section */}
      <HelpSection emoji="🗑️" title="DELETE A RECIPE" bgColor="bg-red-100">
        <HelpExampleList
          examples={[
            "Delete my carbonara recipe.",
            "Remove the scrambled eggs from my list.",
            "I don't want to track the stir-fry anymore.",
          ]}
          bulletColor="text-black"
        />
      </HelpSection>

      {/* Text Input Section */}
      <HelpSection emoji="⌨️" title="Text Input" bgColor="bg-green-100">
        <p className="text-sm font-medium">
          Prefer typing? Switch to text mode and describe your recipes the same way.
          The system will extract the recipe name, description, and ingredients automatically.
        </p>
      </HelpSection>

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
