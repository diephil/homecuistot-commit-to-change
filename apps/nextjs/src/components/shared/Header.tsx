import { Button } from "./Button";
import { Logo } from "./Logo";
import Link from "next/link";

interface HeaderProps {
  /**
   * Variant determines which buttons to show
   * - "landing": Shows Login + Go to App buttons
   * - "login": Shows only Go to App button
   * - "app": Shows app-specific content (for future use)
   */
  variant?: "landing" | "login" | "app";
  /**
   * Whether the logo should link to home page
   */
  logoClickable?: boolean;
}

export function Header({ variant = "landing", logoClickable = false }: HeaderProps) {
  return (
    <header className="border-b-4 md:border-b-8 border-black bg-gradient-to-r from-pink-400 via-orange-400 to-yellow-400 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between py-3 md:py-6">
          <Logo href={logoClickable ? "/" : undefined} />

          <div className="flex items-center gap-2 md:gap-4">
            {variant === "landing" && (
              <Button
                asChild
                variant="default"
                size="sm"
                className="bg-pink-400 hover:bg-pink-500 border-3 md:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] md:hover:translate-x-[2px] md:hover:translate-y-[2px] transition-all font-black text-xs md:text-sm px-2 md:px-3"
              >
                <Link href="/app">Go to App</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
