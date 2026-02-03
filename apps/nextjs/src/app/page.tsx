import { Text } from "@/components/shared/Text";
import { Button } from "@/components/shared/Button";
import { Header } from "@/components/shared/Header";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-amber-50">
      <Header variant="landing" logoClickable={true} />

      {/* Hero Section */}
      <section className="py-12 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-yellow-200 to-cyan-200 opacity-50" />
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative">
          <div className="text-center space-y-6 md:space-y-8">
            <div className="inline-block bg-yellow-300 border-2 border-black px-4 md:px-6 py-2 md:rotate-2">
              <span className="text-sm md:text-xl font-black uppercase font-head">
                🤖 AI-Powered Voice Assistant for Home Cooks
              </span>
            </div>
            <Text as="h2" className="text-3xl md:text-7xl lg:text-8xl font-black uppercase leading-tight md:leading-none tracking-tight md:tracking-tighter md:transform md:-rotate-1 px-2">
              From &ldquo;What&rsquo;s in my fridge?&rdquo; to &ldquo;What&rsquo;s for dinner?&rdquo;
            </Text>
            <Text as="p" className="text-lg md:text-3xl font-black text-zinc-800 md:transform md:rotate-1">
              See what you can cook — instantly.
            </Text>
            <div className="pt-4 md:pt-8 flex justify-center px-4">
              <Button asChild size="lg" className="text-lg md:text-3xl px-8 md:px-16 py-5 md:py-8 bg-pink-400 hover:bg-pink-500 border-4 md:border-6 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] md:hover:translate-x-[4px] md:hover:translate-y-[4px] transition-all font-black uppercase md:transform md:-rotate-2">
                <Link href="/login">Get Started Free →</Link>
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
            <Text as="h3" className="text-2xl md:text-5xl font-black uppercase text-center mb-6 md:mb-10 md:transform md:rotate-1">
              The problem isn&rsquo;t cooking — it&rsquo;s deciding what to cook
            </Text>
            <Text as="p" className="text-center text-base md:text-2xl font-bold leading-relaxed">
              You have food. You know how to cook. But figuring out what to make? Exhausting. So you order takeout — again.
            </Text>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 md:py-28 border-b-4 md:border-b-8 border-black bg-gradient-to-br from-cyan-300 via-blue-300 to-cyan-300 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-24 h-24 md:w-40 md:h-40 bg-pink-400 border-3 md:border-4 border-black rotate-45 -translate-x-12 -translate-y-12 md:-translate-x-20 md:-translate-y-20 opacity-30" />
        <div className="absolute bottom-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-yellow-400 border-3 md:border-4 border-black -rotate-45 translate-x-16 translate-y-16 md:translate-x-24 md:translate-y-24 opacity-30" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
          <Text as="h3" className="text-3xl md:text-6xl font-black uppercase text-center mb-4 md:mb-6 md:transform md:-rotate-1">
            Three steps. Zero typing.
          </Text>
          <Text as="p" className="text-lg md:text-3xl font-bold text-center mb-8 md:mb-14 max-w-3xl mx-auto px-4">
            Voice-powered because your hands are full and your brain is tired.
          </Text>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 px-4">
            <div className="border-4 md:border-6 border-black bg-gradient-to-br from-pink-200 to-pink-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10 md:transform md:hover:-rotate-2 transition-transform">
              <div className="bg-yellow-400 border-3 md:border-4 border-black w-16 h-16 md:w-20 md:h-20 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 md:mb-6 transform -rotate-6">
                <div className="text-4xl md:text-5xl font-black font-head">01</div>
              </div>
              <Text as="h4" className="text-xl md:text-3xl font-black uppercase mb-3 md:mb-4 leading-tight">
                🎤 Say what you have
              </Text>
              <Text as="p" className="text-lg md:text-2xl font-bold leading-relaxed">
                Tap the mic: &ldquo;I got chicken, eggs, pasta, and some tomatoes.&rdquo; Done.
              </Text>
            </div>

            <div className="border-4 md:border-6 border-black bg-gradient-to-br from-yellow-200 to-yellow-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10 md:transform md:hover:rotate-2 transition-transform">
              <div className="bg-cyan-400 border-3 md:border-4 border-black w-16 h-16 md:w-20 md:h-20 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 md:mb-6 transform rotate-6">
                <div className="text-4xl md:text-5xl font-black font-head">02</div>
              </div>
              <Text as="h4" className="text-xl md:text-3xl font-black uppercase mb-3 md:mb-4 leading-tight">
                🍽️ Create your own cookbook
              </Text>
              <Text as="p" className="text-lg md:text-2xl font-bold leading-relaxed">
                &ldquo;I can make carbonara, stir-fry, shakshuka&hellip;&rdquo; Tell us what recipes you can cook. 
              </Text>
            </div>

            <div className="border-4 md:border-6 border-black bg-gradient-to-br from-cyan-200 to-cyan-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10 md:transform md:hover:-rotate-2 transition-transform">
              <div className="bg-pink-400 border-3 md:border-4 border-black w-16 h-16 md:w-20 md:h-20 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 md:mb-6 transform -rotate-6">
                <div className="text-4xl md:text-5xl font-black font-head">03</div>
              </div>
              <Text as="h4" className="text-xl md:text-3xl font-black uppercase mb-3 md:mb-4 leading-tight">
                ✅ See cookable recipies instantly
              </Text>
              <Text as="p" className="text-lg md:text-2xl font-bold leading-relaxed">
                Open the app → see what what you can cook now, no more thinking.
              </Text>
            </div>
          </div>
        </div>
      </section>

      {/* This isn't a recipe app Section */}
      <section className="py-12 md:py-28 border-b-4 md:border-b-8 border-black bg-gradient-to-br from-orange-300 via-orange-400 to-orange-300 relative overflow-hidden">
        <div className="absolute top-8 left-8 w-16 h-16 md:w-24 md:h-24 bg-cyan-400 border-3 md:border-4 border-black -rotate-12 opacity-50" />
        <div className="absolute bottom-8 right-8 w-20 h-20 md:w-32 md:h-32 bg-yellow-400 border-3 md:border-4 border-black rotate-12 opacity-50" />
        <div className="max-w-5xl mx-auto px-4 md:px-8 relative">
          <div className="bg-white border-4 md:border-8 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 md:p-16 md:transform md:-rotate-1">
            <Text as="h3" className="text-3xl md:text-6xl font-black uppercase text-center mb-4 md:mb-6 md:transform md:rotate-1">
              👨‍🍳 You know your recipes. We track what&rsquo;s possible.
            </Text>
            <Text as="p" className="text-center text-lg md:text-3xl font-bold leading-relaxed">
              One question: <em>Can I make it tonight with what I have?</em> You&rsquo;re the chef. We&rsquo;re just the inventory clerk.
            </Text>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 md:py-32 bg-gradient-to-br from-pink-400 via-orange-400 to-yellow-400 border-b-4 md:border-b-8 border-black">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center space-y-6 md:space-y-8">
            <Text as="h3" className="text-4xl md:text-7xl font-black uppercase leading-tight md:transform md:-rotate-2 px-4">
              Cook more. Order less.
            </Text>
            <Text as="p" className="text-xl md:text-3xl font-black">
              Every meal you cook instead of ordering is a win. We&rsquo;re here to remove the one barrier that makes takeout feel easier: the thinking.
            </Text>
            <Button asChild size="lg" className="text-2xl md:text-4xl px-10 md:px-20 py-6 md:py-10 bg-pink-400 hover:bg-pink-500 border-4 md:border-6 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] md:hover:translate-x-[6px] md:hover:translate-y-[6px] transition-all font-black uppercase md:transform md:rotate-2">
              <Link href="/login">Commit To Change - Let&rsquo;s Go!</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
