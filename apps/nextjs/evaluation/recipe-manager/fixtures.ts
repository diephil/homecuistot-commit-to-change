/**
 * Fixture Builder: Recipe Manager Evaluation
 */

import type { RecipeSessionItem } from "@/types/recipe-agent";

/**
 * Fixture builder for tracked recipes session state
 */
export class RecipeFixture {
  private recipes: RecipeSessionItem[] = [];

  /**
   * Add a recipe to tracked recipes
   */
  addRecipe(params: {
    id: string;
    title: string;
    description: string;
    ingredients: Array<{ name: string; isRequired: boolean }>;
  }): this {
    this.recipes.push({
      id: params.id,
      title: params.title,
      description: params.description,
      ingredients: params.ingredients.map((i) => ({
        name: i.name.toLowerCase(),
        isRequired: i.isRequired,
      })),
    });
    return this;
  }

  /**
   * Build and return tracked recipes array
   */
  build(): RecipeSessionItem[] {
    return this.recipes;
  }
}

// Recipe UUIDs for consistent tests
export const RECIPE_IDS = {
  carbonara: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  scrambledEggs: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  omelette: "c3d4e5f6-a7b8-9012-cdef-123456789012",
  tomatoSalad: "d4e5f6a7-b8c9-0123-def1-234567890123",
};

// Real ingredient IDs from database
export const ING = {
  egg: "3a92af97-5975-4a62-8be6-f6242d538a17",
  pasta: "d958b816-296a-4860-a4c8-d9b5d96d5e84",
  bacon: "8dc7f179-6206-4be8-941e-6fc1f810f0dc",
  parmesan: "67c50ed2-2e6e-4b6d-9e51-6ee08914a423",
  mushroom: "13f5e48f-b36f-4a96-9112-44acbf9d6d92",
  tomato: "60b31708-224c-42ab-b63b-480d19d6a387",
  cheese: "0266509d-5859-4074-85f2-b1bb25ab4657",
  butter: "08dfb742-dc02-4f76-baf0-f58efe88a09a",
  salt: "10e1650c-eca8-443d-8c93-c4f5bd00d952",
  olive_oil: "04f02a58-f872-4f01-b079-f2c423234aa0",
  garlic: "1923cfa3-14d6-45fe-badb-d7db1abdcc1c",
  onion: "7fba37ba-ff5c-486b-824b-83e9c57f0a06",
  pepper: "3e490c4e-9369-447a-8864-78de4e1cdbca",
  broccoli: "1c1e8203-ec07-4393-93c6-7ab1a42ed31d",
  goat_cheese: "8515c1bf-766a-4321-9051-fe0c959cf803",
  flour: "11a6e154-80b8-4a51-a0ea-66a425bb0463",
  yeast: "d1294dc4-7bcc-44ec-ad62-f15aa223a2d8",
  veal: "df33110d-95f5-4a70-a11f-ebb3fd2569db",
  dill: "d40d6274-7bb2-4bd5-b639-d27621d28858",
  cream: "db14db58-77f9-4482-9948-8fbe3f7ce2f9",
  carrot: "3b9c7bff-f86c-42fa-af74-e0ad6fe883cd",
};
