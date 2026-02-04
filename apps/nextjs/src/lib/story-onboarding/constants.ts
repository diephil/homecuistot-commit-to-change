import type { DemoInventoryItem, DemoRecipe } from "./types";
import type { QuantityLevel } from "@/types/inventory";

/**
 * Story Onboarding Constants
 * Sarah's demo data + scene text content for progressive fade-in.
 */

// localStorage key for story onboarding state
export const LOCALSTORAGE_KEY = "homecuistot:story-onboarding";

// Items required to unlock Scene 5 progression
export const REQUIRED_ITEMS = ["egg", "parmesan"];

// Quantity level → display word mapping
export const QUANTITY_WORDS: Record<QuantityLevel, string> = {
  0: "critical",
  1: "low",
  2: "some",
  3: "plenty",
};

// Sarah's 7 tracked ingredients
export const SARAH_TRACKED_INGREDIENTS: DemoInventoryItem[] = [
  {
    name: "Pasta",
    category: "cereal",
    quantityLevel: 3,
    isPantryStaple: false,
  },
  { name: "Bacon", category: "meat", quantityLevel: 2, isPantryStaple: false },
  { name: "Rice", category: "cereal", quantityLevel: 2, isPantryStaple: false },
  {
    name: "Butter",
    category: "dairy",
    quantityLevel: 2,
    isPantryStaple: false,
  },
  { name: "Milk", category: "dairy", quantityLevel: 1, isPantryStaple: false },
  {
    name: "Parmesan",
    category: "cheeses",
    quantityLevel: 0,
    isPantryStaple: false,
  },
  { name: "Egg", category: "eggs", quantityLevel: 0, isPantryStaple: false },
];

// Sarah's 3 pantry staples
export const SARAH_PANTRY_STAPLES: DemoInventoryItem[] = [
  { name: "Salt", category: "salt", quantityLevel: 3, isPantryStaple: true },
  {
    name: "Black pepper",
    category: "aroma",
    quantityLevel: 3,
    isPantryStaple: true,
  },
  {
    name: "Olive oil",
    category: "oils_and_fats",
    quantityLevel: 3,
    isPantryStaple: true,
  },
];

// Full initial inventory (tracked + staples)
export const SARAH_INITIAL_INVENTORY: DemoInventoryItem[] = [
  ...SARAH_TRACKED_INGREDIENTS,
  ...SARAH_PANTRY_STAPLES,
];

// Carbonara recipe
export const CARBONARA_RECIPE: DemoRecipe = {
  name: "Pasta Carbonara",
  description: "Classic Italian pasta with eggs, cheese, and bacon",
  ingredients: [
    { name: "Pasta", type: "anchor" },
    { name: "Bacon", type: "anchor" },
    { name: "Egg", type: "anchor" },
    { name: "Parmesan", type: "anchor" },
    { name: "Black pepper", type: "optional" },
    { name: "Salt", type: "optional" },
  ],
};

// Scene text content — arrays of segments for progressive fade-in
export const SCENE_TEXT = {
  scene1: [
    "5:47pm. Office.",
    "Sarah's hungry. She doesn't feel like scrolling through Uber Eats again. 😩",
    "She knows how to cook. Carbonara, stir fry, a couple of other dishes she's made a hundred times. She's not looking for new recipes or inspiration.",
    "The problem: she has no idea what's actually in her fridge right now. 🤷‍♀️",
    "Can she make carbonara tonight? Or does she need to stop at the store? For what exactly?",
    "Tonight, she's not going to give up. She's going to commit to changing her takeout-ordering habits.",
    "She opens HomeCuistot instead. 💡",
  ],
  scene2Intro: ["SARAH'S KITCHEN"],
  scene2Outro: [
    "Sarah wants carbonara, but she's missing {eggs} and {parmesan} to cook it.",
  ],
  scene3: [
    "She stops at the store on her way home. 🛒",
    "Grabs what's missing (eggs and parmesan) plus a few other things.",
  ],
  scene4Intro: ["6:30pm. Home.", 'Partner: "What\'d you get?"'],
  scene4Instructions: [
    "Help Sarah say what she bought.",
    "Tap and say:",
    '"I bought parmesan, eggs, and milk"',
  ],
  scene5: [
    '"We have everything for carbonara—let me cook it!" 🎉',
    "Help Sarah log that she made it.",
  ],
  scene7: [
    "That's HomeCuistot.",
    "Sarah didn't scroll through hundreds of recipes.",
    "She didn't watch a 10-minute video to learn something new.",
    "She didn't end up ordering takeout because she couldn't decide.",
  ],
  scene7Manifesto: [
    "She already knew how to make carbonara.",
    "She just needed to know she could make it tonight. ✨",
  ],
  scene7Closing: [
    "HomeCuistot isn't a recipe app.",
    "It's your inventory clerk.",
    "You bring the skills.",
    "We track the ingredients.",
    "Let's commit to change our ordering takeout habits and cook more! 🍳",
  ],
} as const;
