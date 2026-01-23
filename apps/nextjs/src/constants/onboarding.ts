import type { SuggestedItems } from '@/types/onboarding';

/**
 * T003: Suggested items constants for onboarding badge selection
 * Spec: specs/004-onboarding-flow/data-model.md lines 124-151
 *
 * Dishes selected for clarity - each has clear, unambiguous ingredient lists
 */

export const SUGGESTED_ITEMS: SuggestedItems = {
  dishes: [
    { id: 'dish-1', name: 'Scrambled Eggs' },
    { id: 'dish-2', name: 'Pasta Carbonara' },
    { id: 'dish-3', name: 'Grilled Cheese Sandwich' },
    { id: 'dish-4', name: 'French Toast' },
    { id: 'dish-5', name: 'Egg Fried Rice' },
    { id: 'dish-6', name: 'Miso Soup' },
    { id: 'dish-7', name: 'Caprese Salad' },
    { id: 'dish-8', name: 'Pancakes' },
    { id: 'dish-9', name: 'Cheese Quesadilla' },
    { id: 'dish-10', name: 'Mushroom Omelette' },
    { id: 'dish-11', name: 'Spaghetti Aglio e Olio' },
    { id: 'dish-12', name: 'Caesar Salad' },
    { id: 'dish-13', name: 'Peanut Butter Toast' },
    { id: 'dish-14', name: 'Teriyaki Chicken' },
    { id: 'dish-15', name: 'Tomato Basil Pasta' },
  ],
  fridgeItems: [
    { id: 'fridge-1', name: 'Eggs' },
    { id: 'fridge-2', name: 'Milk' },
    { id: 'fridge-3', name: 'Tomatoes' },
    { id: 'fridge-4', name: 'Cheese' },
    { id: 'fridge-5', name: 'Lettuce' },
    { id: 'fridge-6', name: 'Chicken Breast' },
    { id: 'fridge-7', name: 'Bell Peppers' },
    { id: 'fridge-8', name: 'Carrots' },
    { id: 'fridge-9', name: 'Onions' },
    { id: 'fridge-10', name: 'Butter' },
    { id: 'fridge-11', name: 'Yogurt' },
    { id: 'fridge-12', name: 'Bacon' },
    { id: 'fridge-13', name: 'Broccoli' },
    { id: 'fridge-14', name: 'Cucumber' },
    { id: 'fridge-15', name: 'Ground Beef' },
    { id: 'fridge-16', name: 'Sausages' },
    { id: 'fridge-17', name: 'Mushrooms' },
    { id: 'fridge-18', name: 'Spinach' },
    { id: 'fridge-19', name: 'Cream' },
    { id: 'fridge-20', name: 'Tofu' },
  ],
  pantryItems: [
    { id: 'pantry-1', name: 'Pasta' },
    { id: 'pantry-2', name: 'Rice' },
    { id: 'pantry-3', name: 'Flour' },
    { id: 'pantry-4', name: 'Sugar' },
    { id: 'pantry-5', name: 'Salt' },
    { id: 'pantry-6', name: 'Olive Oil' },
    { id: 'pantry-7', name: 'Soy Sauce' },
    { id: 'pantry-8', name: 'Black Pepper' },
    { id: 'pantry-9', name: 'Garlic Powder' },
    { id: 'pantry-10', name: 'Bread' },
    { id: 'pantry-11', name: 'Canned Tomatoes' },
    { id: 'pantry-12', name: 'Chicken Stock' },
    { id: 'pantry-13', name: 'Peanut Butter' },
    { id: 'pantry-14', name: 'Honey' },
    { id: 'pantry-15', name: 'Oats' },
    { id: 'pantry-16', name: 'Baking Powder' },
    { id: 'pantry-17', name: 'Vinegar' },
    { id: 'pantry-18', name: 'Canned Beans' },
    { id: 'pantry-19', name: 'Tortillas' },
    { id: 'pantry-20', name: 'Noodles' },
  ],
};
