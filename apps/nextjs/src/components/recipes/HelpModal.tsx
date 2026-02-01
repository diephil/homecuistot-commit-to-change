"use client";

import { HelpModal, HelpSection, HelpExampleList } from "@/components/shared/HelpModal";

interface RecipeHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RecipeHelpModal({ isOpen, onClose }: RecipeHelpModalProps) {
  return (
    <HelpModal isOpen={isOpen} onClose={onClose} title="How to Add Recipes">
      {/* Voice/Text Input Section */}
      <HelpSection emoji="🎙️" title="Voice Input Examples" bgColor="bg-blue-100">
        <p className="text-sm font-medium mb-3">
          Describe recipes you know how to cook using natural language. Examples:
        </p>
        <HelpExampleList
          examples={[
            "I can cook pasta carbonara. I use eggs, bacon, and Parmesan.",
            "My go-to is chicken stir-fry with broccoli, soy sauce, and garlic.",
            "I make a simple tomato soup with onions, garlic, tomatoes, and basil.",
            "For breakfast I often make scrambled eggs with cheese and chives.",
          ]}
          bulletColor="text-blue-600"
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
          After extracting, you can mark ingredients as:
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded">
            <span className="text-xs font-bold px-3 py-1 rounded border-2 border-black bg-primary text-primary-foreground">
              Required
            </span>
            <span className="text-sm font-medium">Essential ingredients you must have to cook the recipe</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded">
            <span className="text-xs font-bold px-3 py-1 rounded border-2 border-black bg-gray-200">
              Optional
            </span>
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
