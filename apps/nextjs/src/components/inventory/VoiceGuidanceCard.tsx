/**
 * Voice Guidance Card for Inventory
 *
 * Shows example sentences for voice input in the inventory page.
 */

import { InfoCard } from "@/components/shared/InfoCard";

export function VoiceGuidanceCard() {
  return (
    <InfoCard variant="cyan" emoji="💬" heading="Speak to update the list">
      <ul className="list-disc list-inside space-y-1 text-sm">
        <li>&quot;I just bought milk and eggs&quot;</li>
        <li>&quot;I have enough onions for at least 2 meals&quot;</li>
        <li>&quot;Running low on tomatoes&quot;</li>
        <li>&quot;I always have pasta in my pantry.&quot;</li>
      </ul>
    </InfoCard>
  );
}
