/**
 * Dataset: Inventory Manager Evaluation Test Cases
 * 30+ test cases covering basic operations, quantities, staples, edge cases, multi-language
 */

import { Dataset } from "../types";
import { InventoryFixture } from "./fixtures";
import type { DatasetItem } from "./types";

export type { DatasetItem };

// Real ingredient IDs from local database
const ING = {
  chicken: "e53dffe5-4005-4774-8c1f-3c7826084ca7",
  tomato: "60b31708-224c-42ab-b63b-480d19d6a387",
  olive_oil: "04f02a58-f872-4f01-b079-f2c423234aa0",
  milk: "6bbb7ee3-88c1-408b-afb6-2b121a170aae",
  salt: "10e1650c-eca8-443d-8c93-c4f5bd00d952",
  pepper: "3e490c4e-9369-447a-8864-78de4e1cdbca",
};

// User inventory IDs (generated for test fixtures)
const INV_ID = {
  chicken: "inv-" + ING.chicken,
  tomato: "inv-" + ING.tomato,
  olive_oil: "inv-" + ING.olive_oil,
  milk: "inv-" + ING.milk,
  salt: "inv-" + ING.salt,
  pepper: "inv-" + ING.pepper,
};

const DATASET_ENTRIES: DatasetItem[] = [
  // ============================================================================
  // Basic Operations (6 examples)
  // ============================================================================
  {
    input: "I bought tomatoes",
    expected_output: {
      recognized: [
        {
          ingredientId: ING.tomato,
          ingredientName: "tomato",
          previousQuantity: null,
          proposedQuantity: 3,
          confidence: "high",
        },
      ],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture().build(),
      input_locale: "en",
      comment: "Single addition - new item",
      version: 1,
    },
  },
  {
    input: "Bought chicken, tomatoes, and olive oil",
    expected_output: {
      recognized: [
        {
          ingredientId: ING.chicken,
          ingredientName: "chicken",
          previousQuantity: null,
          proposedQuantity: 3,
          confidence: "high",
        },
        {
          ingredientId: ING.tomato,
          ingredientName: "tomato",
          previousQuantity: null,
          proposedQuantity: 3,
          confidence: "high",
        },
        {
          ingredientId: ING.olive_oil,
          ingredientName: "olive oil",
          previousQuantity: null,
          proposedQuantity: 3,
          confidence: "high",
        },
      ],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture().build(),
      input_locale: "en",
      comment: "Multiple additions",
      version: 1,
    },
  },
  {
    input: "Ran out of milk",
    expected_output: {
      recognized: [
        {
          ingredientId: ING.milk,
          ingredientName: "milk",
          previousQuantity: 2,
          proposedQuantity: 0,
          previousPantryStaple: false,
          confidence: "high",
        },
      ],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture()
        .add({
          id: INV_ID.milk,
          ingredientId: ING.milk,
          name: "milk",
          quantityLevel: 2,
        })
        .build(),
      input_locale: "en",
      comment: "Single removal",
      version: 1,
    },
  },
  {
    input: "Finished chicken and tomatoes",
    expected_output: {
      recognized: [
        {
          ingredientId: ING.chicken,
          ingredientName: "chicken",
          previousQuantity: 1,
          proposedQuantity: 0,
          previousPantryStaple: false,
          confidence: "high",
        },
        {
          ingredientId: ING.tomato,
          ingredientName: "tomato",
          previousQuantity: 1,
          proposedQuantity: 0,
          previousPantryStaple: false,
          confidence: "high",
        },
      ],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture()
        .add({
          id: INV_ID.chicken,
          ingredientId: ING.chicken,
          name: "chicken",
          quantityLevel: 1,
        })
        .add({
          id: INV_ID.tomato,
          ingredientId: ING.tomato,
          name: "tomato",
          quantityLevel: 1,
        })
        .build(),
      input_locale: "en",
      comment: "Multiple removals",
      version: 1,
    },
  },
  {
    input: "Bought tomatoes, ran out of milk",
    expected_output: {
      recognized: [
        {
          ingredientId: ING.tomato,
          ingredientName: "tomato",
          previousQuantity: null,
          proposedQuantity: 3,
          confidence: "high",
        },
        {
          ingredientId: ING.milk,
          ingredientName: "milk",
          previousQuantity: 1,
          proposedQuantity: 0,
          previousPantryStaple: false,
          confidence: "high",
        },
      ],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture()
        .add({
          id: INV_ID.milk,
          ingredientId: ING.milk,
          name: "milk",
          quantityLevel: 1,
        })
        .build(),
      input_locale: "en",
      comment: "Mixed operations (add + remove)",
      version: 1,
    },
  },
  {
    input: "Just checking inventory",
    expected_output: {
      recognized: [],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture()
        .add({
          id: INV_ID.chicken,
          ingredientId: ING.chicken,
          name: "chicken",
          quantityLevel: 2,
        })
        .build(),
      input_locale: "en",
      comment: "No changes - informational query",
      version: 1,
    },
  },

  // ============================================================================
  // Quantity Levels (8 examples)
  // ============================================================================
  {
    input: "Just bought chicken",
    expected_output: {
      recognized: [
        {
          ingredientId: ING.chicken,
          ingredientName: "chicken",
          previousQuantity: null,
          proposedQuantity: 3,
          confidence: "high",
        },
      ],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture().build(),
      input_locale: "en",
      comment: "Qty 3 - just bought",
      version: 1,
    },
  },
  {
    input: "Restocked tomatoes, they're full now",
    expected_output: {
      recognized: [
        {
          ingredientId: ING.tomato,
          ingredientName: "tomato",
          previousQuantity: 1,
          proposedQuantity: 3,
          previousPantryStaple: false,
          confidence: "high",
        },
      ],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture()
        .add({
          id: INV_ID.tomato,
          ingredientId: ING.tomato,
          name: "tomato",
          quantityLevel: 1,
        })
        .build(),
      input_locale: "en",
      comment: "Qty 3 - restocked/full",
      version: 1,
    },
  },
  {
    input: "Have some olive oil left",
    expected_output: {
      recognized: [
        {
          ingredientId: ING.olive_oil,
          ingredientName: "olive oil",
          previousQuantity: 3,
          proposedQuantity: 2,
          previousPantryStaple: false,
          confidence: "high",
        },
      ],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture()
        .add({
          id: INV_ID.olive_oil,
          ingredientId: ING.olive_oil,
          name: "olive oil",
          quantityLevel: 3,
        })
        .build(),
      input_locale: "en",
      comment: "Qty 2 - some",
      version: 1,
    },
  },
  {
    input: "Have enough salt for now",
    expected_output: {
      recognized: [
        {
          ingredientId: ING.salt,
          ingredientName: "salt",
          previousQuantity: 3,
          proposedQuantity: 2,
          previousPantryStaple: false,
          confidence: "high",
        },
      ],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture()
        .add({
          id: INV_ID.salt,
          ingredientId: ING.salt,
          name: "salt",
          quantityLevel: 3,
        })
        .build(),
      input_locale: "en",
      comment: "Qty 2 - enough",
      version: 1,
    },
  },
  {
    input: "Running low on milk",
    expected_output: {
      recognized: [
        {
          ingredientId: ING.milk,
          ingredientName: "milk",
          previousQuantity: 2,
          proposedQuantity: 1,
          previousPantryStaple: false,
          confidence: "high",
        },
      ],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture()
        .add({
          id: INV_ID.milk,
          ingredientId: ING.milk,
          name: "milk",
          quantityLevel: 2,
        })
        .build(),
      input_locale: "en",
      comment: "Qty 1 - running low",
      version: 1,
    },
  },
  {
    input: "Almost out of olive oil, need more",
    expected_output: {
      recognized: [
        {
          ingredientId: ING.olive_oil,
          ingredientName: "olive oil",
          previousQuantity: 2,
          proposedQuantity: 1,
          previousPantryStaple: true,
          confidence: "high",
        },
      ],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture()
        .add({
          id: INV_ID.olive_oil,
          ingredientId: ING.olive_oil,
          name: "olive oil",
          quantityLevel: 2,
          isPantryStaple: true,
        })
        .build(),
      input_locale: "en",
      comment: "Qty 1 - almost out",
      version: 1,
    },
  },
  {
    input: "Ran out of chicken",
    expected_output: {
      recognized: [
        {
          ingredientId: ING.chicken,
          ingredientName: "chicken",
          previousQuantity: 1,
          proposedQuantity: 0,
          previousPantryStaple: false,
          confidence: "high",
        },
      ],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture()
        .add({
          id: INV_ID.chicken,
          ingredientId: ING.chicken,
          name: "chicken",
          quantityLevel: 1,
        })
        .build(),
      input_locale: "en",
      comment: "Qty 0 - ran out",
      version: 1,
    },
  },
  {
    input: "Add pepper",
    expected_output: {
      recognized: [
        {
          ingredientId: ING.pepper,
          ingredientName: "pepper",
          previousQuantity: null,
          proposedQuantity: 3,
          confidence: "high",
        },
      ],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture().build(),
      input_locale: "en",
      comment: "Qty 3 - default (no context)",
      version: 1,
    },
  },

  // ============================================================================
  // Pantry Staples (4 examples)
  // ============================================================================
  {
    input: "Mark salt as a pantry staple",
    expected_output: {
      recognized: [
        {
          ingredientId: ING.salt,
          ingredientName: "salt",
          previousQuantity: 3,
          proposedQuantity: 3,
          previousPantryStaple: false,
          proposedPantryStaple: true,
          confidence: "high",
        },
      ],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture()
        .add({
          id: INV_ID.salt,
          ingredientId: ING.salt,
          name: "salt",
          quantityLevel: 3,
        })
        .build(),
      input_locale: "en",
      comment: "Add pantry staple",
      version: 1,
    },
  },
  {
    input: "Remove olive oil from pantry staples",
    expected_output: {
      recognized: [
        {
          ingredientId: ING.olive_oil,
          ingredientName: "olive oil",
          previousQuantity: 3,
          proposedQuantity: 3,
          previousPantryStaple: true,
          proposedPantryStaple: false,
          confidence: "high",
        },
      ],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture()
        .add({
          id: INV_ID.olive_oil,
          ingredientId: ING.olive_oil,
          name: "olive oil",
          quantityLevel: 3,
          isPantryStaple: true,
        })
        .build(),
      input_locale: "en",
      comment: "Remove pantry staple",
      version: 1,
    },
  },
  {
    input: "Bought tomatoes",
    expected_output: {
      recognized: [
        {
          ingredientId: ING.tomato,
          ingredientName: "tomato",
          previousQuantity: null,
          proposedQuantity: 3,
          confidence: "high",
        },
      ],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture().build(),
      input_locale: "en",
      comment: "No staple intent - field omitted",
      version: 1,
    },
  },
  {
    input: "Bought salt, it's a pantry staple",
    expected_output: {
      recognized: [
        {
          ingredientId: ING.salt,
          ingredientName: "salt",
          previousQuantity: null,
          proposedQuantity: 3,
          proposedPantryStaple: true,
          confidence: "high",
        },
      ],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture().build(),
      input_locale: "en",
      comment: "Mixed - add with staple intent",
      version: 1,
    },
  },

  // ============================================================================
  // Edge Cases (8 examples)
  // ============================================================================
  {
    input: "Add dragon fruit",
    expected_output: {
      recognized: [],
      unrecognized: ["dragon fruit"],
    },
    metadata: {
      currentInventory: new InventoryFixture().build(),
      input_locale: "en",
      comment: "Unrecognized ingredient",
      version: 1,
    },
  },
  {
    input: "Bought tomatoes and dragon fruit",
    expected_output: {
      recognized: [
        {
          ingredientId: ING.tomato,
          ingredientName: "tomato",
          previousQuantity: null,
          proposedQuantity: 3,
          confidence: "high",
        },
      ],
      unrecognized: ["dragon fruit"],
    },
    metadata: {
      currentInventory: new InventoryFixture().build(),
      input_locale: "en",
      comment: "Mixed recognized/unrecognized",
      version: 1,
    },
  },
  {
    input: "Add stuff",
    expected_output: {
      recognized: [],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture().build(),
      input_locale: "en",
      comment: "Vague command - no actionable items",
      version: 1,
    },
  },
  {
    input: "Add fucking tomatoes already",
    expected_output: {
      recognized: [
        {
          ingredientId: ING.tomato,
          ingredientName: "tomato",
          previousQuantity: null,
          proposedQuantity: 3,
          confidence: "high",
        },
      ],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture().build(),
      input_locale: "en",
      comment: "Profanity - extract ingredient",
      version: 1,
    },
  },
  {
    input: "Uh, I bought, um, like, tomatoes",
    expected_output: {
      recognized: [
        {
          ingredientId: ING.tomato,
          ingredientName: "tomato",
          previousQuantity: null,
          proposedQuantity: 3,
          confidence: "high",
        },
      ],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture().build(),
      input_locale: "en",
      comment: "Voice artifacts - hesitation markers",
      version: 1,
    },
  },
  {
    input: "Tomatoes are moldy",
    expected_output: {
      recognized: [
        {
          ingredientId: ING.tomato,
          ingredientName: "tomato",
          previousQuantity: 2,
          proposedQuantity: 0,
          previousPantryStaple: false,
          confidence: "high",
        },
      ],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture()
        .add({
          id: INV_ID.tomato,
          ingredientId: ING.tomato,
          name: "tomato",
          quantityLevel: 2,
        })
        .build(),
      input_locale: "en",
      comment: "Quality concern - implies removal",
      version: 1,
    },
  },
  {
    input: "Bought toilet paper",
    expected_output: {
      recognized: [],
      unrecognized: ["toilet paper"],
    },
    metadata: {
      currentInventory: new InventoryFixture().build(),
      input_locale: "en",
      comment: "Non-food item",
      version: 1,
    },
  },
  {
    input: "",
    expected_output: {
      recognized: [],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture().build(),
      input_locale: "en",
      comment: "Empty input",
      version: 1,
    },
  },

  // ============================================================================
  // Multi-language - French (4 examples)
  // ============================================================================
  {
    input: "j'ai acheté des tomates",
    expected_output: {
      recognized: [
        {
          ingredientId: ING.tomato,
          ingredientName: "tomato",
          previousQuantity: null,
          proposedQuantity: 3,
          confidence: "high",
        },
      ],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture().build(),
      input_locale: "fr",
      comment: "French - basic addition",
      version: 1,
    },
  },
  {
    input: "j'ai plus d'huile d'olive",
    expected_output: {
      recognized: [
        {
          ingredientId: ING.olive_oil,
          ingredientName: "olive oil",
          previousQuantity: 1,
          proposedQuantity: 0,
          previousPantryStaple: true,
          confidence: "high",
        },
      ],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture()
        .add({
          id: INV_ID.olive_oil,
          ingredientId: ING.olive_oil,
          name: "olive oil",
          quantityLevel: 1,
          isPantryStaple: true,
        })
        .build(),
      input_locale: "fr",
      comment: "French - ran out",
      version: 1,
    },
  },
  {
    input: "le sel c'est un aliment de base",
    expected_output: {
      recognized: [
        {
          ingredientId: ING.salt,
          ingredientName: "salt",
          previousQuantity: 3,
          proposedQuantity: 3,
          previousPantryStaple: false,
          proposedPantryStaple: true,
          confidence: "high",
        },
      ],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture()
        .add({
          id: INV_ID.salt,
          ingredientId: ING.salt,
          name: "salt",
          quantityLevel: 3,
        })
        .build(),
      input_locale: "fr",
      comment: "French - pantry staple",
      version: 1,
    },
  },
  {
    input: "tomates presque vides",
    expected_output: {
      recognized: [
        {
          ingredientId: ING.tomato,
          ingredientName: "tomato",
          previousQuantity: 2,
          proposedQuantity: 1,
          previousPantryStaple: false,
          confidence: "high",
        },
      ],
      unrecognized: [],
    },
    metadata: {
      currentInventory: new InventoryFixture()
        .add({
          id: INV_ID.tomato,
          ingredientId: ING.tomato,
          name: "tomato",
          quantityLevel: 2,
        })
        .build(),
      input_locale: "fr",
      comment: "French - running low",
      version: 1,
    },
  },
];

export const DATASET: Dataset<DatasetItem> = {
  name: "inventory_manager_v1",
  description:
    "Evaluation dataset for inventory manager agent with 30+ test cases",
  entries: DATASET_ENTRIES,
};
