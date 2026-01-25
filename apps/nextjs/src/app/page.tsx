import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-amber-50 dark:from-zinc-900 dark:to-zinc-800">
      {/* Header */}
      <header className="border-b-4 md:border-b-8 border-black bg-gradient-to-r from-pink-400 via-orange-400 to-yellow-400 dark:bg-pink-600 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between py-3 md:py-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-yellow-300 border-3 md:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-2xl md:text-4xl md:rotate-3 hover:rotate-0 transition-transform">
                🍳
              </div>
              <div className="flex flex-col">
                <Text as="h1" className="text-xl md:text-4xl font-black uppercase tracking-tight md:transform md:-rotate-1">
                  HomeCuistot
                </Text>
                <span className="text-xs md:text-sm font-bold lowercase opacity-80">
                  (French: &ldquo;Home Chef&rdquo;)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <Button asChild variant="outline" size="sm" className="border-3 md:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] md:hover:translate-x-[2px] md:hover:translate-y-[2px] transition-all font-black text-xs md:text-sm px-2 md:px-3">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="default" size="sm" className="bg-cyan-300 hover:bg-cyan-400 border-3 md:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] md:hover:translate-x-[2px] md:hover:translate-y-[2px] transition-all font-black text-xs md:text-sm px-2 md:px-3">
                <Link href="/app">Go to App</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-yellow-200 to-cyan-200 opacity-50" />
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative">
          <div className="text-center space-y-6 md:space-y-8">
            <div className="inline-block bg-yellow-300 border-4 md:border-6 border-black px-4 md:px-6 py-2 md:rotate-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-sm md:text-xl font-black uppercase font-head">
                🤖 AI-Powered Voice Assistant for Home Cooks
              </span>
            </div>
            <Text as="h2" className="text-3xl md:text-7xl lg:text-8xl font-black uppercase leading-tight md:leading-none tracking-tight md:tracking-tighter md:transform md:-rotate-1 px-2">
              From &ldquo;What&rsquo;s in my fridge?&rdquo; to &ldquo;What&rsquo;s for dinner?&rdquo;
            </Text>
            <Text as="p" className="text-lg md:text-3xl font-black text-zinc-800 md:transform md:rotate-1">
              Just talk to the app. 🎤
            </Text>
            <div className="pt-4 md:pt-8 flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-stretch sm:items-center px-4">
              <Button asChild size="lg" className="text-lg md:text-3xl px-8 md:px-16 py-5 md:py-8 bg-pink-400 hover:bg-pink-500 border-4 md:border-6 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] md:hover:translate-x-[4px] md:hover:translate-y-[4px] transition-all font-black uppercase md:transform md:-rotate-2">
                <Link href="/login">Get Started Free →</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base md:text-2xl px-6 md:px-12 py-5 md:py-8 bg-white border-4 md:border-6 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[4px] md:hover:translate-y-[4px] transition-all font-black uppercase md:transform md:rotate-1">
                <Link href="#how-it-works">See How It Works ↓</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Origin Section */}
      <section className="py-12 md:py-28 border-t-4 md:border-t-8 border-b-4 md:border-b-8 border-black bg-gradient-to-r from-orange-300 via-orange-400 to-orange-300 relative overflow-hidden">
        <div className="absolute top-8 left-8 w-16 h-16 md:w-24 md:h-24 bg-yellow-400 border-3 md:border-4 border-black rotate-12 opacity-50" />
        <div className="absolute bottom-8 right-8 w-20 h-20 md:w-32 md:h-32 bg-pink-400 border-3 md:border-4 border-black -rotate-12 opacity-50" />
        <div className="max-w-5xl mx-auto px-4 md:px-8 relative">
          <div className="bg-white border-4 md:border-8 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 md:p-16 md:transform md:-rotate-1">
            <Text as="h3" className="text-3xl md:text-6xl font-black uppercase text-center mb-6 md:mb-10 md:transform md:rotate-1">
              😩 The Problem
            </Text>
            <div className="space-y-4 md:space-y-6 text-center text-base md:text-2xl font-bold">
              <Text as="p" className="leading-relaxed">
                You come home hungry. You stare at your fridge. You have ingredients, some cooking skills, but no idea what to make.
                You don&rsquo;t want to meal plan. You just want to eat and move on.
              </Text>
              <div className="bg-yellow-200 border-4 md:border-6 border-black p-4 md:p-6 inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:transform md:rotate-2">
                <Text as="p" className="text-2xl md:text-4xl font-black">
                  Sound familiar? 🤔
                </Text>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 md:py-28 border-b-4 md:border-b-8 border-black bg-gradient-to-br from-cyan-300 via-blue-300 to-cyan-300 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-24 h-24 md:w-40 md:h-40 bg-pink-400 border-3 md:border-4 border-black rotate-45 -translate-x-12 -translate-y-12 md:-translate-x-20 md:-translate-y-20 opacity-30" />
        <div className="absolute bottom-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-yellow-400 border-3 md:border-4 border-black -rotate-45 translate-x-16 translate-y-16 md:translate-x-24 md:translate-y-24 opacity-30" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
          <Text as="h3" className="text-3xl md:text-6xl font-black uppercase text-center mb-4 md:mb-6 md:transform md:-rotate-1">
            ✨ How It Works
          </Text>
          <Text as="p" className="text-base md:text-2xl font-bold text-center mb-8 md:mb-14 max-w-3xl mx-auto px-4">
            Voice-powered meal planning. Just talk. Three simple steps, zero typing.
          </Text>

          {/* Demo Video Placeholder */}
          <div className="mb-10 md:mb-16 max-w-5xl mx-auto px-4">
            <div className="bg-zinc-900 border-4 md:border-8 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] aspect-video flex items-center justify-center md:transform md:-rotate-1">
              <div className="text-center space-y-3 md:space-y-4">
                <div className="text-5xl md:text-8xl">🎬</div>
                <Text as="p" className="text-white text-lg md:text-2xl font-black uppercase px-4">
                  Demo Video Coming Soon
                </Text>
                <div className="flex gap-2 md:gap-3 justify-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-pink-400 border-3 md:border-4 border-black rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[8px] md:border-l-[12px] border-l-black border-t-[6px] md:border-t-[8px] border-t-transparent border-b-[6px] md:border-b-[8px] border-b-transparent ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 px-4">
            <div className="border-4 md:border-6 border-black bg-gradient-to-br from-pink-200 to-pink-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10 md:transform md:hover:-rotate-2 transition-transform">
              <div className="bg-yellow-400 border-3 md:border-4 border-black w-16 h-16 md:w-20 md:h-20 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 md:mb-6 transform -rotate-6">
                <div className="text-4xl md:text-5xl font-black font-head">01</div>
              </div>
              <Text as="h4" className="text-xl md:text-3xl font-black uppercase mb-3 md:mb-4 leading-tight">
                📦 Collect Ingredients
              </Text>
              <Text as="p" className="text-base md:text-xl font-bold leading-relaxed">
                Tell us what&rsquo;s in your fridge. &ldquo;Chicken, eggs, pasta, tomatoes&hellip;&rdquo;
              </Text>
            </div>

            <div className="border-4 md:border-6 border-black bg-gradient-to-br from-yellow-200 to-yellow-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10 md:transform md:hover:rotate-2 transition-transform">
              <div className="bg-cyan-400 border-3 md:border-4 border-black w-16 h-16 md:w-20 md:h-20 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 md:mb-6 transform rotate-6">
                <div className="text-4xl md:text-5xl font-black font-head">02</div>
              </div>
              <Text as="h4" className="text-xl md:text-3xl font-black uppercase mb-3 md:mb-4 leading-tight">
                📖 Build Your Cookbook
              </Text>
              <Text as="p" className="text-base md:text-xl font-bold leading-relaxed">
                Tell us what dishes you can cook. &ldquo;Pasta carbonara, chicken stir-fry&hellip;&rdquo; We&rsquo;ll remember.
              </Text>
            </div>

            <div className="border-4 md:border-6 border-black bg-gradient-to-br from-cyan-200 to-cyan-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10 md:transform md:hover:-rotate-2 transition-transform">
              <div className="bg-pink-400 border-3 md:border-4 border-black w-16 h-16 md:w-20 md:h-20 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 md:mb-6 transform -rotate-6">
                <div className="text-4xl md:text-5xl font-black font-head">03</div>
              </div>
              <Text as="h4" className="text-xl md:text-3xl font-black uppercase mb-3 md:mb-4 leading-tight">
                🍳 Cook More
              </Text>
              <Text as="p" className="text-base md:text-xl font-bold leading-relaxed">
                We tell you what to cook right now via instant recipe matching, zero thinking.
              </Text>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 md:py-32 bg-gradient-to-br from-pink-400 via-orange-400 to-yellow-400 border-b-4 md:border-b-8 border-black">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center space-y-6 md:space-y-8">
            <Text as="h3" className="text-4xl md:text-7xl font-black uppercase leading-tight md:transform md:-rotate-2 px-4">
              Ready to stop ordering takeout? 🚀
            </Text>
            <Text as="p" className="text-xl md:text-3xl font-black">
              Start cooking smarter after a rapid onboarding
            </Text>
            <Button asChild size="lg" className="text-2xl md:text-4xl px-10 md:px-20 py-6 md:py-10 bg-cyan-300 hover:bg-cyan-400 border-4 md:border-6 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] md:hover:translate-x-[6px] md:hover:translate-y-[6px] transition-all font-black uppercase md:transform md:rotate-2">
              <Link href="/login">Let&rsquo;s Go! 🍳</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 md:py-8 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center">
            <Text as="p" className="font-black text-base md:text-lg">
              Made with ❤️ for home cooks everywhere
            </Text>
          </div>
        </div>
      </footer>
    </div>
  );
}
