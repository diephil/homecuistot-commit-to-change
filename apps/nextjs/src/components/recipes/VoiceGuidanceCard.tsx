/**
 * Voice Guidance Card for Recipes
 *
 * Shows example sentences for voice input in the recipes page.
 */

import { InfoCard } from "@/components/shared/InfoCard";

export function RecipeVoiceGuidanceCard() {
  return (
    <InfoCard variant="cyan" emoji="💬" heading="Speak to add a recipe">
      <ul className="list-disc list-inside space-y-1 text-sm">
        <li>&quot;I can cook pasta carbonara. I use eggs, bacon, and Parmesan.&quot;</li>
        <li>&quot;My go-to is chicken stir-fry with broccoli, soy sauce, and garlic.&quot;</li>
        <li>&quot;I make a simple tomato soup with onions, garlic, tomatoes, and basil.&quot;</li>
      </ul>
    </InfoCard>
  );
}
