/* eslint-disable react/no-unescaped-entities */
"use client";

import { PageContainer } from "@/components/PageContainer";
import { IngredientBadge } from "@/components/retroui/IngredientBadge";
import { Button } from "@/components/retroui/Button";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type QuantityLevel = 0 | 1 | 2 | 3;

interface IngredientState {
  name: string;
  level: QuantityLevel;
}

export default function IngredientBadgeDemoPage() {
  // State for each variant
  const [batteryIngredients, setBatteryIngredients] = useState<IngredientState[]>([
    { name: "Tomatoes", level: 3 },
    { name: "Eggs", level: 2 },
    { name: "Milk", level: 1 },
    { name: "Lettuce", level: 0 },
  ]);

  const [dotsIngredients, setDotsIngredients] = useState<IngredientState[]>([
    { name: "Pasta", level: 3 },
    { name: "Rice", level: 2 },
    { name: "Flour", level: 1 },
    { name: "Sugar", level: 0 },
  ]);

  const [fillIngredients, setFillIngredients] = useState<IngredientState[]>([
    { name: "Olive Oil", level: 3 },
    { name: "Soy Sauce", level: 2 },
    { name: "Honey", level: 1 },
    { name: "Vinegar", level: 0 },
  ]);

  const updateLevel = (
    items: IngredientState[],
    setter: React.Dispatch<React.SetStateAction<IngredientState[]>>,
    index: number,
    newLevel: QuantityLevel
  ) => {
    const updated = [...items];
    updated[index].level = newLevel;
    setter(updated);
  };

  return (
    <PageContainer
      maxWidth="2xl"
      gradientFrom="from-blue-50"
      gradientVia="via-purple-50"
      gradientTo="to-pink-50"
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/inventory">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Ingredient Badge Component Demo</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Click any badge to cycle through quantity levels (0-3)
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="border-2 border-black bg-amber-50 p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-lg font-semibold mb-2">How to Test</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Click any badge to cycle through levels: 0 (empty) → 1 (low) → 2 (medium) → 3 (full)</li>
            <li>Compare visual clarity and UX across all three options</li>
            <li>Test on different screen sizes (resize your browser)</li>
            <li>Consider which "feels" most like a battery level indicator</li>
          </ul>
        </div>

        {/* Option 1: Battery Bar Indicator */}
        <section className="space-y-4">
          <div className="border-l-4 border-green-600 pl-4">
            <h2 className="text-2xl font-bold text-green-700">
              Option 1: Battery Bar Indicator (Recommended)
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Pill-shaped badge with horizontal battery bars. Clear visual hierarchy with battery icon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {batteryIngredients.map((ingredient, index) => (
              <div key={ingredient.name} className="flex items-center gap-3">
                <IngredientBadge
                  variant="battery"
                  name={ingredient.name}
                  level={ingredient.level}
                  onLevelChange={(newLevel) =>
                    updateLevel(batteryIngredients, setBatteryIngredients, index, newLevel)
                  }
                />
                <span className="text-xs text-muted-foreground">
                  Level {ingredient.level}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-green-50 border-2 border-green-600 p-3 rounded-lg">
            <p className="text-sm font-medium text-green-900">
              <strong>Pros:</strong> Immediately recognizable battery metaphor, clear visual hierarchy,
              best accessibility (color + bars), matches neo-brutalism aesthetic.
            </p>
            <p className="text-sm font-medium text-green-900 mt-1">
              <strong>Cons:</strong> Takes more horizontal space, battery metaphor might feel tech-heavy for food.
            </p>
          </div>
        </section>

        {/* Option 2: Color-Coded Dot Matrix */}
        <section className="space-y-4">
          <div className="border-l-4 border-blue-600 pl-4">
            <h2 className="text-2xl font-bold text-blue-700">
              Option 2: Color-Coded Dot Matrix
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Compact badge with 3 dots that fill/empty based on level. Background color changes with level.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dotsIngredients.map((ingredient, index) => (
              <div key={ingredient.name} className="flex items-center gap-3">
                <IngredientBadge
                  variant="dots"
                  name={ingredient.name}
                  level={ingredient.level}
                  onLevelChange={(newLevel) =>
                    updateLevel(dotsIngredients, setDotsIngredients, index, newLevel)
                  }
                />
                <span className="text-xs text-muted-foreground">
                  Level {ingredient.level}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border-2 border-blue-600 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-900">
              <strong>Pros:</strong> More compact, builds on existing pattern, dots are universal (not tech-specific),
              can show ingredient name inline.
            </p>
            <p className="text-sm font-medium text-blue-900 mt-1">
              <strong>Cons:</strong> Dots may be small on mobile, less immediately "battery-like",
              current implementation already exists (might be redundant).
            </p>
          </div>
        </section>

        {/* Option 3: Fill Level Gauge */}
        <section className="space-y-4">
          <div className="border-l-4 border-purple-600 pl-4">
            <h2 className="text-2xl font-bold text-purple-700">
              Option 3: Fill Level Gauge
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Badge with horizontal fill bar, like a fuel gauge. Fills from left to right based on level.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fillIngredients.map((ingredient, index) => (
              <div key={ingredient.name} className="flex items-center gap-3">
                <IngredientBadge
                  variant="fill"
                  name={ingredient.name}
                  level={ingredient.level}
                  onLevelChange={(newLevel) =>
                    updateLevel(fillIngredients, setFillIngredients, index, newLevel)
                  }
                />
                <span className="text-xs text-muted-foreground">
                  Level {ingredient.level}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-purple-50 border-2 border-purple-600 p-3 rounded-lg">
            <p className="text-sm font-medium text-purple-900">
              <strong>Pros:</strong> Very literal "amount remaining" metaphor, smooth visual transition,
              familiar from mobile battery/fuel indicators, works well for liquids/powders.
            </p>
            <p className="text-sm font-medium text-purple-900 mt-1">
              <strong>Cons:</strong> Partial fills require gradient-like effects (against neo-brutalism),
              implementation complexity higher, may look less bold/punchy.
            </p>
          </div>
        </section>

        {/* Comparison Grid - All Levels Side by Side */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Quick Comparison: All Levels</h2>
          <p className="text-sm text-muted-foreground">
            See all variants at each level to compare visual clarity
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Battery Variant Column */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-green-700">Battery Bars</h3>
              {([0, 1, 2, 3] as QuantityLevel[]).map((lvl) => (
                <IngredientBadge
                  key={lvl}
                  variant="battery"
                  name="Ingredient"
                  level={lvl}
                  interactive={false}
                />
              ))}
            </div>

            {/* Dots Variant Column */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-blue-700">Dot Matrix</h3>
              {([0, 1, 2, 3] as QuantityLevel[]).map((lvl) => (
                <IngredientBadge
                  key={lvl}
                  variant="dots"
                  name="Ingredient"
                  level={lvl}
                  interactive={false}
                />
              ))}
            </div>

            {/* Fill Variant Column */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-purple-700">Fill Gauge</h3>
              {([0, 1, 2, 3] as QuantityLevel[]).map((lvl) => (
                <IngredientBadge
                  key={lvl}
                  variant="fill"
                  name="Ingredient"
                  level={lvl}
                  interactive={false}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Final Recommendation */}
        <div className="border-2 border-black bg-green-100 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-xl font-bold mb-3">Recommendation: Option 1 (Battery Bar Indicator)</h2>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Reasoning:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Clearest metaphor - everyone understands battery levels immediately</li>
              <li>Best accessibility - bars provide shape differentiation beyond color</li>
              <li>Matches neo-brutalism - bold, geometric, high-contrast</li>
              <li>Scalable design - easy to see at all sizes</li>
              <li>Distinct from current UI - existing dots lack visual impact</li>
            </ul>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
