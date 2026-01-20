"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/retroui/Badge";
import { Button } from "@/components/retroui/Button";
import { PageContainer } from "@/components/PageContainer";
import Image from "next/image";

/**
 * KEEP THIS LOGIC WE WILL ADD IT BACK LATER
 * 

const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const initials = user.email
    ?.split("@")[0]
    .slice(0, 2)
    .toUpperCase() || "??";

  // Support both Google (picture) and Discord (avatar_url) avatar fields
  const avatarUrl = user.user_metadata?.picture || user.user_metadata?.avatar_url;


 */

// T020: MOCK_DISHES constant (7 items with id, name, isSelected)
const MOCK_DISHES = [
  { id: "1", name: "Pasta Carbonara", isSelected: true },
  { id: "2", name: "Chicken Stir Fry", isSelected: false },
  { id: "3", name: "Vegetable Soup", isSelected: true },
  { id: "4", name: "Grilled Cheese Sandwich", isSelected: false },
  { id: "5", name: "Scrambled Eggs", isSelected: true },
  { id: "6", name: "Fried Rice", isSelected: false },
  { id: "7", name: "Tomato Salad", isSelected: true },
] as const;

// T021: MOCK_FRIDGE_INGREDIENTS constant (7 items)
const MOCK_FRIDGE_INGREDIENTS = [
  { id: "1", name: "Tomatoes", category: "fridge" as const, isSelected: true },
  { id: "2", name: "Eggs", category: "fridge" as const, isSelected: true },
  { id: "3", name: "Milk", category: "fridge" as const, isSelected: false },
  { id: "4", name: "Cheese", category: "fridge" as const, isSelected: true },
  { id: "5", name: "Lettuce", category: "fridge" as const, isSelected: false },
  { id: "6", name: "Chicken Breast", category: "fridge" as const, isSelected: true },
  { id: "7", name: "Bell Peppers", category: "fridge" as const, isSelected: true },
] as const;

// T022: MOCK_PANTRY_INGREDIENTS constant (7 items)
const MOCK_PANTRY_INGREDIENTS = [
  { id: "8", name: "Pasta", category: "pantry" as const, isSelected: true },
  { id: "9", name: "Rice", category: "pantry" as const, isSelected: true },
  { id: "10", name: "Flour", category: "pantry" as const, isSelected: false },
  { id: "11", name: "Sugar", category: "pantry" as const, isSelected: false },
  { id: "12", name: "Salt", category: "pantry" as const, isSelected: true },
  { id: "13", name: "Olive Oil", category: "pantry" as const, isSelected: true },
  { id: "14", name: "Soy Sauce", category: "pantry" as const, isSelected: true },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  // T023: useState for currentStep (1-3)
  const [currentStep, setCurrentStep] = useState(1);

  const selectedDishes = MOCK_DISHES.filter((d) => d.isSelected);
  const selectedFridge = MOCK_FRIDGE_INGREDIENTS.filter((i) => i.isSelected);
  const selectedPantry = MOCK_PANTRY_INGREDIENTS.filter((i) => i.isSelected);
  const allSelectedIngredients = [...selectedFridge, ...selectedPantry];

  return (
    <PageContainer
      maxWidth="2xl"
      gradientFrom="from-blue-50"
      gradientVia="via-purple-50"
      gradientTo="to-pink-50"
    >
      <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        {/* T028: Sliding transition with CSS transform translateX based on currentStep */}
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${(currentStep - 1) * 100}%)` }}
        >
          {/* T024: Step 1 - Welcome message, voice auth note, Start Onboarding CTA */}
          <div className="min-w-full p-8 flex flex-col items-center gap-6 text-center">
            <h1 className="text-3xl font-bold">Welcome to HomeCuistot!</h1>
            <p className="text-lg text-muted-foreground max-w-md">
              Let&apos;s set up your profile. This will help us suggest recipes based
              on what you have and what you like to cook.
            </p>
            <p className="text-sm text-muted-foreground italic">
              Note: Voice authorization will be available in a future update
            </p>
            <Button
              onClick={() => setCurrentStep(2)}
              variant="default"
              size="lg"
              className="mt-4"
            >
              Start Onboarding
            </Button>
          </div>

          {/* T025: Step 2 - Three sections with badge buttons (dishes, fridge, pantry) */}
          <div className="min-w-full p-8 flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-center">
              Tell us what you like and what you have
            </h2>

            {/* Dishes section */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Favorite Dishes</h3>
              {/* T029: flex-wrap layout for badge wrapping */}
              <div className="flex flex-wrap gap-2">
                {MOCK_DISHES.map((dish) => (
                  <Badge
                    key={dish.id}
                    variant={dish.isSelected ? "solid" : "outline"}
                    className="truncate"
                  >
                    {dish.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Fridge ingredients section */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Fridge Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {MOCK_FRIDGE_INGREDIENTS.map((ingredient) => (
                  <Badge
                    key={ingredient.id}
                    variant={ingredient.isSelected ? "solid" : "outline"}
                    className="truncate"
                  >
                    {ingredient.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Pantry ingredients section */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Pantry Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {MOCK_PANTRY_INGREDIENTS.map((ingredient) => (
                  <Badge
                    key={ingredient.id}
                    variant={ingredient.isSelected ? "solid" : "outline"}
                    className="truncate"
                  >
                    {ingredient.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* T026: Continue/clear CTAs at bottom */}
            <div className="flex gap-4 justify-center mt-4">
              <Button onClick={() => setCurrentStep(1)} variant="outline">
                Back
              </Button>
              <Button onClick={() => setCurrentStep(3)} variant="default">
                Continue
              </Button>
            </div>
          </div>

          {/* T027: Step 3 - Summary, microphone icon, Finish Onboarding button */}
          <div className="min-w-full p-8 flex flex-col items-center gap-6">
            <h2 className="text-2xl font-bold text-center">
              Your Selections Summary
            </h2>

            {/* Summary of selected items */}
            <div className="w-full max-w-md space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Selected Dishes</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDishes.map((dish) => (
                    <Badge key={dish.id} variant="solid" className="truncate">
                      {dish.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Ingredients</h3>
                <div className="flex flex-wrap gap-2">
                  {allSelectedIngredients.map((ingredient) => (
                    <Badge
                      key={ingredient.id}
                      variant="solid"
                      className="truncate"
                    >
                      {ingredient.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Microphone icon + "Tap to speak" text */}
            <div className="flex flex-col items-center gap-2 mt-4">
              <Image
                src="/icons/microphone.svg"
                alt="Microphone"
                width={48}
                height={48}
                className="text-foreground"
              />
              <p className="text-sm text-muted-foreground">
                Tap to speak (coming soon)
              </p>
            </div>

            {/* Finish Onboarding button */}
            <div className="flex gap-4 mt-4">
              <Button onClick={() => setCurrentStep(2)} variant="outline">
                Back
              </Button>
              <Button
                onClick={() => {
                  router.push("/suggestions");
                }}
                variant="default"
                size="lg"
              >
                Finish Onboarding
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
