import { Text } from "@/components/shared/Text";
import { Button } from "@/components/shared/Button";
import { Header } from "@/components/shared/Header";
import { LandingRecipeCard } from "@/components/landing/LandingRecipeCard";
import Link from "next/link";

const LANDING_RECIPES = [
  {
    name: "Pasta Carbonara",
    description: "Classic carbonara with eggs, bacon, and parmesan",
    status: "cookable" as const,
    ingredients: [
      { name: "Pasta", type: "anchor" as const, available: true },
      { name: "Bacon", type: "anchor" as const, available: true },
      { name: "Egg", type: "anchor" as const, available: true },
      { name: "Parmesan", type: "anchor" as const, available: true },
      { name: "Olive oil", type: "anchor" as const, available: true },
      { name: "Salt", type: "optional" as const, available: true },
    ],
  },
  {
    name: "Chicken Stir-Fry",
    description: "Quick stir-fry with vegetables and soy sauce",
    status: "almost" as const,
    ingredients: [
      { name: "Chicken", type: "anchor" as const, available: true },
      { name: "Rice", type: "anchor" as const, available: true },
      { name: "Soy sauce", type: "anchor" as const, available: false },
      { name: "Green Onion", type: "anchor" as const, available: true },
      { name: "Garlic", type: "optional" as const, available: true },
      { name: "Ginger", type: "optional" as const, available: true },
    ],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-amber-50">
      <Header variant="landing" logoClickable={true} />

      {/* Section 1 — Hero */}
      <section className="py-12 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-yellow-200 to-cyan-200 opacity-50" />
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative">
          <div className="text-center space-y-6 md:space-y-8">
            <div className="inline-block bg-yellow-300 border-2 border-black px-4 md:px-6 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:rotate-2">
              <span className="text-sm md:text-xl font-black uppercase font-head">
                Stop scrolling. Start cooking.
              </span>
            </div>
            <Text as="h2" className="text-3xl md:text-7xl lg:text-8xl font-black uppercase leading-tight md:leading-none tracking-tight md:tracking-tighter md:transform md:-rotate-1 px-2">
              Your kitchen already knows what&rsquo;s for dinner
            </Text>
            <Text as="p" className="text-lg md:text-3xl font-black text-zinc-800 md:transform md:rotate-1">
              You have 15 go-to dishes and a fridge full of ingredients. HomeCuistot connects the two.
            </Text>
            <div className="pt-4 md:pt-8 flex justify-center px-4">
              <Button asChild size="lg" className="text-lg md:text-3xl px-8 md:px-16 py-5 md:py-8 bg-pink-400 hover:bg-pink-500 border-4 md:border-6 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] md:hover:translate-x-[4px] md:hover:translate-y-[4px] transition-all font-black uppercase md:transform md:-rotate-2">
                <Link href="/login">Start with your recipes &rarr;</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — The Reframe */}
      <section className="py-12 md:py-28 border-t-4 md:border-t-8 border-b-4 md:border-b-8 border-black bg-gradient-to-r from-orange-300 via-orange-400 to-orange-300 relative overflow-hidden">
        <div className="absolute top-8 left-8 w-16 h-16 md:w-24 md:h-24 bg-yellow-400 border-3 md:border-4 border-black rotate-12 opacity-50" />
        <div className="absolute bottom-8 right-8 w-20 h-20 md:w-32 md:h-32 bg-pink-400 border-3 md:border-4 border-black -rotate-12 opacity-50" />
        <div className="max-w-5xl mx-auto px-4 md:px-8 relative">
          <div className="bg-white border-4 md:border-8 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 md:p-16 md:transform md:-rotate-1">
            <Text as="h3" className="text-2xl md:text-5xl font-black uppercase text-center mb-6 md:mb-10 md:transform md:rotate-1">
              You know those 10&ndash;15 dinners you rotate through?
            </Text>
            <Text as="p" className="text-center text-base md:text-2xl font-bold leading-relaxed">
              The ones you could make in your sleep? HomeCuistot is the only app that starts there &mdash; with your dishes, not someone else&rsquo;s. Tell it what you cook, keep your kitchen updated, and it shows you which of your meals are ready tonight.
            </Text>
          </div>
        </div>
      </section>

      {/* Section 3 — Anti-Positioning */}
      <section className="py-12 md:py-28 border-b-4 md:border-b-8 border-black bg-gradient-to-br from-cyan-300 via-blue-300 to-cyan-300 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-24 h-24 md:w-40 md:h-40 bg-pink-400 border-3 md:border-4 border-black rotate-45 -translate-x-12 -translate-y-12 md:-translate-x-20 md:-translate-y-20 opacity-30" />
        <div className="absolute bottom-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-yellow-400 border-3 md:border-4 border-black -rotate-45 translate-x-16 translate-y-16 md:translate-x-24 md:translate-y-24 opacity-30" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
          <Text as="h3" className="text-3xl md:text-6xl font-black uppercase text-center mb-8 md:mb-14 md:transform md:-rotate-1">
            What makes this different
          </Text>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 px-4">
            {/* Recipe Apps column — first on all screens */}
            <div className="border-4 md:border-6 border-black bg-gray-100 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10">
              <Text as="h4" className="text-xl md:text-3xl font-black uppercase text-gray-600 mb-4 md:mb-6">
                ❌ Recipe Apps
              </Text>
              <ul className="space-y-3">
                <li className="text-lg md:text-2xl font-bold text-gray-600 line-through decoration-red-400/50 decoration-3">Browse 2 million recipes</li>
                <li className="text-lg md:text-2xl font-bold text-gray-600 line-through decoration-red-400/50 decoration-3">Scan receipts to track inventory</li>
                <li className="text-lg md:text-2xl font-bold text-gray-600 line-through decoration-red-400/50 decoration-3">Suggest strangers&rsquo; dishes</li>
                <li className="text-lg md:text-2xl font-bold text-gray-600 line-through decoration-red-400/50 decoration-3">You open the app, you scroll</li>
              </ul>
            </div>

            {/* HomeCuistot column — second on all screens */}
            <div className="border-4 md:border-6 border-black bg-gradient-to-br from-green-200 to-green-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10">
              <Text as="h4" className="text-xl md:text-3xl font-black uppercase mb-4 md:mb-6">
                ✅ HomeCuistot
              </Text>
              <ul className="space-y-3">
                <li className="text-lg md:text-2xl font-bold">Your 15 go-to dishes</li>
                <li className="text-lg md:text-2xl font-bold">Update inventory by voice in seconds</li>
                <li className="text-lg md:text-2xl font-bold">Only your own recipes, ever</li>
                <li className="text-lg md:text-2xl font-bold">Open the app, see what&rsquo;s ready</li>
              </ul>
            </div>
          </div>

          <Text as="p" className="text-xl md:text-3xl font-black text-center mt-8 md:mt-14">
            Your dishes. Your inventory. Suggestions from strangers, never.
          </Text>
        </div>
      </section>

      {/* Section 4 — How It Works */}
      <section id="how-it-works" className="py-12 md:py-28 border-b-4 md:border-b-8 border-black bg-gradient-to-br from-orange-300 via-orange-400 to-orange-300 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-24 h-24 md:w-40 md:h-40 bg-cyan-400 border-3 md:border-4 border-black rotate-45 -translate-x-12 -translate-y-12 md:-translate-x-20 md:-translate-y-20 opacity-30" />
        <div className="absolute bottom-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-yellow-400 border-3 md:border-4 border-black -rotate-45 translate-x-16 translate-y-16 md:translate-x-24 md:translate-y-24 opacity-30" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
          <Text as="h3" className="text-3xl md:text-6xl font-black uppercase text-center mb-4 md:mb-6 md:transform md:-rotate-1">
            Three steps. Your voice. That&rsquo;s it.
          </Text>
          <Text as="p" className="text-lg md:text-3xl font-bold text-center mb-8 md:mb-14 max-w-3xl mx-auto px-4">
            Your hands are full and your brain is tired. Just talk.
          </Text>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 px-4">
            <div className="border-4 md:border-6 border-black bg-gradient-to-br from-pink-200 to-pink-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10 md:transform md:hover:-rotate-2 transition-transform">
              <div className="bg-yellow-400 border-3 md:border-4 border-black w-16 h-16 md:w-20 md:h-20 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 md:mb-6 transform -rotate-6">
                <div className="text-4xl md:text-5xl font-black font-head">01</div>
              </div>
              <Text as="h4" className="text-xl md:text-3xl font-black uppercase mb-3 md:mb-4 leading-tight">
                🎤 Tell us what you cook
              </Text>
              <Text as="p" className="text-lg md:text-2xl font-bold leading-relaxed">
                &ldquo;I make carbonara, stir-fry, shakshuka&hellip;&rdquo; Add the dishes you already know by voice.
              </Text>
            </div>

            <div className="border-4 md:border-6 border-black bg-gradient-to-br from-yellow-200 to-yellow-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10 md:transform md:hover:rotate-2 transition-transform">
              <div className="bg-cyan-400 border-3 md:border-4 border-black w-16 h-16 md:w-20 md:h-20 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 md:mb-6 transform rotate-6">
                <div className="text-4xl md:text-5xl font-black font-head">02</div>
              </div>
              <Text as="h4" className="text-xl md:text-3xl font-black uppercase mb-3 md:mb-4 leading-tight">
                🛒 Keep your kitchen current
              </Text>
              <Text as="p" className="text-lg md:text-2xl font-bold leading-relaxed">
                &ldquo;I just bought eggs, parmesan and bananas.&rdquo; Update your inventory by voice after shopping.
              </Text>
            </div>

            <div className="border-4 md:border-6 border-black bg-gradient-to-br from-cyan-200 to-cyan-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10 md:transform md:hover:-rotate-2 transition-transform">
              <div className="bg-pink-400 border-3 md:border-4 border-black w-16 h-16 md:w-20 md:h-20 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 md:mb-6 transform -rotate-6">
                <div className="text-4xl md:text-5xl font-black font-head">03</div>
              </div>
              <Text as="h4" className="text-xl md:text-3xl font-black uppercase mb-3 md:mb-4 leading-tight">
                ✅ See what&rsquo;s ready tonight
              </Text>
              <Text as="p" className="text-lg md:text-2xl font-bold leading-relaxed">
                Open the app &mdash; HomeCuistot shows you which of your dishes you can cook right now.
              </Text>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 — Product Demo */}
      <section className="py-12 md:py-28 border-b-4 md:border-b-8 border-black bg-gradient-to-br from-pink-200 via-yellow-100 to-cyan-200 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
          <Text as="h3" className="text-3xl md:text-6xl font-black uppercase text-center mb-4 md:mb-6 md:transform md:-rotate-1">
            Your recipes. Your ingredients. Instant answers.
          </Text>
          <Text as="p" className="text-lg md:text-3xl font-bold text-center mb-8 md:mb-14 max-w-3xl mx-auto px-4">
            This is what HomeCuistot looks like when you open it.
          </Text>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 px-4 max-w-4xl mx-auto">
            {LANDING_RECIPES.map((recipe) => (
              <LandingRecipeCard
                key={recipe.name}
                name={recipe.name}
                description={recipe.description}
                ingredients={recipe.ingredients}
                status={recipe.status}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section 6 — Sam Story Teaser */}
      <section className="py-12 md:py-28 border-b-4 md:border-b-8 border-black bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8 relative">
          <div className="bg-white border-4 md:border-8 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 md:p-16 md:transform md:-rotate-1">
            <div className="space-y-4 md:space-y-6 mb-6 md:mb-10">
              <Text as="p" className="text-lg md:text-2xl font-black">
                5:47pm. Office.
              </Text>
              <Text as="p" className="text-base md:text-xl font-bold text-black/80">
                Sam&rsquo;s New Year&rsquo;s resolution: cook more. It&rsquo;s not going great.
              </Text>
              <Text as="p" className="text-base md:text-xl font-bold text-black/80">
                He opens HomeCuistot instead.
              </Text>
            </div>
            <div className="flex justify-center">
              <Button asChild size="md" className="text-base md:text-xl px-6 md:px-10 py-3 md:py-5 bg-yellow-400 hover:bg-yellow-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-black uppercase">
                <Link href="/login">See Sam&rsquo;s story &rarr;</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7 — Final CTA */}
      <section className="py-12 md:py-32 bg-gradient-to-br from-pink-400 via-orange-400 to-yellow-400 border-b-4 md:border-b-8 border-black">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center space-y-6 md:space-y-8">
            <Text as="h3" className="text-4xl md:text-7xl font-black uppercase leading-tight md:transform md:-rotate-2 px-4">
              Your dishes. Your kitchen. Always knowing what&rsquo;s for dinner.
            </Text>
            <Text as="p" className="text-xl md:text-3xl font-black">
              Every meal you cook instead of ordering is a win. We just remove the thinking.
            </Text>
            <Button asChild size="lg" className="text-2xl md:text-4xl px-10 md:px-20 py-6 md:py-10 bg-pink-400 hover:bg-pink-500 border-4 md:border-6 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] md:hover:translate-x-[6px] md:hover:translate-y-[6px] transition-all font-black uppercase md:transform md:rotate-2">
              <Link href="/login">Start with your recipes &rarr;</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
