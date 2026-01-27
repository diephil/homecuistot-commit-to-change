"use client";

type VoiceGuidanceContext = "inventory" | "recipe";

interface VoiceGuidanceProps {
  context?: VoiceGuidanceContext;
}

const GUIDANCE_CONFIG = {
  inventory: {
    description: "Update multiple ingredients at once using natural language:",
    examples: [
      "I just bought milk and eggs",
      "Running low on tomatoes",
      "Ran out of cheese and onions",
      "Have plenty of pasta",
    ],
  },
  recipe: {
    description: "Describe recipes you know how to cook using natural language:",
    examples: [
      "I can cook pasta carbonara. I use eggs, bacon, and Parmesan.",
      "My go-to is chicken stir-fry with broccoli, soy sauce, and garlic.",
      "I make a simple tomato soup with onions, garlic, tomatoes, and basil.",
      "For breakfast I often make scrambled eggs with cheese and chives.",
    ],
  },
};

export function VoiceGuidance({ context = "inventory" }: VoiceGuidanceProps) {
  const config = GUIDANCE_CONFIG[context];

  return (
    <div className="p-4 bg-blue-100 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded">
      <h3 className="text-lg font-black mb-3 flex items-center gap-2">
        <span className="text-xl">🎙️</span> Voice Input Examples
      </h3>
      <p className="text-sm font-medium mb-3">
        {config.description}
      </p>
      <ul className="space-y-1.5 text-sm font-medium pl-4">
        {config.examples.map((example, index) => (
          <li
            key={index}
            className="before:content-['•'] before:mr-2 before:text-blue-600 before:font-black"
          >
            &ldquo;{example}&rdquo;
          </li>
        ))}
      </ul>
    </div>
  );
}
