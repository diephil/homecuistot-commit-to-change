import type { DemoInventoryItem, DemoRecipe } from "./types";
import type { QuantityLevel } from "@/types/inventory";

/**
 * Story Onboarding Constants
 * Sarah's demo data + scene text content for progressive fade-in.
 */

// localStorage key for story onboarding state
export const LOCALSTORAGE_KEY = "homecuistot:story-onboarding";

// localStorage key for story completion flag (persists across resets)
export const COMPLETION_FLAG_KEY = "homecuistot:story-completed";

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
  { name: "Bacon", category: "meat", quantityLevel: 1, isPantryStaple: false },
  // { name: "Rice", category: "cereal", quantityLevel: 2, isPantryStaple: false },
  // {
  //   name: "Butter",
  //   category: "dairy",
  //   quantityLevel: 2,
  //   isPantryStaple: false,
  // },
  // { name: "Milk", category: "dairy", quantityLevel: 1, isPantryStaple: false },
  {
    name: "Parmesan",
    category: "cheeses",
    quantityLevel: 0,
    isPantryStaple: false,
  },
  { name: "Egg", category: "eggs", quantityLevel: 0, isPantryStaple: false },
];

// Sarah's 2 pantry staples (Black pepper intentionally excluded — it's optional in carbonara but not tracked)
export const SARAH_PANTRY_STAPLES: DemoInventoryItem[] = [
  { name: "Salt", category: "salt", quantityLevel: 3, isPantryStaple: true },
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
  name: "Sarah's Pasta Carbonara",
  description:
    "A family version of a Pasta Carbonara with eggs, bacon, parmesan and a bit of black truffle.",
  ingredients: [
    { name: "Pasta", type: "anchor" },
    { name: "Bacon", type: "anchor" },
    { name: "Olive oil", type: "anchor" },
    { name: "Egg", type: "anchor" },
    { name: "Parmesan", type: "anchor" },
    { name: "Black truffle", type: "optional" },
    { name: "Salt", type: "optional" },
  ],
};

// Items required in recipe to unlock Scene 2 progression
export const REQUIRED_RECIPE_ITEMS = [
  "egg",
  "parmesan",
  "pasta",
  "bacon",
] as const;

// Scene text content — arrays of segments for progressive fade-in
export const SCENE_TEXT = {
  scene1: [
    "5:47pm. Office.",
    "Sarah's hungry. She doesn't feel like scrolling through Uber Eats again. 😩",
    "She knows how to cook a couple dishes she's made a hundred times. She's not looking for new recipes or inspiration.",
    "The problem: she has no idea what's actually in her fridge right now. 🤷‍♀️",
    "Tonight, she's not going to give up. She's going to commit to changing her takeout-ordering habits.",
    "She opens HomeCuistot instead. 💡",
  ],
  scene2RecipeIntro: ["Sarah wants to tell HomeCuistot her recipe."],
  scene2RecipeInstructions: [
    "Help Sarah tell the app about her carbonara recipe:",
    "Tap and say:",
    '🎙️ "I do a Pasta Carbonara with bacon, eggs and parmesan"',
  ],
  scene3Intro: [
    "She stops at the store on her way home. 🛒",
    "Here's what HomeCuistot shows Sarah:",
  ],
  scene3Outro: [
    "She grabs what's missing for her carbonara (eggs and parmesan) plus a few other things.",
  ],
  scene2Outro: [
    "Sarah wants carbonara, but she's missing {eggs} and {parmesan} to cook it tonight.",
  ],
  scene4Intro: [
    "6:30pm. Home.",
    "Sarah just arrived home. Her hands are full of groceries.",
    "She needs to tell HomeCuistot what she bought.",
  ],
  scene4Instructions: [
    "Help Sarah tell the app what she just bought from the store:",
    "Tap and say:",
    '"I just came back from the store, now I have eggs, parmesan and some bananas"',
  ],
  scene5: [
    '"We have everything for carbonara—let me cook it!" 🎉',
    "Help Sarah log in HomeCuistot that she made it.",
  ],
  scene7YourRecipes: [
    "Now it's your turn! 🎉",
    "Tell HomeCuistot about your own recipes — the dishes you already know how to make.",
  ],
  scene7YourRecipesExamples: {
    prompt: "Add at least one recipe you can do:",
    items: [
      "I cook a traditional egg fried rice with tons of green onions",
      "I do a scrambled eggs with my favorite garlic salt",
    ],
    closing: "etc... you name it!",
  },
  scene8: [
    "That's HomeCuistot.",
    "She didn't scroll through suggestions, search inspiration, or watch dozens of videos for dishes she'll never make.",
  ],
  scene8Manifesto: [
    "She already knew her go-to recipes.",
    "She just needed to know she had everything to make one tonight — and take action. ✨",
  ],
  scene8Opposition: [
    "Other apps ask you to scan receipts or photograph your fridge.",
    "HomeCuistot listens. Just say what you bought.",
    "Recipe apps make you browse.",
    "HomeCuistot makes you cook.",
    "Other apps show you dishes you'll never make.",
    "HomeCuistot tells you which of yours is ready right now.",
  ],
  scene8Closing: ["No more scrolling. No more takeout. Let's cook. 🍳"],
} as const;
