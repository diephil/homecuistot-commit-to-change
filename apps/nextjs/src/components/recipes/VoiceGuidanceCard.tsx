/**
 * Voice Guidance Card for Recipes
 *
 * Shows example sentences for voice input in the recipes page.
 */

import { InfoCard } from "@/components/shared/InfoCard";

interface RecipeVoiceGuidanceCardProps {
  onDismiss?: () => void;
}

export function RecipeVoiceGuidanceCard({ onDismiss }: RecipeVoiceGuidanceCardProps) {
  return (
    <InfoCard
      variant="cyan"
      emoji="💬"
      heading="Try this"
      onDismiss={onDismiss}
    >
      <div className="space-y-3 text-sm">
        <div>
          <ul className="list-disc list-inside space-y-1">
            <li>&quot;Add a pasta carbonara with eggs, bacon, and parmesan.&quot;</li>
            <li>&quot;Add mushrooms to my carbonara as optional.&quot;</li>
            <li>&quot;Delete my carbonara recipe and replacing it with a spaghetti bolognese.&quot;</li>
            <li>&quot;Delete all my recipies.&quot;</li>
          </ul>
        </div>
      </div>
    </InfoCard>
  );
}
