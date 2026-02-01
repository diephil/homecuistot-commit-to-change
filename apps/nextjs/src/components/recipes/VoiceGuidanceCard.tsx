/**
 * Voice Guidance Card for Recipes
 *
 * Shows example sentences for voice input in the recipes page.
 */

import { InfoCard } from "@/components/shared/InfoCard";

export function RecipeVoiceGuidanceCard() {
  return (
    <InfoCard variant="cyan" emoji="💬" heading="Speak to manage recipes">
      <div className="space-y-3 text-sm">
        <div>
          <p className="font-bold mb-1">Create:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>&quot;Add a pasta carbonara with eggs, bacon, and parmesan.&quot;</li>
          </ul>
        </div>
        <div>
          <p className="font-bold mb-1">Update:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>&quot;Add mushrooms to my carbonara as optional.&quot;</li>
          </ul>
        </div>
        <div>
          <p className="font-bold mb-1">Delete:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>&quot;Delete my carbonara recipe.&quot;</li>
          </ul>
        </div>
      </div>
    </InfoCard>
  );
}
