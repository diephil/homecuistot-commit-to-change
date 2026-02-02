import { Dataset } from "../types";

type DatasetItem = {
  input: string;
  expected_output: {
    add: string[];
    rm: string[];
  };
  metadata: {
    input_locale: string;
    comment: string;
    version: number;
    currentIngredients: string[];
  };
};

const currentIngredients = [
  "egg",
  "butter",
  "salt",
  "pasta",
  "rice",
  "garlic",
  "bread",
  "tomato",
  "honey",
  "noodle",
  "bacon",
  "milk",
  "cheese",
  "chicken",
  "cream",
  "onion",
  "olive oil",
];

const DATASET_ENTRIES: DatasetItem[] = [
  {
    input: "I have eggs and butter",
    expected_output: {
      add: ["butter", "egg"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Basic addition",
    },
  },
  {
    input: "add some tomatoes please",
    expected_output: {
      add: ["tomato"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Polite request",
    },
  },
  {
    input: "I bought chicken and rice",
    expected_output: {
      add: ["chicken", "rice"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Past tense purchase",
    },
  },
  {
    input: "remove the milk",
    expected_output: {
      add: [],
      rm: ["milk"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Simple removal",
    },
  },
  {
    input: "I'm out of bread",
    expected_output: {
      add: [],
      rm: ["bread"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Idiomatic removal",
    },
  },
  {
    input: "no more cheese left",
    expected_output: {
      add: [],
      rm: ["cheese"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Depletion statement",
    },
  },
  {
    input: "I have uh... some pasta and um... garlic",
    expected_output: {
      add: ["garlic", "pasta"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Hesitation with fillers",
    },
  },
  {
    input: "got bacon and onions from the store",
    expected_output: {
      add: ["bacon", "onion"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Casual past tense",
    },
  },
  {
    input: "ran out of olive oil",
    expected_output: {
      add: [],
      rm: ["olive oil"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Compound ingredient removal",
    },
  },
  {
    input: "add mushrooms tomatoes and cream",
    expected_output: {
      add: ["cream", "mushroom", "tomato"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Multiple items no punctuation",
    },
  },
  {
    input: "I need to remove salt and pepper",
    expected_output: {
      add: [],
      rm: ["pepper", "salt"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Explicit removal intent",
    },
  },
  {
    input: "just picked up some noodles",
    expected_output: {
      add: ["noodle"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Casual addition",
    },
  },
  {
    input: "delete the honey",
    expected_output: {
      add: [],
      rm: ["honey"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Delete verb",
    },
  },
  {
    input: "I have like... maybe three eggs?",
    expected_output: {
      add: ["egg"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Uncertainty with quantity",
    },
  },
  {
    input: "finished the garlic",
    expected_output: {
      add: [],
      rm: ["garlic"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Completion verb",
    },
  },
  {
    input: "add rice beans and corn",
    expected_output: {
      add: ["bean", "corn", "rice"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Multiple additions",
    },
  },
  {
    input: "we're out of milk and butter",
    expected_output: {
      add: [],
      rm: ["butter", "milk"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Plural subject removal",
    },
  },
  {
    input: "bought fresh basil and cilantro",
    expected_output: {
      add: ["basil", "cilantro"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Fresh qualifier",
    },
  },
  {
    input: "need to take out the old lettuce",
    expected_output: {
      add: [],
      rm: ["lettuce"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Removal with qualifier",
    },
  },
  {
    input: "j'ai des œufs et du fromage",
    expected_output: {
      add: ["cheese", "egg"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "fr",
      comment: "French input",
    },
  },
  {
    input: "tengo pollo y arroz",
    expected_output: {
      add: ["chicken", "rice"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "es",
      comment: "Spanish input",
    },
  },
  {
    input: "I have um potatoes carrots and uh onions",
    expected_output: {
      add: ["carrot", "onion", "potato"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Multiple fillers",
    },
  },
  {
    input: "add fucking tomatoes already",
    expected_output: {
      add: ["tomato"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Rude/frustrated",
    },
  },
  {
    input: "remove this shit bread it's moldy",
    expected_output: {
      add: [],
      rm: ["bread"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Vulgar complaint",
    },
  },
  {
    input: "I don't give a damn just add pasta",
    expected_output: {
      add: ["pasta"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Dismissive tone",
    },
  },
  {
    input: "the milk is spoiled get rid of it",
    expected_output: {
      add: [],
      rm: ["milk"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Reason for removal",
    },
  },
  {
    input: "add chocolate chips cookies and candy",
    expected_output: {
      add: ["candy", "chocolate chip", "cookie"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Sweet items",
    },
  },
  {
    input: "I have so much rice like tons of it",
    expected_output: {
      add: ["rice"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Abundance expression",
    },
  },
  {
    input: "barely any salt left remove it",
    expected_output: {
      add: [],
      rm: ["salt"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Low quantity removal",
    },
  },
  {
    input: "purchased avocados bell peppers and spinach",
    expected_output: {
      add: ["avocado", "bell pepper", "spinach"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Formal purchased",
    },
  },
  {
    input: "toss the expired yogurt",
    expected_output: {
      add: [],
      rm: ["yogurt"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Expiration reason",
    },
  },
  {
    input: "I got some weird stuff today saffron and turmeric",
    expected_output: {
      add: ["saffron", "turmeric"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Self-commentary",
    },
  },
  {
    input: "remove everything",
    expected_output: {
      add: [],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Ambiguous command - no specific items",
    },
  },
  {
    input: "add nothing",
    expected_output: {
      add: [],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Null addition",
    },
  },
  {
    input: "I have I think maybe possibly some flour",
    expected_output: {
      add: ["flour"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Multiple uncertainty markers",
    },
  },
  {
    input: "used all the sugar up",
    expected_output: {
      add: [],
      rm: ["sugar"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Depletion with 'up'",
    },
  },
  {
    input: "add ground beef and pork chops",
    expected_output: {
      add: ["ground beef", "pork chop"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Meat with descriptors",
    },
  },
  {
    input: "no more fucking eggs jesus christ",
    expected_output: {
      add: [],
      rm: ["egg"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Very frustrated removal",
    },
  },
  {
    input: "I have pickles olives and capers",
    expected_output: {
      add: ["caper", "olive", "pickle"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Briny items",
    },
  },
  {
    input: "the chicken went bad remove it",
    expected_output: {
      add: [],
      rm: ["chicken"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Food safety removal",
    },
  },
  {
    input: "add like a bunch of bananas",
    expected_output: {
      add: ["banana"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Quantity expression",
    },
  },
  {
    input: "got lemons limes and oranges",
    expected_output: {
      add: ["lemon", "lime", "orange"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Citrus fruits",
    },
  },
  {
    input: "delete soy sauce and fish sauce",
    expected_output: {
      add: [],
      rm: ["fish sauce", "soy sauce"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Asian condiments removal",
    },
  },
  {
    input: "I have prosciutto pancetta and salami",
    expected_output: {
      add: ["pancetta", "prosciutto", "salami"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Italian meats",
    },
  },
  {
    input: "ran out of toilet paper",
    expected_output: {
      add: [],
      rm: ["toilet paper"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Non-food item",
    },
  },
  {
    input: "add dog food and cat treats",
    expected_output: {
      add: ["cat treat", "dog food"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Pet items",
    },
  },
  {
    input: "remove the damn onions they make me cry",
    expected_output: {
      add: [],
      rm: ["onion"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Emotional complaint",
    },
  },
  {
    input: "I have literally nothing",
    expected_output: {
      add: [],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Empty statement",
    },
  },
  {
    input: "add ALL the vegetables",
    expected_output: {
      add: [],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Vague non-specific",
    },
  },
  {
    input:
      "so like I went to the store and got bread and also milk but then I remembered I needed eggs so I got those too",
    expected_output: {
      add: ["bread", "egg", "milk"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Long narrative",
    },
  },
  {
    input: "wait no scratch that don't add anything",
    expected_output: {
      add: [],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Retraction",
    },
  },
  {
    input: "add apples remove oranges",
    expected_output: {
      add: ["apple"],
      rm: ["orange"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Mixed add and remove",
    },
  },
  {
    input: "I think I have paprika and cumin maybe",
    expected_output: {
      add: ["cumin", "paprika"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Uncertain spices",
    },
  },
  {
    input: "chuck the stale chips",
    expected_output: { add: [], rm: ["chip"] },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "British 'chuck' verb",
    },
  },
  {
    input: "got sake mirin and rice vinegar",
    expected_output: {
      add: ["mirin", "rice vinegar", "sake"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Japanese ingredients",
    },
  },
  {
    input: "nehmen Sie die Milch weg",
    expected_output: {
      add: [],
      rm: ["milk"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "de",
      comment: "German removal",
    },
  },
  {
    input: "add quinoa couscous and bulgur",
    expected_output: {
      add: ["bulgur", "couscous", "quinoa"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Grains",
    },
  },
  {
    input: "the yogurt's funky get it out",
    expected_output: {
      add: [],
      rm: ["yogurt"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Colloquial bad smell",
    },
  },
  {
    input: "I have cashews almonds and walnuts",
    expected_output: {
      add: ["almond", "cashew", "walnut"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Nuts plural to singular",
    },
  },
  {
    input: "add coconut milk and coconut cream",
    expected_output: {
      add: ["coconut cream", "coconut milk"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Similar compound items",
    },
  },
  {
    input: "remove every single thing",
    expected_output: {
      add: [],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Emphatic but vague",
    },
  },
  {
    input: "I bought stuff",
    expected_output: {
      add: [],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Too vague",
    },
  },
  {
    input: "add thyme rosemary sage and oregano",
    expected_output: {
      add: ["oregano", "rosemary", "sage", "thyme"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Herbs",
    },
  },
  {
    input: "used the last of the ketchup",
    expected_output: {
      add: [],
      rm: ["ketchup"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Last portion depletion",
    },
  },
  {
    input: "I have ice cream cookies and cake like I'm having a party",
    expected_output: {
      add: ["cake", "cookie", "ice cream"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Context addition",
    },
  },
  {
    input: "add vanilla extract and almond extract",
    expected_output: {
      add: ["almond extract", "vanilla extract"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Extracts",
    },
  },
  {
    input: "bin the rotten potatoes",
    expected_output: {
      add: [],
      rm: ["potato"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "British 'bin' verb",
    },
  },
  {
    input: "I got serrano peppers jalapeños and habaneros",
    expected_output: {
      add: ["habanero", "jalapeño", "serrano pepper"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Peppers with accents",
    },
  },
  {
    input: "no more batteries",
    expected_output: {
      add: [],
      rm: ["battery"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Non-food singular test",
    },
  },
  {
    input: "add heavy cream half and half and whole milk",
    expected_output: {
      add: ["half and half", "heavy cream", "whole milk"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Dairy products",
    },
  },
  {
    input: "the bread's moldy the cheese is fuzzy remove both",
    expected_output: {
      add: [],
      rm: ["bread", "cheese"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Multiple reasons removal",
    },
  },
  {
    input: "I have chickpeas lentils and black beans",
    expected_output: {
      add: ["black bean", "chickpea", "lentil"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Legumes",
    },
  },
  {
    input: "add whatever the fuck you want I don't care",
    expected_output: {
      add: [],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Hostile vague",
    },
  },
  {
    input: "got maple syrup and agave nectar",
    expected_output: {
      add: ["agave nectar", "maple syrup"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Sweeteners",
    },
  },
  {
    input: "remove anchovies they're disgusting",
    expected_output: {
      add: [],
      rm: ["anchovy"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Opinion-based removal",
    },
  },
  {
    input: "I have literally so many eggs like way too many",
    expected_output: {
      add: ["egg"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Emphasis on quantity",
    },
  },
  {
    input: "add sunflower seeds pumpkin seeds and chia seeds",
    expected_output: {
      add: ["chia seed", "pumpkin seed", "sunflower seed"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Seeds",
    },
  },
  {
    input: "finished with the balsamic vinegar",
    expected_output: {
      add: [],
      rm: ["balsamic vinegar"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Formal depletion",
    },
  },
  {
    input: "tengo que añadir tomates",
    expected_output: {
      add: ["tomato"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "es",
      comment: "Spanish add",
    },
  },
  {
    input: "I have feta goat cheese and brie",
    expected_output: {
      add: ["brie", "feta", "goat cheese"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Fancy cheeses",
    },
  },
  {
    input: "add worcestershire sauce and hot sauce",
    expected_output: {
      add: ["hot sauce", "worcestershire sauce"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Sauces",
    },
  },
  {
    input: "no more paper towels dammit",
    expected_output: {
      add: [],
      rm: ["paper towel"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Frustrated non-food",
    },
  },
  {
    input: "got red wine white wine and beer",
    expected_output: {
      add: ["beer", "red wine", "white wine"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Alcohol",
    },
  },
  {
    input: "add flank steak sirloin and ribeye",
    expected_output: {
      add: ["flank steak", "ribeye", "sirloin"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Steak cuts",
    },
  },
  {
    input: "the lettuce is wilted toss it",
    expected_output: {
      add: [],
      rm: ["lettuce"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Quality-based removal",
    },
  },
  {
    input: "I think maybe I have nutmeg and cinnamon possibly",
    expected_output: {
      add: ["cinnamon", "nutmeg"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Spice uncertainty",
    },
  },
  {
    input: "add peanut butter and jelly",
    expected_output: {
      add: ["jelly", "peanut butter"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Classic combo",
    },
  },
  {
    input: "remove all dairy products",
    expected_output: {
      add: [],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Category removal - vague",
    },
  },
  {
    input: "I have hoisin sauce oyster sauce and soy sauce",
    expected_output: {
      add: ["hoisin sauce", "oyster sauce", "soy sauce"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Asian sauces",
    },
  },
  {
    input: "add asparagus Brussels sprouts and artichokes",
    expected_output: {
      add: ["artichoke", "asparagus", "brussels sprout"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Fancy vegetables",
    },
  },
  {
    input: "we finished the sriracha",
    expected_output: {
      add: [],
      rm: ["sriracha"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Plural subject depletion",
    },
  },
  {
    input: "got cranberries blueberries and strawberries",
    expected_output: {
      add: ["blueberry", "cranberry", "strawberry"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Berries",
    },
  },
  {
    input: "add breadcrumbs and panko",
    expected_output: {
      add: ["breadcrumb", "panko"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Coating ingredients",
    },
  },
  {
    input: "no más leche",
    expected_output: {
      add: [],
      rm: ["milk"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "es",
      comment: "Spanish no more",
    },
  },
  {
    input: "I have umm... let me think... crackers and chips",
    expected_output: {
      add: ["chip", "cracker"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Thinking pause",
    },
  },
  {
    input: "add dijon mustard and yellow mustard",
    expected_output: {
      add: ["dijon mustard", "yellow mustard"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Mustard types",
    },
  },
  {
    input: "the bananas are black throw them out",
    expected_output: {
      add: [],
      rm: ["banana"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Overripe removal",
    },
  },
  {
    input: "got ginger garlic and shallots",
    expected_output: {
      add: ["garlic", "ginger", "shallot"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Aromatics",
    },
  },
  {
    input: "add cornmeal cornstarch and corn flour",
    expected_output: {
      add: ["corn flour", "cornmeal", "cornstarch"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Corn products",
    },
  },
  {
    input: "used up all the damn butter",
    expected_output: {
      add: [],
      rm: ["butter"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Frustrated depletion",
    },
  },
  {
    input: "I have green beans wax beans and kidney beans",
    expected_output: {
      add: ["green bean", "kidney bean", "wax bean"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Bean varieties",
    },
  },
  {
    input: "add blackstrap molasses and honey",
    expected_output: {
      add: ["blackstrap molasses", "honey"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Viscous sweeteners",
    },
  },
  {
    input: "plus que de pain",
    expected_output: {
      add: [],
      rm: ["bread"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "fr",
      comment: "French no more",
    },
  },
  {
    input: "got smoked salmon and tuna",
    expected_output: {
      add: ["smoked salmon", "tuna"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Fish",
    },
  },
  {
    input: "add pie crust and phyllo dough",
    expected_output: {
      add: ["phyllo dough", "pie crust"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Dough types",
    },
  },
  {
    input: "the meat smells off remove it",
    expected_output: {
      add: [],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Vague meat removal",
    },
  },
  {
    input: "I have radicchio arugula and endive",
    expected_output: {
      add: ["arugula", "endive", "radicchio"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Bitter greens",
    },
  },
  {
    input: "add fucking everything on my list",
    expected_output: {
      add: [],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Hostile vague command",
    },
  },
  {
    input: "got zucchini squash eggplant",
    expected_output: {
      add: ["eggplant", "squash", "zucchini"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "No conjunctions",
    },
  },
  {
    input: "add brown sugar powdered sugar and granulated sugar",
    expected_output: {
      add: ["brown sugar", "granulated sugar", "powdered sugar"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Sugar types",
    },
  },
  {
    input: "no more green onions scallions whatever you call them",
    expected_output: {
      add: [],
      rm: ["green onion"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Synonym confusion",
    },
  },
  {
    input: "I have kalamata olives and green olives",
    expected_output: {
      add: ["green olive", "kalamata olive"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Olive types",
    },
  },
  {
    input: "add tahini and hummus",
    expected_output: {
      add: ["hummus", "tahini"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Chickpea products",
    },
  },
  {
    input: "ran out of the cooking spray",
    expected_output: {
      add: [],
      rm: ["cooking spray"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "With article",
    },
  },
  {
    input: "got lamb chops veal cutlets pork tenderloin",
    expected_output: {
      add: ["lamb chop", "pork tenderloin", "veal cutlet"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Expensive meats",
    },
  },
  {
    input: "add Israeli couscous and regular couscous",
    expected_output: {
      add: ["couscous", "israeli couscous"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Couscous types",
    },
  },
  {
    input: "the jam is crystallized get rid of it",
    expected_output: {
      add: [],
      rm: ["jam"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Texture issue removal",
    },
  },
  {
    input: "I have literally just salt",
    expected_output: {
      add: ["salt"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Minimal inventory",
    },
  },
  {
    input: "add wasabi ginger and ponzu",
    expected_output: {
      add: ["ginger", "ponzu", "wasabi"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Japanese condiments",
    },
  },
  {
    input: "finished all the almond milk",
    expected_output: {
      add: [],
      rm: ["almond milk"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Alternative milk",
    },
  },
  {
    input: "got sweet potatoes red potatoes and russet potatoes",
    expected_output: {
      add: ["red potato", "russet potato", "sweet potato"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Potato varieties",
    },
  },
  {
    input: "add dark chocolate and milk chocolate",
    expected_output: {
      add: ["dark chocolate", "milk chocolate"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Chocolate types",
    },
  },
  {
    input: "keine Eier mehr",
    expected_output: {
      add: [],
      rm: ["egg"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "de",
      comment: "German no more",
    },
  },
  {
    input: "I have monterey jack cheddar and swiss",
    expected_output: {
      add: ["cheddar", "monterey jack", "swiss"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Cheese types",
    },
  },
  {
    input: "add baby carrots and regular carrots",
    expected_output: {
      add: ["baby carrot", "carrot"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Carrot sizes",
    },
  },
  {
    input: "the celery is limp throw it away",
    expected_output: {
      add: [],
      rm: ["celery"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Texture-based removal",
    },
  },
  {
    input: "got cannellini beans navy beans great northern beans",
    expected_output: {
      add: ["cannellini bean", "great northern bean", "navy bean"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "White bean varieties",
    },
  },
  {
    input: "add pita bread naan and tortillas",
    expected_output: {
      add: ["naan", "pita bread", "tortilla"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Flatbreads",
    },
  },
  {
    input: "we're completely out of coffee",
    expected_output: {
      add: [],
      rm: ["coffee"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Emphasis on depletion",
    },
  },
  {
    input: "I have grape tomatoes cherry tomatoes roma tomatoes",
    expected_output: {
      add: ["cherry tomato", "grape tomato", "roma tomato"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Tomato varieties",
    },
  },
  {
    input: "add old bay and cajun seasoning",
    expected_output: {
      add: ["cajun seasoning", "old bay"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Regional seasonings",
    },
  },
  {
    input: "the cucumber is slimy gross remove it",
    expected_output: {
      add: [],
      rm: ["cucumber"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Disgust reaction",
    },
  },
  {
    input: "got salted butter and unsalted butter",
    expected_output: {
      add: ["salted butter", "unsalted butter"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Butter types",
    },
  },
  {
    input: "add whole wheat flour and all purpose flour",
    expected_output: {
      add: ["all purpose flour", "whole wheat flour"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Flour types",
    },
  },
  {
    input: "pas de beurre",
    expected_output: {
      add: [],
      rm: ["butter"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "fr",
      comment: "French no butter",
    },
  },
  {
    input: "I have absolutely nothing in here",
    expected_output: {
      add: [],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Empty fridge statement",
    },
  },
  {
    input: "add fucking milk finally",
    expected_output: {
      add: ["milk"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Relieved profanity",
    },
  },
  {
    input: "the strawberries have mold remove",
    expected_output: {
      add: [],
      rm: ["strawberry"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Short removal command",
    },
  },
  {
    input: "got portobello mushrooms shiitake cremini",
    expected_output: {
      add: ["cremini", "portobello mushroom", "shiitake"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Mushroom types",
    },
  },
  {
    input: "add red bell pepper yellow bell pepper orange bell pepper",
    expected_output: {
      add: ["orange bell pepper", "red bell pepper", "yellow bell pepper"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Pepper colors",
    },
  },
  {
    input: "we used everything up",
    expected_output: {
      add: [],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Complete depletion vague",
    },
  },
  {
    input: "I have jasmine rice basmati rice and brown rice",
    expected_output: {
      add: ["basmati rice", "brown rice", "jasmine rice"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Rice varieties",
    },
  },
  {
    input: "add green lentils red lentils and yellow lentils",
    expected_output: {
      add: ["green lentil", "red lentil", "yellow lentil"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Lentil colors",
    },
  },
  {
    input: "the cream cheese is hard as a rock remove it",
    expected_output: {
      add: [],
      rm: ["cream cheese"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Metaphor removal",
    },
  },
  {
    input: "got blood oranges navel oranges tangerines",
    expected_output: {
      add: ["blood orange", "navel orange", "tangerine"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Orange types",
    },
  },
  {
    input: "add smoked paprika sweet paprika hot paprika",
    expected_output: {
      add: ["hot paprika", "smoked paprika", "sweet paprika"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Paprika types",
    },
  },
  {
    input: "no tenemos aguacate",
    expected_output: {
      add: [],
      rm: ["avocado"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "es",
      comment: "Spanish we don't have",
    },
  },
  {
    input: "I have like maybe half a lemon",
    expected_output: {
      add: ["lemon"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Partial quantity",
    },
  },
  {
    input: "add chocolate sauce caramel sauce and strawberry sauce",
    expected_output: {
      add: ["caramel sauce", "chocolate sauce", "strawberry sauce"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Dessert sauces",
    },
  },
  {
    input: "the parsley is wilted and brown remove",
    expected_output: {
      add: [],
      rm: ["parsley"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Multiple quality issues",
    },
  },
  {
    input: "got red cabbage and green cabbage",
    expected_output: {
      add: ["green cabbage", "red cabbage"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Cabbage colors",
    },
  },
  {
    input: "add pine nuts pecans hazelnuts macadamia nuts",
    expected_output: {
      add: ["hazelnut", "macadamia nut", "pecan", "pine nut"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Fancy nuts",
    },
  },
  {
    input: "we're fresh out of eggs sorry",
    expected_output: {
      add: [],
      rm: ["egg"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Apologetic depletion",
    },
  },
  {
    input: "I have canned tomatoes crushed tomatoes diced tomatoes",
    expected_output: {
      add: ["canned tomato", "crushed tomato", "diced tomato"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Tomato preparations",
    },
  },
  {
    input: "add turkey bacon beef bacon and pork bacon",
    expected_output: {
      add: ["beef bacon", "pork bacon", "turkey bacon"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Bacon types",
    },
  },
  {
    input: "the mayo separated it's gross remove it",
    expected_output: {
      add: [],
      rm: ["mayo"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Separated emulsion",
    },
  },
  {
    input: "got poblano peppers anaheim peppers and bell peppers",
    expected_output: {
      add: ["anaheim pepper", "bell pepper", "poblano pepper"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Pepper varieties",
    },
  },
  {
    input: "add linguine fettuccine penne rigatoni",
    expected_output: {
      add: ["fettuccine", "linguine", "penne", "rigatoni"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Pasta shapes",
    },
  },
  {
    input: "keine Milch",
    expected_output: {
      add: [],
      rm: ["milk"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "de",
      comment: "German no milk",
    },
  },
  {
    input: "I have regular mayo and vegan mayo",
    expected_output: {
      add: ["mayo", "vegan mayo"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Mayo types",
    },
  },
  {
    input: "add shredded cheese sliced cheese and cream cheese",
    expected_output: {
      add: ["cream cheese", "shredded cheese", "sliced cheese"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Cheese forms",
    },
  },
  {
    input: "the cottage cheese smells funky toss it",
    expected_output: {
      add: [],
      rm: ["cottage cheese"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Smell-based removal",
    },
  },
  {
    input: "got vidalia onions red onions white onions and shallots",
    expected_output: {
      add: ["red onion", "shallot", "vidalia onion", "white onion"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Onion varieties",
    },
  },
  {
    input: "add bbq sauce teriyaki sauce and buffalo sauce",
    expected_output: {
      add: ["bbq sauce", "buffalo sauce", "teriyaki sauce"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Meat sauces",
    },
  },
  {
    input: "we've totally run out of garlic",
    expected_output: {
      add: [],
      rm: ["garlic"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Completely depleted",
    },
  },
  {
    input: "I have white vinegar apple cider vinegar red wine vinegar",
    expected_output: {
      add: ["apple cider vinegar", "red wine vinegar", "white vinegar"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Vinegar types",
    },
  },
  {
    input: "add instant coffee ground coffee and coffee beans",
    expected_output: {
      add: ["coffee bean", "ground coffee", "instant coffee"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Coffee forms",
    },
  },
  {
    input: "the sour cream is moldy obviously remove it",
    expected_output: {
      add: [],
      rm: ["sour cream"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Obvious removal",
    },
  },
  {
    input: "got chicken thighs chicken breasts and chicken wings",
    expected_output: {
      add: ["chicken breast", "chicken thigh", "chicken wing"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Chicken cuts",
    },
  },
  {
    input: "add jasmine tea green tea black tea",
    expected_output: {
      add: ["black tea", "green tea", "jasmine tea"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Tea varieties",
    },
  },
  {
    input: "pas de poulet",
    expected_output: {
      add: [],
      rm: ["chicken"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "fr",
      comment: "French no chicken",
    },
  },
  {
    input: "I have so fucking many cans of beans",
    expected_output: {
      add: ["bean"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Profane abundance",
    },
  },
  {
    input: "add salsa verde and salsa roja",
    expected_output: {
      add: ["salsa roja", "salsa verde"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Spanish salsas",
    },
  },
  {
    input: "the raspberries are mushy get them out",
    expected_output: {
      add: [],
      rm: ["raspberry"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Texture removal",
    },
  },
  {
    input: "got beef broth chicken broth vegetable broth",
    expected_output: {
      add: ["beef broth", "chicken broth", "vegetable broth"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Broth types",
    },
  },
  {
    input: "add pink salt black salt and sea salt",
    expected_output: {
      add: ["black salt", "pink salt", "sea salt"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Salt varieties",
    },
  },
  {
    input: "we don't have any more onions whatsoever",
    expected_output: {
      add: [],
      rm: ["onion"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Emphatic depletion",
    },
  },
  {
    input: "I have like I don't know maybe some weird cheese",
    expected_output: {
      add: ["cheese"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Vague uncertain",
    },
  },
  {
    input: "add sourdough bread wheat bread white bread",
    expected_output: {
      add: ["sourdough bread", "wheat bread", "white bread"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Bread types",
    },
  },
  {
    input: "the ham is slimy and discolored remove immediately",
    expected_output: {
      add: [],
      rm: ["ham"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Urgent food safety",
    },
  },
  {
    input: "got dill pickle relish and sweet pickle relish",
    expected_output: {
      add: ["dill pickle relish", "sweet pickle relish"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Relish types",
    },
  },
  {
    input: "add frozen peas frozen corn and frozen carrots",
    expected_output: {
      add: ["frozen carrot", "frozen corn", "frozen pea"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Frozen vegetables",
    },
  },
  {
    input: "no hay arroz",
    expected_output: {
      add: [],
      rm: ["rice"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "es",
      comment: "Spanish there is no",
    },
  },
  {
    input: "I have reduced fat milk and skim milk",
    expected_output: {
      add: ["reduced fat milk", "skim milk"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Milk fat levels",
    },
  },
  {
    input: "add ranch dressing italian dressing caesar dressing",
    expected_output: {
      add: ["caesar dressing", "italian dressing", "ranch dressing"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Salad dressings",
    },
  },
  {
    input: "the ground turkey went bad yesterday remove",
    expected_output: {
      add: [],
      rm: ["ground turkey"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Dated removal",
    },
  },
  {
    input: "got fingerling potatoes baby potatoes new potatoes",
    expected_output: {
      add: ["baby potato", "fingerling potato", "new potato"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Small potato types",
    },
  },
  {
    input: "add baking soda baking powder and cream of tartar",
    expected_output: {
      add: ["baking powder", "baking soda", "cream of tartar"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Leavening agents",
    },
  },
  {
    input: "j'ai besoin de retirer le pain",
    expected_output: {
      add: [],
      rm: ["bread"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "fr",
      comment: "French removal need",
    },
  },
  {
    input: "add I think like three or four different kinds of peppers",
    expected_output: {
      add: ["pepper"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Vague quantity and type",
    },
  },
  {
    input: "we ate all the goddamn pizza",
    expected_output: {
      add: [],
      rm: ["pizza"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Profane past consumption",
    },
  },
  {
    input: "agregar ajo y cebolla",
    expected_output: {
      add: ["garlic", "onion"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "es",
      comment: "Spanish add command",
    },
  },
  {
    input: "got some stuff from the farmers market umm heirloom tomatoes and fresh herbs",
    expected_output: {
      add: ["fresh herb", "heirloom tomato"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Farmers market with fillers",
    },
  },
  {
    input: "remove wait no actually keep the butter",
    expected_output: {
      add: [],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Self-correction cancellation",
    },
  },
  {
    input: "ich habe Kartoffeln und Zwiebeln gekauft",
    expected_output: {
      add: ["onion", "potato"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "de",
      comment: "German purchase past tense",
    },
  },
  {
    input: "the fuck is this expired yogurt doing here remove",
    expected_output: {
      add: [],
      rm: ["yogurt"],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Angry discovery removal",
    },
  },
  {
    input: "add a whole bunch of random shit for dinner",
    expected_output: {
      add: [],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Profane but too vague",
    },
  },
  {
    input: "got salmon tuna cod and halibut",
    expected_output: {
      add: ["cod", "halibut", "salmon", "tuna"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Multiple fish types",
    },
  },
  {
    input: "ajouter du beurre s'il vous plaît",
    expected_output: {
      add: ["butter"],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "fr",
      comment: "French polite request",
    },
  },
  {
    input: "need to remove like basically everything it's all bad",
    expected_output: {
      add: [],
      rm: [],
    },
    metadata: {
      version: 1,
      currentIngredients,
      input_locale: "en",
      comment: "Dramatic but non-specific",
    },
  },
];

export const DATASET: Dataset<DatasetItem> = {
  name: "ingredient-extractor-200",
  description:
    "200 multi-lingual test cases (en/es/fr/de) with edge cases (profanity, vague, mixed ops), voice input patterns",
  entries: DATASET_ENTRIES,
};
