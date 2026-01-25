import { Button } from "@/components/retroui/Button";
import { InfoCard } from "@/components/retroui/InfoCard";
import { PageContainer } from "@/components/PageContainer";
import { Mic } from "lucide-react";

type QuantityLevel = 0 | 1 | 2 | 3;

// T037: MOCK_FRIDGE_INGREDIENTS constant (7 items)
const MOCK_FRIDGE_INGREDIENTS = [
  { id: "1", name: "Tomatoes", category: "fridge" as const, quantityLevel: 3 as QuantityLevel },
  { id: "2", name: "Eggs", category: "fridge" as const, quantityLevel: 1 as QuantityLevel },
  { id: "3", name: "Milk", category: "fridge" as const, quantityLevel: 2 as QuantityLevel },
  { id: "4", name: "Cheese", category: "fridge" as const, quantityLevel: 3 as QuantityLevel },
  { id: "5", name: "Lettuce", category: "fridge" as const, quantityLevel: 0 as QuantityLevel },
  { id: "6", name: "Chicken Breast", category: "fridge" as const, quantityLevel: 2 as QuantityLevel },
  { id: "7", name: "Bell Peppers", category: "fridge" as const, quantityLevel: 1 as QuantityLevel },
] as const;

// T038: MOCK_PANTRY_INGREDIENTS constant (7 items)
const MOCK_PANTRY_INGREDIENTS = [
  { id: "8", name: "Pasta", category: "pantry" as const, quantityLevel: 3 as QuantityLevel },
  { id: "9", name: "Rice", category: "pantry" as const, quantityLevel: 2 as QuantityLevel },
  { id: "10", name: "Flour", category: "pantry" as const, quantityLevel: 1 as QuantityLevel },
  { id: "11", name: "Sugar", category: "pantry" as const, quantityLevel: 3 as QuantityLevel },
  { id: "12", name: "Salt", category: "pantry" as const, quantityLevel: 3 as QuantityLevel },
  { id: "13", name: "Olive Oil", category: "pantry" as const, quantityLevel: 2 as QuantityLevel },
  { id: "14", name: "Soy Sauce", category: "pantry" as const, quantityLevel: 1 as QuantityLevel },
] as const;

// Helper to render quantity indicator
function QuantityIndicator({ level }: { level: QuantityLevel }) {
  const dots = Array.from({ length: 3 }, (_, i) => i + 1);
  return (
    <div className="flex gap-1">
      {dots.map((dot) => (
        <div
          key={dot}
          className={`h-2 w-2 rounded-full border border-black ${
            dot <= level ? "bg-black" : "bg-white"
          }`}
        />
      ))}
    </div>
  );
}

export default function InventoryPage() {
  return (
    <PageContainer
      maxWidth="2xl"
      gradientFrom="from-yellow-50"
      gradientVia="via-amber-50"
      gradientTo="to-orange-50"
    >
      <div className="space-y-8">
        <InfoCard
          emoji="🧪"
          heading="Demo In Progress"
          variant="orange"
        >
          These pages use mock data and are still being developed.
          Expect changes and incomplete features.
        </InfoCard>

        <h1 className="text-3xl font-bold">My Inventory</h1>

        {/* T041: Instructions for editing quantities */}
        <p className="text-sm text-muted-foreground">
          Tap an ingredient to edit its quantity (coming soon)
        </p>

        {/* T040: Ingredient list displaying name and quantityLevel */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Fridge</h2>
          <ul className="space-y-2">
            {MOCK_FRIDGE_INGREDIENTS.map((ingredient) => (
              <li
                key={ingredient.id}
                className="flex items-center justify-between border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                {/* T043: Truncate ingredient names */}
                <span className="truncate font-medium flex-1 mr-4">
                  {ingredient.name}
                </span>
                <QuantityIndicator level={ingredient.quantityLevel} />
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Pantry</h2>
          <ul className="space-y-2">
            {MOCK_PANTRY_INGREDIENTS.map((ingredient) => (
              <li
                key={ingredient.id}
                className="flex items-center justify-between border-2 border-black bg-white p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <span className="truncate font-medium flex-1 mr-4">
                  {ingredient.name}
                </span>
                <QuantityIndicator level={ingredient.quantityLevel} />
              </li>
            ))}
          </ul>
        </section>

        {/* T042: Microphone icon + "Tap to speak" */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button variant="outline" size="lg" className="gap-2">
            <Mic className="h-5 w-5" />
            Tap to speak
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
