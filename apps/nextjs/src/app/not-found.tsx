import { Button } from "@/components/retroui/Button";
import { Text } from "@/components/retroui/Text";
import { PageContainer } from "@/components/PageContainer";
import { Home, Search, ChefHat, Package, Lightbulb } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <PageContainer
      maxWidth="lg"
      gradientFrom="from-purple-200"
      gradientVia="via-pink-200"
      gradientTo="to-orange-200"
    >
      {/* Decorative background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 md:w-32 md:h-32 bg-purple-400 border-3 md:border-4 border-black opacity-30 md:transform md:rotate-12" />
        <div className="absolute bottom-20 right-10 w-24 h-24 md:w-40 md:h-40 bg-pink-400 border-3 md:border-4 border-black opacity-30 md:transform md:-rotate-6" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 md:w-28 md:h-28 bg-orange-400 border-3 md:border-4 border-black opacity-30 md:transform md:rotate-45" />
      </div>

      {/* Main 404 card */}
      <div className="relative border-4 md:border-6 border-black bg-gradient-to-br from-purple-300 to-pink-300
        shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]
        p-6 md:p-10 md:transform md:-rotate-1 transition-all
        hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
        hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[4px] md:hover:translate-y-[4px]">

        <div className="flex flex-col items-center gap-6 md:gap-8 text-center">
          {/* 404 badge */}
          <div className="bg-pink-400 border-3 md:border-4 border-black px-6 py-3 md:px-8 md:py-4
            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
            md:transform md:rotate-2">
            <Text as="h1" className="text-5xl md:text-7xl font-black uppercase">
              404
            </Text>
          </div>

          {/* Heading section */}
          <div>
            <Text as="h2" className="text-2xl md:text-4xl font-black uppercase mb-2 md:mb-3 leading-tight tracking-tight">
              Recipe Not Found!
            </Text>
            <Text as="p" className="text-base md:text-xl font-bold">
              Looks like this page went back to the pantry.
            </Text>
          </div>

          {/* Navigation options */}
          <div className="w-full space-y-3 md:space-y-4">
            <Text as="p" className="text-sm md:text-base font-bold uppercase">
              Where would you like to go?
            </Text>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <Button
                asChild
                variant="default"
                size="lg"
                className="justify-center gap-3 bg-cyan-400 hover:bg-cyan-500 border-4 border-black font-black uppercase text-sm md:text-base
                  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                  hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                  hover:translate-x-[2px] hover:translate-y-[2px]
                  transition-all md:transform md:hover:rotate-1 py-5 md:py-6"
              >
                <Link href="/">
                  <Home className="h-5 w-5 md:h-6 md:w-6" />
                  Home
                </Link>
              </Button>

              <Button
                asChild
                variant="default"
                size="lg"
                className="justify-center gap-3 bg-yellow-400 hover:bg-yellow-500 border-4 border-black font-black uppercase text-sm md:text-base
                  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                  hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                  hover:translate-x-[2px] hover:translate-y-[2px]
                  transition-all md:transform md:hover:-rotate-1 py-5 md:py-6"
              >
                <Link href="/recipes">
                  <ChefHat className="h-5 w-5 md:h-6 md:w-6" />
                  Recipes
                </Link>
              </Button>

              <Button
                asChild
                variant="secondary"
                size="lg"
                className="justify-center gap-3 bg-pink-400 hover:bg-pink-500 border-4 border-black font-black uppercase text-sm md:text-base
                  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                  hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                  hover:translate-x-[2px] hover:translate-y-[2px]
                  transition-all md:transform md:hover:rotate-1 py-5 md:py-6"
              >
                <Link href="/inventory">
                  <Package className="h-5 w-5 md:h-6 md:w-6" />
                  Inventory
                </Link>
              </Button>

              <Button
                asChild
                variant="secondary"
                size="lg"
                className="justify-center gap-3 bg-orange-400 hover:bg-orange-500 border-4 border-black font-black uppercase text-sm md:text-base
                  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                  hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                  hover:translate-x-[2px] hover:translate-y-[2px]
                  transition-all md:transform md:hover:-rotate-1 py-5 md:py-6"
              >
                <Link href="/suggestions">
                  <Lightbulb className="h-5 w-5 md:h-6 md:w-6" />
                  Suggestions
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
