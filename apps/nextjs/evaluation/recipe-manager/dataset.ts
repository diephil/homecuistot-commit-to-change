/**
 * Dataset: Recipe Manager Evaluation Test Cases
 * 35 test cases covering create, update, delete, delete_all operations
 */

import { Dataset } from "../types";
import { RecipeFixture, RECIPE_IDS, ING } from "./fixtures";
import type { RecipeDatasetItem } from "./types";

export type { RecipeDatasetItem };

const DATASET_ENTRIES: RecipeDatasetItem[] = [
  // ============================================================================
  // Basic Create (5 examples)
  // ============================================================================
  {
    input: "Add scrambled eggs",
    expected_output: {
      recipes: [
        {
          operation: "create_batch",
          results: [
            {
              operation: "create",
              index: 0,
              title: "Scrambled Eggs",
              description: "",
              ingredients: [],
              matched: [],
              unrecognized: [],
            },
          ],
          totalCreated: 1,
          totalUnrecognized: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture().build(),
      input_locale: "en",
      category: "basic_create",
      comment: "Single create - LLM generates ingredients",
      version: 1,
    },
  },
  {
    input: "I can cook carbonara with bacon, eggs, parmesan",
    expected_output: {
      recipes: [
        {
          operation: "create_batch",
          results: [
            {
              operation: "create",
              index: 0,
              title: "Carbonara",
              description: "",
              ingredients: [
                { ingredientId: ING.bacon, name: "bacon", isRequired: true },
                { ingredientId: ING.egg, name: "egg", isRequired: true },
                {
                  ingredientId: ING.parmesan,
                  name: "parmesan",
                  isRequired: true,
                },
              ],
              matched: [
                { ingredientId: ING.bacon, name: "bacon", isRequired: true },
                { ingredientId: ING.egg, name: "egg", isRequired: true },
                {
                  ingredientId: ING.parmesan,
                  name: "parmesan",
                  isRequired: true,
                },
              ],
              unrecognized: [],
            },
          ],
          totalCreated: 1,
          totalUnrecognized: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture().build(),
      input_locale: "en",
      category: "basic_create",
      comment: "Single create - user specifies ingredients",
      version: 1,
    },
  },
  {
    input: "Add tomato salad and omelette",
    expected_output: {
      recipes: [
        {
          operation: "create_batch",
          results: [
            {
              operation: "create",
              index: 0,
              title: "Tomato Salad",
              description: "",
              ingredients: [],
              matched: [],
              unrecognized: [],
            },
            {
              operation: "create",
              index: 1,
              title: "Omelette",
              description: "",
              ingredients: [],
              matched: [],
              unrecognized: [],
            },
          ],
          totalCreated: 2,
          totalUnrecognized: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture().build(),
      input_locale: "en",
      category: "basic_create",
      comment: "Multiple create",
      version: 1,
    },
  },
  {
    input:
      "Okay, so I can do a quiche that is made of broccoli and goat cheese, and I need eggs and flour to do that, and I need also some levure. I don't know how to say that in English",
    expected_output: {
      recipes: [
        {
          operation: "create_batch",
          results: [
            {
              operation: "create",
              index: 0,
              title: "Quiche",
              description: "Quiche with broccoli and goat cheese",
              ingredients: [
                {
                  ingredientId: ING.broccoli,
                  name: "broccoli",
                  isRequired: true,
                },
                {
                  ingredientId: ING.goat_cheese,
                  name: "goat cheese",
                  isRequired: true,
                },
                { ingredientId: ING.egg, name: "egg", isRequired: true },
                { ingredientId: ING.flour, name: "flour", isRequired: true },
                { ingredientId: ING.yeast, name: "yeast", isRequired: true },
              ],
              matched: [
                {
                  ingredientId: ING.broccoli,
                  name: "broccoli",
                  isRequired: true,
                },
                {
                  ingredientId: ING.goat_cheese,
                  name: "goat cheese",
                  isRequired: true,
                },
                { ingredientId: ING.egg, name: "egg", isRequired: true },
                { ingredientId: ING.flour, name: "flour", isRequired: true },
                { ingredientId: ING.yeast, name: "yeast", isRequired: true },
              ],
              unrecognized: [],
            },
          ],
          totalCreated: 1,
          totalUnrecognized: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture().build(),
      input_locale: "en",
      category: "basic_create",
      comment:
        "Single create - 'I can do' phrasing with all ingredients specified with french words",
      version: 1,
    },
  },
  {
    input:
      "I can do some blanquette de veau, and in the blanquette de veau, there is dill, cream, and some other ingredients that I don't know, but help me add those.",
    expected_output: {
      recipes: [
        {
          operation: "create_batch",
          results: [
            {
              operation: "create",
              index: 0,
              title: "Blanquette de veau",
              description: "Traditional French veal stew with dill and cream.",
              ingredients: [
                { ingredientId: ING.veal, name: "veal", isRequired: true },
                { ingredientId: ING.dill, name: "dill", isRequired: true },
                { ingredientId: ING.cream, name: "cream", isRequired: true },
                { ingredientId: ING.onion, name: "onion", isRequired: true },
                { ingredientId: ING.butter, name: "butter", isRequired: true },
                { ingredientId: ING.flour, name: "flour", isRequired: true },
                { ingredientId: ING.carrot, name: "carrot", isRequired: true },
                { ingredientId: ING.salt, name: "salt", isRequired: true },
                { ingredientId: ING.pepper, name: "pepper", isRequired: true },
              ],
              matched: [
                { ingredientId: ING.veal, name: "veal", isRequired: true },
                { ingredientId: ING.dill, name: "dill", isRequired: true },
                { ingredientId: ING.cream, name: "cream", isRequired: true },
                { ingredientId: ING.onion, name: "onion", isRequired: true },
                { ingredientId: ING.butter, name: "butter", isRequired: true },
                { ingredientId: ING.flour, name: "flour", isRequired: true },
                { ingredientId: ING.carrot, name: "carrot", isRequired: true },
                { ingredientId: ING.salt, name: "salt", isRequired: true },
                { ingredientId: ING.pepper, name: "pepper", isRequired: true },
              ],
              unrecognized: [],
            },
          ],
          totalCreated: 1,
          totalUnrecognized: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture().build(),
      input_locale: "en",
      category: "basic_create",
      comment:
        "Single create - French dish, partial ingredients + request for LLM to add missing ingredients",
      version: 1,
    },
  },

  // ============================================================================
  // Basic Update (3 examples)
  // ============================================================================
  {
    input: "Add mushrooms to my carbonara",
    expected_output: {
      recipes: [
        {
          operation: "update_batch",
          results: [
            {
              operation: "update",
              index: 0,
              recipeId: RECIPE_IDS.carbonara,
              previousState: {
                id: RECIPE_IDS.carbonara,
                title: "Pasta Carbonara",
                description: "Classic Italian pasta",
                ingredients: [
                  { name: "pasta", isRequired: true },
                  { name: "bacon", isRequired: true },
                ],
              },
              proposedState: {
                title: "Pasta Carbonara",
                description: "Classic Italian pasta",
                ingredients: [
                  { ingredientId: ING.pasta, name: "pasta", isRequired: true },
                  { ingredientId: ING.bacon, name: "bacon", isRequired: true },
                  {
                    ingredientId: ING.mushroom,
                    name: "mushroom",
                    isRequired: false,
                  },
                ],
              },
              matched: [
                {
                  ingredientId: ING.mushroom,
                  name: "mushroom",
                  isRequired: false,
                },
              ],
              unrecognized: [],
            },
          ],
          totalUpdated: 1,
          totalNotFound: 0,
          totalUnrecognized: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture()
        .addRecipe({
          id: RECIPE_IDS.carbonara,
          title: "Pasta Carbonara",
          description: "Classic Italian pasta",
          ingredients: [
            { name: "pasta", isRequired: true },
            { name: "bacon", isRequired: true },
          ],
        })
        .build(),
      input_locale: "en",
      category: "basic_update",
      comment: "Add ingredient",
      version: 1,
    },
  },
  {
    input: "Remove bacon from carbonara",
    expected_output: {
      recipes: [
        {
          operation: "update_batch",
          results: [
            {
              operation: "update",
              index: 0,
              recipeId: RECIPE_IDS.carbonara,
              previousState: {
                id: RECIPE_IDS.carbonara,
                title: "Pasta Carbonara",
                description: "Classic Italian pasta",
                ingredients: [
                  { name: "pasta", isRequired: true },
                  { name: "bacon", isRequired: true },
                ],
              },
              proposedState: {
                title: "Pasta Carbonara",
                description: "Classic Italian pasta",
                ingredients: [
                  { ingredientId: ING.pasta, name: "pasta", isRequired: true },
                ],
              },
              matched: [],
              unrecognized: [],
            },
          ],
          totalUpdated: 1,
          totalNotFound: 0,
          totalUnrecognized: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture()
        .addRecipe({
          id: RECIPE_IDS.carbonara,
          title: "Pasta Carbonara",
          description: "Classic Italian pasta",
          ingredients: [
            { name: "pasta", isRequired: true },
            { name: "bacon", isRequired: true },
          ],
        })
        .build(),
      input_locale: "en",
      category: "basic_update",
      comment: "Remove ingredient",
      version: 1,
    },
  },
  {
    input: "Rename scrambled eggs to Perfect Scrambled Eggs",
    expected_output: {
      recipes: [
        {
          operation: "update_batch",
          results: [
            {
              operation: "update",
              index: 0,
              recipeId: RECIPE_IDS.scrambledEggs,
              previousState: {
                id: RECIPE_IDS.scrambledEggs,
                title: "Scrambled Eggs",
                description: "Simple breakfast",
                ingredients: [{ name: "egg", isRequired: true }],
              },
              proposedState: {
                title: "Perfect Scrambled Eggs",
                description: "Simple breakfast",
                ingredients: [
                  { ingredientId: ING.egg, name: "egg", isRequired: true },
                ],
              },
              matched: [],
              unrecognized: [],
            },
          ],
          totalUpdated: 1,
          totalNotFound: 0,
          totalUnrecognized: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture()
        .addRecipe({
          id: RECIPE_IDS.scrambledEggs,
          title: "Scrambled Eggs",
          description: "Simple breakfast",
          ingredients: [{ name: "egg", isRequired: true }],
        })
        .build(),
      input_locale: "en",
      category: "basic_update",
      comment: "Title change",
      version: 1,
    },
  },

  // ============================================================================
  // Basic Delete (2 examples)
  // ============================================================================
  {
    input: "Remove my carbonara recipe",
    expected_output: {
      recipes: [
        {
          operation: "delete_batch",
          results: [
            {
              recipeId: RECIPE_IDS.carbonara,
              title: "Pasta Carbonara",
              found: true,
            },
          ],
          totalDeleted: 1,
          totalNotFound: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture()
        .addRecipe({
          id: RECIPE_IDS.carbonara,
          title: "Pasta Carbonara",
          description: "Classic Italian pasta",
          ingredients: [{ name: "pasta", isRequired: true }],
        })
        .build(),
      input_locale: "en",
      category: "basic_delete",
      comment: "Single delete",
      version: 1,
    },
  },
  {
    input: "Delete scrambled eggs and omelette",
    expected_output: {
      recipes: [
        {
          operation: "delete_batch",
          results: [
            {
              recipeId: RECIPE_IDS.scrambledEggs,
              title: "Scrambled Eggs",
              found: true,
            },
            {
              recipeId: RECIPE_IDS.omelette,
              title: "Omelette",
              found: true,
            },
          ],
          totalDeleted: 2,
          totalNotFound: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture()
        .addRecipe({
          id: RECIPE_IDS.scrambledEggs,
          title: "Scrambled Eggs",
          description: "Simple breakfast",
          ingredients: [{ name: "egg", isRequired: true }],
        })
        .addRecipe({
          id: RECIPE_IDS.omelette,
          title: "Omelette",
          description: "French classic",
          ingredients: [{ name: "egg", isRequired: true }],
        })
        .build(),
      input_locale: "en",
      category: "basic_delete",
      comment: "Multiple delete",
      version: 1,
    },
  },

  // ============================================================================
  // Delete All (2 examples)
  // ============================================================================
  {
    input: "Clear all my recipes",
    expected_output: {
      recipes: [
        {
          operation: "delete_all",
          deletedCount: 3,
          deletedRecipes: [
            { recipeId: RECIPE_IDS.carbonara, title: "Pasta Carbonara" },
            { recipeId: RECIPE_IDS.scrambledEggs, title: "Scrambled Eggs" },
            { recipeId: RECIPE_IDS.omelette, title: "Omelette" },
          ],
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture()
        .addRecipe({
          id: RECIPE_IDS.carbonara,
          title: "Pasta Carbonara",
          description: "Classic Italian pasta",
          ingredients: [{ name: "pasta", isRequired: true }],
        })
        .addRecipe({
          id: RECIPE_IDS.scrambledEggs,
          title: "Scrambled Eggs",
          description: "Simple breakfast",
          ingredients: [{ name: "egg", isRequired: true }],
        })
        .addRecipe({
          id: RECIPE_IDS.omelette,
          title: "Omelette",
          description: "French classic",
          ingredients: [{ name: "egg", isRequired: true }],
        })
        .build(),
      input_locale: "en",
      category: "delete_all",
      comment: "Delete all - multiple recipes",
      version: 1,
    },
  },
  {
    input: "Delete everything",
    expected_output: {
      recipes: [
        {
          operation: "delete_all",
          deletedCount: 0,
          deletedRecipes: [],
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture().build(),
      input_locale: "en",
      category: "delete_all",
      comment: "Delete all - empty state",
      version: 1,
    },
  },

  // ============================================================================
  // Edge Cases (3 examples)
  // ============================================================================
  {
    input: "Add unicorn meat to carbonara",
    expected_output: {
      recipes: [
        // {
        //   operation: "update_batch",
        //   results: [
        //     {
        //       operation: "update",
        //       index: 0,
        //       recipeId: RECIPE_IDS.carbonara,
        //       previousState: {
        //         id: RECIPE_IDS.carbonara,
        //         title: "Pasta Carbonara",
        //         description: "Classic Italian pasta",
        //         ingredients: [{ name: "pasta", isRequired: true }],
        //       },
        //       proposedState: {
        //         title: "Pasta Carbonara",
        //         description: "Classic Italian pasta",
        //         ingredients: [
        //           { ingredientId: ING.pasta, name: "pasta", isRequired: true },
        //           { name: "unicorn meat", isRequired: false },
        //         ],
        //       },
        //       matched: [],
        //       unrecognized: ["unicorn meat"],
        //     },
        //   ],
        //   totalUpdated: 1,
        //   totalNotFound: 0,
        //   totalUnrecognized: 1,
        // },
      ],
      // noChangesDetected: false,
      noChangesDetected: true,
    },
    metadata: {
      trackedRecipes: new RecipeFixture()
        .addRecipe({
          id: RECIPE_IDS.carbonara,
          title: "Pasta Carbonara",
          description: "Classic Italian pasta",
          ingredients: [{ name: "pasta", isRequired: true }],
        })
        .build(),
      input_locale: "en",
      category: "edge_case",
      comment: "Unrecognized ingredient",
      version: 1,
    },
  },
  {
    input: "",
    expected_output: {
      recipes: [],
      noChangesDetected: true,
    },
    metadata: {
      trackedRecipes: new RecipeFixture()
        .addRecipe({
          id: RECIPE_IDS.carbonara,
          title: "Pasta Carbonara",
          description: "Classic Italian pasta",
          ingredients: [{ name: "pasta", isRequired: true }],
        })
        .build(),
      input_locale: "en",
      category: "edge_case",
      comment: "Empty input",
      version: 1,
    },
  },
  {
    input: "Just checking my recipes",
    expected_output: {
      recipes: [],
      noChangesDetected: true,
    },
    metadata: {
      trackedRecipes: new RecipeFixture()
        .addRecipe({
          id: RECIPE_IDS.carbonara,
          title: "Pasta Carbonara",
          description: "Classic Italian pasta",
          ingredients: [{ name: "pasta", isRequired: true }],
        })
        .build(),
      input_locale: "en",
      category: "edge_case",
      comment: "No action query",
      version: 1,
    },
  },

  // ============================================================================
  // Multi-Recipe Creates (5 examples)
  // ============================================================================
  {
    input: "Add carbonara, fried rice, and omelette recipes",
    expected_output: {
      recipes: [
        {
          operation: "create_batch",
          results: [
            {
              operation: "create",
              index: 0,
              title: "Carbonara",
              description: "",
              ingredients: [],
              matched: [],
              unrecognized: [],
            },
            {
              operation: "create",
              index: 1,
              title: "Fried Rice",
              description: "",
              ingredients: [],
              matched: [],
              unrecognized: [],
            },
            {
              operation: "create",
              index: 2,
              title: "Omelette",
              description: "",
              ingredients: [],
              matched: [],
              unrecognized: [],
            },
          ],
          totalCreated: 3,
          totalUnrecognized: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture().build(),
      input_locale: "en",
      category: "multi_create",
      comment: "Create 3 recipes at once",
      version: 1,
    },
  },
  {
    input:
      "I can make pasta with tomato and garlic, and also a simple salad with tomato and olive oil",
    expected_output: {
      recipes: [
        {
          operation: "create_batch",
          results: [
            {
              operation: "create",
              index: 0,
              title: "Pasta",
              description: "",
              ingredients: [
                { ingredientId: ING.tomato, name: "tomato", isRequired: true },
                { ingredientId: ING.garlic, name: "garlic", isRequired: true },
              ],
              matched: [
                { ingredientId: ING.tomato, name: "tomato", isRequired: true },
                { ingredientId: ING.garlic, name: "garlic", isRequired: true },
              ],
              unrecognized: [],
            },
            {
              operation: "create",
              index: 1,
              title: "Simple Salad",
              description: "",
              ingredients: [
                { ingredientId: ING.tomato, name: "tomato", isRequired: true },
                {
                  ingredientId: ING.olive_oil,
                  name: "olive oil",
                  isRequired: true,
                },
              ],
              matched: [
                { ingredientId: ING.tomato, name: "tomato", isRequired: true },
                {
                  ingredientId: ING.olive_oil,
                  name: "olive oil",
                  isRequired: true,
                },
              ],
              unrecognized: [],
            },
          ],
          totalCreated: 2,
          totalUnrecognized: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture().build(),
      input_locale: "en",
      category: "multi_create",
      comment: "Create 2 recipes with explicit ingredients",
      version: 1,
    },
  },
  {
    input:
      "Add these recipes: scrambled eggs with butter, bacon sandwich, and cheese omelette",
    expected_output: {
      recipes: [
        {
          operation: "create_batch",
          results: [
            {
              operation: "create",
              index: 0,
              title: "Scrambled Eggs",
              description: "",
              ingredients: [
                { ingredientId: ING.butter, name: "butter", isRequired: true },
              ],
              matched: [
                { ingredientId: ING.butter, name: "butter", isRequired: true },
              ],
              unrecognized: [],
            },
            {
              operation: "create",
              index: 1,
              title: "Bacon Sandwich",
              description: "",
              ingredients: [
                { ingredientId: ING.bacon, name: "bacon", isRequired: true },
              ],
              matched: [
                { ingredientId: ING.bacon, name: "bacon", isRequired: true },
              ],
              unrecognized: [],
            },
            {
              operation: "create",
              index: 2,
              title: "Cheese Omelette",
              description: "",
              ingredients: [
                { ingredientId: ING.cheese, name: "cheese", isRequired: true },
              ],
              matched: [
                { ingredientId: ING.cheese, name: "cheese", isRequired: true },
              ],
              unrecognized: [],
            },
          ],
          totalCreated: 3,
          totalUnrecognized: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture().build(),
      input_locale: "en",
      category: "multi_create",
      comment: "Create 3 recipes with partial ingredients",
      version: 1,
    },
  },
  {
    input:
      "I want to add 4 recipes: garlic bread, mushroom soup, tomato pasta, and butter chicken",
    expected_output: {
      recipes: [
        {
          operation: "create_batch",
          results: [
            {
              operation: "create",
              index: 0,
              title: "Garlic Bread",
              description: "",
              ingredients: [
                { ingredientId: ING.garlic, name: "garlic", isRequired: true },
              ],
              matched: [
                { ingredientId: ING.garlic, name: "garlic", isRequired: true },
              ],
              unrecognized: [],
            },
            {
              operation: "create",
              index: 1,
              title: "Mushroom Soup",
              description: "",
              ingredients: [
                {
                  ingredientId: ING.mushroom,
                  name: "mushroom",
                  isRequired: true,
                },
              ],
              matched: [
                {
                  ingredientId: ING.mushroom,
                  name: "mushroom",
                  isRequired: true,
                },
              ],
              unrecognized: [],
            },
            {
              operation: "create",
              index: 2,
              title: "Tomato Pasta",
              description: "",
              ingredients: [
                { ingredientId: ING.tomato, name: "tomato", isRequired: true },
                { ingredientId: ING.pasta, name: "pasta", isRequired: true },
              ],
              matched: [
                { ingredientId: ING.tomato, name: "tomato", isRequired: true },
                { ingredientId: ING.pasta, name: "pasta", isRequired: true },
              ],
              unrecognized: [],
            },
            {
              operation: "create",
              index: 3,
              title: "Butter Chicken",
              description: "",
              ingredients: [
                { ingredientId: ING.butter, name: "butter", isRequired: true },
              ],
              matched: [
                { ingredientId: ING.butter, name: "butter", isRequired: true },
              ],
              unrecognized: [],
            },
          ],
          totalCreated: 4,
          totalUnrecognized: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture().build(),
      input_locale: "en",
      category: "multi_create",
      comment: "Create 4 recipes",
      version: 1,
    },
  },
  {
    input: "Create pasta carbonara and also add a quick salad recipe",
    expected_output: {
      recipes: [
        {
          operation: "create_batch",
          results: [
            {
              operation: "create",
              index: 0,
              title: "Pasta Carbonara",
              description: "",
              ingredients: [],
              matched: [],
              unrecognized: [],
            },
            {
              operation: "create",
              index: 1,
              title: "Quick Salad",
              description: "",
              ingredients: [],
              matched: [],
              unrecognized: [],
            },
          ],
          totalCreated: 2,
          totalUnrecognized: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture().build(),
      input_locale: "en",
      category: "multi_create",
      comment: "Create 2 recipes - natural language",
      version: 1,
    },
  },

  // ============================================================================
  // Multi-Recipe Updates (5 examples)
  // ============================================================================
  {
    input: "Add garlic to carbonara and add onion to the omelette",
    expected_output: {
      recipes: [
        {
          operation: "update_batch",
          results: [
            {
              operation: "update",
              index: 0,
              recipeId: RECIPE_IDS.carbonara,
              previousState: {
                id: RECIPE_IDS.carbonara,
                title: "Pasta Carbonara",
                description: "Classic Italian pasta",
                ingredients: [{ name: "pasta", isRequired: true }],
              },
              proposedState: {
                title: "Pasta Carbonara",
                description: "Classic Italian pasta",
                ingredients: [
                  { ingredientId: ING.pasta, name: "pasta", isRequired: true },
                  {
                    ingredientId: ING.garlic,
                    name: "garlic",
                    isRequired: false,
                  },
                ],
              },
              matched: [
                { ingredientId: ING.garlic, name: "garlic", isRequired: false },
              ],
              unrecognized: [],
            },
            {
              operation: "update",
              index: 1,
              recipeId: RECIPE_IDS.omelette,
              previousState: {
                id: RECIPE_IDS.omelette,
                title: "Omelette",
                description: "French classic",
                ingredients: [{ name: "egg", isRequired: true }],
              },
              proposedState: {
                title: "Omelette",
                description: "French classic",
                ingredients: [
                  { ingredientId: ING.egg, name: "egg", isRequired: true },
                  { ingredientId: ING.onion, name: "onion", isRequired: false },
                ],
              },
              matched: [
                { ingredientId: ING.onion, name: "onion", isRequired: false },
              ],
              unrecognized: [],
            },
          ],
          totalUpdated: 2,
          totalNotFound: 0,
          totalUnrecognized: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture()
        .addRecipe({
          id: RECIPE_IDS.carbonara,
          title: "Pasta Carbonara",
          description: "Classic Italian pasta",
          ingredients: [{ name: "pasta", isRequired: true }],
        })
        .addRecipe({
          id: RECIPE_IDS.omelette,
          title: "Omelette",
          description: "French classic",
          ingredients: [{ name: "egg", isRequired: true }],
        })
        .build(),
      input_locale: "en",
      category: "multi_update",
      comment: "Update 2 recipes - add ingredients",
      version: 1,
    },
  },
  {
    input: "Remove egg from carbonara and remove butter from scrambled eggs",
    expected_output: {
      recipes: [
        {
          operation: "update_batch",
          results: [
            {
              operation: "update",
              index: 0,
              recipeId: RECIPE_IDS.carbonara,
              previousState: {
                id: RECIPE_IDS.carbonara,
                title: "Pasta Carbonara",
                description: "Classic Italian pasta",
                ingredients: [
                  { name: "pasta", isRequired: true },
                  { name: "egg", isRequired: true },
                ],
              },
              proposedState: {
                title: "Pasta Carbonara",
                description: "Classic Italian pasta",
                ingredients: [
                  { ingredientId: ING.pasta, name: "pasta", isRequired: true },
                ],
              },
              matched: [],
              unrecognized: [],
            },
            {
              operation: "update",
              index: 1,
              recipeId: RECIPE_IDS.scrambledEggs,
              previousState: {
                id: RECIPE_IDS.scrambledEggs,
                title: "Scrambled Eggs",
                description: "Simple breakfast",
                ingredients: [
                  { name: "egg", isRequired: true },
                  { name: "butter", isRequired: true },
                ],
              },
              proposedState: {
                title: "Scrambled Eggs",
                description: "Simple breakfast",
                ingredients: [
                  { ingredientId: ING.egg, name: "egg", isRequired: true },
                ],
              },
              matched: [],
              unrecognized: [],
            },
          ],
          totalUpdated: 2,
          totalNotFound: 0,
          totalUnrecognized: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture()
        .addRecipe({
          id: RECIPE_IDS.carbonara,
          title: "Pasta Carbonara",
          description: "Classic Italian pasta",
          ingredients: [
            { name: "pasta", isRequired: true },
            { name: "egg", isRequired: true },
          ],
        })
        .addRecipe({
          id: RECIPE_IDS.scrambledEggs,
          title: "Scrambled Eggs",
          description: "Simple breakfast",
          ingredients: [
            { name: "egg", isRequired: true },
            { name: "butter", isRequired: true },
          ],
        })
        .build(),
      input_locale: "en",
      category: "multi_update",
      comment: "Update 2 recipes - remove ingredients",
      version: 1,
    },
  },
  {
    input: "Add mushrooms to both carbonara and omelette",
    expected_output: {
      recipes: [
        {
          operation: "update_batch",
          results: [
            {
              operation: "update",
              index: 0,
              recipeId: RECIPE_IDS.carbonara,
              previousState: {
                id: RECIPE_IDS.carbonara,
                title: "Pasta Carbonara",
                description: "Classic Italian pasta",
                ingredients: [{ name: "pasta", isRequired: true }],
              },
              proposedState: {
                title: "Pasta Carbonara",
                description: "Classic Italian pasta",
                ingredients: [
                  { ingredientId: ING.pasta, name: "pasta", isRequired: true },
                  {
                    ingredientId: ING.mushroom,
                    name: "mushroom",
                    isRequired: false,
                  },
                ],
              },
              matched: [
                {
                  ingredientId: ING.mushroom,
                  name: "mushroom",
                  isRequired: false,
                },
              ],
              unrecognized: [],
            },
            {
              operation: "update",
              index: 1,
              recipeId: RECIPE_IDS.omelette,
              previousState: {
                id: RECIPE_IDS.omelette,
                title: "Omelette",
                description: "French classic",
                ingredients: [{ name: "egg", isRequired: true }],
              },
              proposedState: {
                title: "Omelette",
                description: "French classic",
                ingredients: [
                  { ingredientId: ING.egg, name: "egg", isRequired: true },
                  {
                    ingredientId: ING.mushroom,
                    name: "mushroom",
                    isRequired: false,
                  },
                ],
              },
              matched: [
                {
                  ingredientId: ING.mushroom,
                  name: "mushroom",
                  isRequired: false,
                },
              ],
              unrecognized: [],
            },
          ],
          totalUpdated: 2,
          totalNotFound: 0,
          totalUnrecognized: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture()
        .addRecipe({
          id: RECIPE_IDS.carbonara,
          title: "Pasta Carbonara",
          description: "Classic Italian pasta",
          ingredients: [{ name: "pasta", isRequired: true }],
        })
        .addRecipe({
          id: RECIPE_IDS.omelette,
          title: "Omelette",
          description: "French classic",
          ingredients: [{ name: "egg", isRequired: true }],
        })
        .build(),
      input_locale: "en",
      category: "multi_update",
      comment: "Update 2 recipes - same ingredient",
      version: 1,
    },
  },
  {
    input: "Update all my egg recipes to include salt",
    expected_output: {
      recipes: [
        {
          operation: "update_batch",
          results: [
            {
              operation: "update",
              index: 0,
              recipeId: RECIPE_IDS.scrambledEggs,
              previousState: {
                id: RECIPE_IDS.scrambledEggs,
                title: "Scrambled Eggs",
                description: "Simple breakfast",
                ingredients: [{ name: "egg", isRequired: true }],
              },
              proposedState: {
                title: "Scrambled Eggs",
                description: "Simple breakfast",
                ingredients: [
                  { ingredientId: ING.egg, name: "egg", isRequired: true },
                  { ingredientId: ING.salt, name: "salt", isRequired: false },
                ],
              },
              matched: [
                { ingredientId: ING.salt, name: "salt", isRequired: false },
              ],
              unrecognized: [],
            },
            {
              operation: "update",
              index: 1,
              recipeId: RECIPE_IDS.omelette,
              previousState: {
                id: RECIPE_IDS.omelette,
                title: "Omelette",
                description: "French classic",
                ingredients: [{ name: "egg", isRequired: true }],
              },
              proposedState: {
                title: "Omelette",
                description: "French classic",
                ingredients: [
                  { ingredientId: ING.egg, name: "egg", isRequired: true },
                  { ingredientId: ING.salt, name: "salt", isRequired: false },
                ],
              },
              matched: [
                { ingredientId: ING.salt, name: "salt", isRequired: false },
              ],
              unrecognized: [],
            },
          ],
          totalUpdated: 2,
          totalNotFound: 0,
          totalUnrecognized: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture()
        .addRecipe({
          id: RECIPE_IDS.scrambledEggs,
          title: "Scrambled Eggs",
          description: "Simple breakfast",
          ingredients: [{ name: "egg", isRequired: true }],
        })
        .addRecipe({
          id: RECIPE_IDS.omelette,
          title: "Omelette",
          description: "French classic",
          ingredients: [{ name: "egg", isRequired: true }],
        })
        .addRecipe({
          id: RECIPE_IDS.carbonara,
          title: "Pasta Carbonara",
          description: "Classic Italian pasta",
          ingredients: [{ name: "pasta", isRequired: true }],
        })
        .build(),
      input_locale: "en",
      category: "multi_update",
      comment: "Update filtered recipes by ingredient",
      version: 1,
    },
  },
  {
    input: "Add pepper and salt to carbonara, omelette, and scrambled eggs",
    expected_output: {
      recipes: [
        {
          operation: "update_batch",
          results: [
            {
              operation: "update",
              index: 0,
              recipeId: RECIPE_IDS.carbonara,
              previousState: {
                id: RECIPE_IDS.carbonara,
                title: "Pasta Carbonara",
                description: "Classic Italian pasta",
                ingredients: [{ name: "pasta", isRequired: true }],
              },
              proposedState: {
                title: "Pasta Carbonara",
                description: "Classic Italian pasta",
                ingredients: [
                  { ingredientId: ING.pasta, name: "pasta", isRequired: true },
                  {
                    ingredientId: ING.pepper,
                    name: "pepper",
                    isRequired: false,
                  },
                  { ingredientId: ING.salt, name: "salt", isRequired: false },
                ],
              },
              matched: [
                { ingredientId: ING.pepper, name: "pepper", isRequired: false },
                { ingredientId: ING.salt, name: "salt", isRequired: false },
              ],
              unrecognized: [],
            },
            {
              operation: "update",
              index: 1,
              recipeId: RECIPE_IDS.omelette,
              previousState: {
                id: RECIPE_IDS.omelette,
                title: "Omelette",
                description: "French classic",
                ingredients: [{ name: "egg", isRequired: true }],
              },
              proposedState: {
                title: "Omelette",
                description: "French classic",
                ingredients: [
                  { ingredientId: ING.egg, name: "egg", isRequired: true },
                  {
                    ingredientId: ING.pepper,
                    name: "pepper",
                    isRequired: false,
                  },
                  { ingredientId: ING.salt, name: "salt", isRequired: false },
                ],
              },
              matched: [
                { ingredientId: ING.pepper, name: "pepper", isRequired: false },
                { ingredientId: ING.salt, name: "salt", isRequired: false },
              ],
              unrecognized: [],
            },
            {
              operation: "update",
              index: 2,
              recipeId: RECIPE_IDS.scrambledEggs,
              previousState: {
                id: RECIPE_IDS.scrambledEggs,
                title: "Scrambled Eggs",
                description: "Simple breakfast",
                ingredients: [{ name: "egg", isRequired: true }],
              },
              proposedState: {
                title: "Scrambled Eggs",
                description: "Simple breakfast",
                ingredients: [
                  { ingredientId: ING.egg, name: "egg", isRequired: true },
                  {
                    ingredientId: ING.pepper,
                    name: "pepper",
                    isRequired: false,
                  },
                  { ingredientId: ING.salt, name: "salt", isRequired: false },
                ],
              },
              matched: [
                { ingredientId: ING.pepper, name: "pepper", isRequired: false },
                { ingredientId: ING.salt, name: "salt", isRequired: false },
              ],
              unrecognized: [],
            },
          ],
          totalUpdated: 3,
          totalNotFound: 0,
          totalUnrecognized: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture()
        .addRecipe({
          id: RECIPE_IDS.carbonara,
          title: "Pasta Carbonara",
          description: "Classic Italian pasta",
          ingredients: [{ name: "pasta", isRequired: true }],
        })
        .addRecipe({
          id: RECIPE_IDS.omelette,
          title: "Omelette",
          description: "French classic",
          ingredients: [{ name: "egg", isRequired: true }],
        })
        .addRecipe({
          id: RECIPE_IDS.scrambledEggs,
          title: "Scrambled Eggs",
          description: "Simple breakfast",
          ingredients: [{ name: "egg", isRequired: true }],
        })
        .build(),
      input_locale: "en",
      category: "multi_update",
      comment: "Update 3 recipes - add same ingredients",
      version: 1,
    },
  },

  // ============================================================================
  // Multi-Recipe Deletes (5 examples)
  // ============================================================================
  {
    input: "Delete carbonara, omelette, and scrambled eggs",
    expected_output: {
      recipes: [
        {
          operation: "delete_batch",
          results: [
            {
              recipeId: RECIPE_IDS.carbonara,
              title: "Pasta Carbonara",
              found: true,
            },
            {
              recipeId: RECIPE_IDS.omelette,
              title: "Omelette",
              found: true,
            },
            {
              recipeId: RECIPE_IDS.scrambledEggs,
              title: "Scrambled Eggs",
              found: true,
            },
          ],
          totalDeleted: 3,
          totalNotFound: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture()
        .addRecipe({
          id: RECIPE_IDS.carbonara,
          title: "Pasta Carbonara",
          description: "Classic Italian pasta",
          ingredients: [{ name: "pasta", isRequired: true }],
        })
        .addRecipe({
          id: RECIPE_IDS.omelette,
          title: "Omelette",
          description: "French classic",
          ingredients: [{ name: "egg", isRequired: true }],
        })
        .addRecipe({
          id: RECIPE_IDS.scrambledEggs,
          title: "Scrambled Eggs",
          description: "Simple breakfast",
          ingredients: [{ name: "egg", isRequired: true }],
        })
        .build(),
      input_locale: "en",
      category: "multi_delete",
      comment: "Delete 3 recipes",
      version: 1,
    },
  },
  {
    input: "Remove all my egg recipes",
    expected_output: {
      recipes: [
        {
          operation: "delete_batch",
          results: [
            {
              recipeId: RECIPE_IDS.scrambledEggs,
              title: "Scrambled Eggs",
              found: true,
            },
            {
              recipeId: RECIPE_IDS.omelette,
              title: "Omelette",
              found: true,
            },
          ],
          totalDeleted: 2,
          totalNotFound: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture()
        .addRecipe({
          id: RECIPE_IDS.scrambledEggs,
          title: "Scrambled Eggs",
          description: "Simple breakfast",
          ingredients: [{ name: "egg", isRequired: true }],
        })
        .addRecipe({
          id: RECIPE_IDS.omelette,
          title: "Omelette",
          description: "French classic",
          ingredients: [{ name: "egg", isRequired: true }],
        })
        .addRecipe({
          id: RECIPE_IDS.carbonara,
          title: "Pasta Carbonara",
          description: "Classic Italian pasta",
          ingredients: [{ name: "pasta", isRequired: true }],
        })
        .build(),
      input_locale: "en",
      category: "multi_delete",
      comment: "Delete filtered by ingredient",
      version: 1,
    },
  },
  {
    input: "Get rid of the salad and omelette recipes",
    expected_output: {
      recipes: [
        {
          operation: "delete_batch",
          results: [
            {
              recipeId: RECIPE_IDS.tomatoSalad,
              title: "Tomato Salad",
              found: true,
            },
            {
              recipeId: RECIPE_IDS.omelette,
              title: "Omelette",
              found: true,
            },
          ],
          totalDeleted: 2,
          totalNotFound: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture()
        .addRecipe({
          id: RECIPE_IDS.tomatoSalad,
          title: "Tomato Salad",
          description: "Fresh salad",
          ingredients: [{ name: "tomato", isRequired: true }],
        })
        .addRecipe({
          id: RECIPE_IDS.omelette,
          title: "Omelette",
          description: "French classic",
          ingredients: [{ name: "egg", isRequired: true }],
        })
        .addRecipe({
          id: RECIPE_IDS.carbonara,
          title: "Pasta Carbonara",
          description: "Classic Italian pasta",
          ingredients: [{ name: "pasta", isRequired: true }],
        })
        .build(),
      input_locale: "en",
      category: "multi_delete",
      comment: "Delete 2 recipes - informal language",
      version: 1,
    },
  },
  {
    input: "Delete carbonara and salad but keep the omelette",
    expected_output: {
      recipes: [
        {
          operation: "delete_batch",
          results: [
            {
              recipeId: RECIPE_IDS.carbonara,
              title: "Pasta Carbonara",
              found: true,
            },
            {
              recipeId: RECIPE_IDS.tomatoSalad,
              title: "Tomato Salad",
              found: true,
            },
          ],
          totalDeleted: 2,
          totalNotFound: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture()
        .addRecipe({
          id: RECIPE_IDS.carbonara,
          title: "Pasta Carbonara",
          description: "Classic Italian pasta",
          ingredients: [{ name: "pasta", isRequired: true }],
        })
        .addRecipe({
          id: RECIPE_IDS.tomatoSalad,
          title: "Tomato Salad",
          description: "Fresh salad",
          ingredients: [{ name: "tomato", isRequired: true }],
        })
        .addRecipe({
          id: RECIPE_IDS.omelette,
          title: "Omelette",
          description: "French classic",
          ingredients: [{ name: "egg", isRequired: true }],
        })
        .build(),
      input_locale: "en",
      category: "multi_delete",
      comment: "Delete with exclusion instruction",
      version: 1,
    },
  },

  // ============================================================================
  // Mixed Operations (5 examples)
  // ============================================================================
  {
    input: "Delete carbonara and add a new pasta recipe",
    expected_output: {
      recipes: [
        {
          operation: "delete_batch",
          results: [
            {
              recipeId: RECIPE_IDS.carbonara,
              title: "Pasta Carbonara",
              found: true,
            },
          ],
          totalDeleted: 1,
          totalNotFound: 0,
        },
        {
          operation: "create_batch",
          results: [
            {
              operation: "create",
              index: 0,
              title: "Pasta",
              description: "",
              ingredients: [],
              matched: [],
              unrecognized: [],
            },
          ],
          totalCreated: 1,
          totalUnrecognized: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture()
        .addRecipe({
          id: RECIPE_IDS.carbonara,
          title: "Pasta Carbonara",
          description: "Classic Italian pasta",
          ingredients: [{ name: "pasta", isRequired: true }],
        })
        .build(),
      input_locale: "en",
      category: "mixed_ops",
      comment: "Delete + Create",
      version: 1,
    },
  },
  {
    input: "Add mushrooms to omelette and delete the carbonara",
    expected_output: {
      recipes: [
        {
          operation: "update_batch",
          results: [
            {
              operation: "update",
              index: 0,
              recipeId: RECIPE_IDS.omelette,
              previousState: {
                id: RECIPE_IDS.omelette,
                title: "Omelette",
                description: "French classic",
                ingredients: [{ name: "egg", isRequired: true }],
              },
              proposedState: {
                title: "Omelette",
                description: "French classic",
                ingredients: [
                  { ingredientId: ING.egg, name: "egg", isRequired: true },
                  {
                    ingredientId: ING.mushroom,
                    name: "mushroom",
                    isRequired: false,
                  },
                ],
              },
              matched: [
                {
                  ingredientId: ING.mushroom,
                  name: "mushroom",
                  isRequired: false,
                },
              ],
              unrecognized: [],
            },
          ],
          totalUpdated: 1,
          totalNotFound: 0,
          totalUnrecognized: 0,
        },
        {
          operation: "delete_batch",
          results: [
            {
              recipeId: RECIPE_IDS.carbonara,
              title: "Pasta Carbonara",
              found: true,
            },
          ],
          totalDeleted: 1,
          totalNotFound: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture()
        .addRecipe({
          id: RECIPE_IDS.omelette,
          title: "Omelette",
          description: "French classic",
          ingredients: [{ name: "egg", isRequired: true }],
        })
        .addRecipe({
          id: RECIPE_IDS.carbonara,
          title: "Pasta Carbonara",
          description: "Classic Italian pasta",
          ingredients: [{ name: "pasta", isRequired: true }],
        })
        .build(),
      input_locale: "en",
      category: "mixed_ops",
      comment: "Update + Delete",
      version: 1,
    },
  },
  {
    input: "Create a salad recipe and update omelette to include cheese",
    expected_output: {
      recipes: [
        {
          operation: "create_batch",
          results: [
            {
              operation: "create",
              index: 0,
              title: "Salad",
              description: "",
              ingredients: [],
              matched: [],
              unrecognized: [],
            },
          ],
          totalCreated: 1,
          totalUnrecognized: 0,
        },
        {
          operation: "update_batch",
          results: [
            {
              operation: "update",
              index: 0,
              recipeId: RECIPE_IDS.omelette,
              previousState: {
                id: RECIPE_IDS.omelette,
                title: "Omelette",
                description: "French classic",
                ingredients: [{ name: "egg", isRequired: true }],
              },
              proposedState: {
                title: "Omelette",
                description: "French classic",
                ingredients: [
                  { ingredientId: ING.egg, name: "egg", isRequired: true },
                  {
                    ingredientId: ING.cheese,
                    name: "cheese",
                    isRequired: false,
                  },
                ],
              },
              matched: [
                { ingredientId: ING.cheese, name: "cheese", isRequired: false },
              ],
              unrecognized: [],
            },
          ],
          totalUpdated: 1,
          totalNotFound: 0,
          totalUnrecognized: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture()
        .addRecipe({
          id: RECIPE_IDS.omelette,
          title: "Omelette",
          description: "French classic",
          ingredients: [{ name: "egg", isRequired: true }],
        })
        .build(),
      input_locale: "en",
      category: "mixed_ops",
      comment: "Create + Update",
      version: 1,
    },
  },
  {
    input: "Delete carbonara and omelette, then add a new breakfast recipe",
    expected_output: {
      recipes: [
        {
          operation: "delete_batch",
          results: [
            {
              recipeId: RECIPE_IDS.carbonara,
              title: "Pasta Carbonara",
              found: true,
            },
            {
              recipeId: RECIPE_IDS.omelette,
              title: "Omelette",
              found: true,
            },
          ],
          totalDeleted: 2,
          totalNotFound: 0,
        },
        {
          operation: "create_batch",
          results: [
            {
              operation: "create",
              index: 0,
              title: "Breakfast",
              description: "",
              ingredients: [],
              matched: [],
              unrecognized: [],
            },
          ],
          totalCreated: 1,
          totalUnrecognized: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture()
        .addRecipe({
          id: RECIPE_IDS.carbonara,
          title: "Pasta Carbonara",
          description: "Classic Italian pasta",
          ingredients: [{ name: "pasta", isRequired: true }],
        })
        .addRecipe({
          id: RECIPE_IDS.omelette,
          title: "Omelette",
          description: "French classic",
          ingredients: [{ name: "egg", isRequired: true }],
        })
        .build(),
      input_locale: "en",
      category: "mixed_ops",
      comment: "Multi-delete + Create",
      version: 1,
    },
  },
  {
    input: "Replace carbonara with a new spaghetti recipe",
    expected_output: {
      recipes: [
        {
          operation: "delete_batch",
          results: [
            {
              recipeId: RECIPE_IDS.carbonara,
              title: "Pasta Carbonara",
              found: true,
            },
          ],
          totalDeleted: 1,
          totalNotFound: 0,
        },
        {
          operation: "create_batch",
          results: [
            {
              operation: "create",
              index: 0,
              title: "Spaghetti",
              description: "",
              ingredients: [],
              matched: [],
              unrecognized: [],
            },
          ],
          totalCreated: 1,
          totalUnrecognized: 0,
        },
      ],
      noChangesDetected: false,
    },
    metadata: {
      trackedRecipes: new RecipeFixture()
        .addRecipe({
          id: RECIPE_IDS.carbonara,
          title: "Pasta Carbonara",
          description: "Classic Italian pasta",
          ingredients: [{ name: "pasta", isRequired: true }],
        })
        .build(),
      input_locale: "en",
      category: "mixed_ops",
      comment: "Replace = Delete + Create",
      version: 2,
    },
  },
];

export const DATASET: Dataset<RecipeDatasetItem> = {
  name: "recipe_manager_v1",
  description:
    "Evaluation dataset for recipe manager agent with create, update, delete, delete_all, and mixed operations",
  entries: DATASET_ENTRIES,
};
