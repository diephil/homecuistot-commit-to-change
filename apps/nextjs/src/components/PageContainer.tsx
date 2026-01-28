import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
}

/**
 * PageContainer - Consistent page layout wrapper
 *
 * Provides:
 * - Full-screen background with gradient
 * - Top-aligned content with horizontal padding
 * - Configurable max-width
 */
export function PageContainer({
  children,
  className,
  maxWidth = "4xl",
  gradientFrom = "from-amber-50",
  gradientVia = "via-orange-50",
  gradientTo = "to-yellow-50",
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
  };

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br py-6",
        gradientFrom,
        gradientVia,
        gradientTo,
        "dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900",
        className
      )}
    >
      <main className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", maxWidthClasses[maxWidth])}>
        {children}
      </main>
    </div>
  );
}
