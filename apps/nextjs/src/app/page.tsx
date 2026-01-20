import { Text } from "@/components/retroui/Text";
import { Badge } from "@/components/retroui/Badge";
import { Button } from "@/components/retroui/Button";
import { PageContainer } from "@/components/PageContainer";
import Link from "next/link";

export default function Home() {
  return (
    <PageContainer maxWidth="2xl">
      <div className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 md:p-12 dark:bg-zinc-800 dark:border-zinc-700">
          <div className="flex flex-col items-center gap-8 text-center">
            <Badge variant="solid" size="lg" className="text-xl">
              🍳 HomeCuistot
            </Badge>

            <div className="space-y-3">
              <Text as="h2" className="leading-tight">
                Know what you have
              </Text>
              <Text as="h3" className="text-muted-foreground leading-tight">
                Know what you can cook
              </Text>
              <Text as="h4" className="text-muted-foreground">
                Eat better without thinking
              </Text>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-4">
              <div className="border-2 border-black p-4 bg-amber-100 dark:bg-zinc-700">
                <Text as="h4" className="mb-2 text-lg font-bold">📦 Track</Text>
                <Text as="p" className="text-base text-muted-foreground">
                  Your ingredients
                </Text>
              </div>

              <div className="border-2 border-black p-4 bg-orange-100 dark:bg-zinc-700">
                <Text as="h4" className="mb-2 text-lg font-bold">🍲 Discover</Text>
                <Text as="p" className="text-base text-muted-foreground">
                  Recipes you can make
                </Text>
              </div>

              <div className="border-2 border-black p-4 bg-yellow-100 dark:bg-zinc-700">
                <Text as="h4" className="mb-2 text-lg font-bold">✨ Plan</Text>
                <Text as="p" className="text-base text-muted-foreground">
                  Your meals ahead
                </Text>
              </div>
            </div>

            <Button asChild variant="default" size="lg" className="mt-4">
              <Link href="/login">
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </PageContainer>
  );
}
