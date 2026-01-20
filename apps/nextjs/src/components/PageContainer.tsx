import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
}

/**
 * PageContainer - Consistent page layout wrapper
 *
 * Provides:
 * - Full-screen background with gradient
 * - Centered content with horizontal padding
 * - Configurable max-width
 *
 * Usage:
 * <PageContainer maxWidth="md" gradientFrom="from-amber-50" gradientTo="to-orange-50">
 *   <div className="border-4 border-black bg-white...">
 *     Your content
 *   </div>
 * </PageContainer>
 */
export function PageContainer({
  children,
  className,
  maxWidth = "2xl",
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
  };

  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-gradient-to-br",
        gradientFrom,
        gradientVia,
        gradientTo,
        "dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900",
        className
      )}
    >
      <main className={cn("w-full px-6 md:px-8", maxWidthClasses[maxWidth])}>
        {children}
      </main>
    </div>
  );
}
