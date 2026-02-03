import Link from "next/link";
import { Text } from "./Text";

interface LogoProps {
  /**
   * Whether the logo should be clickable and link to a page
   */
  href?: string;
  /**
   * Size variant for the logo
   */
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: {
    container: "w-8 h-8 md:w-10 md:h-10",
    emoji: "text-base md:text-lg",
    text: "text-lg md:text-xl",
  },
  md: {
    container: "w-10 h-10 md:w-14 md:h-14",
    emoji: "text-lg md:text-2xl",
    text: "text-xl md:text-3xl",
  },
  lg: {
    container: "w-10 h-10 md:w-16 md:h-16",
    emoji: "text-lg md:text-3xl",
    text: "text-xl md:text-4xl",
  },
};

export function Logo({ href, size = "lg" }: LogoProps) {
  const classes = sizeClasses[size];

  const logoContent = (
    <div className="flex items-center gap-2 md:gap-3 select-none">
      <div
        className={`${classes.container} bg-yellow-300 border-3 md:border-4 border-black rounded-full flex items-center justify-center ${classes.emoji} md:rotate-3`}
      >
        🍳
      </div>
      <div className="flex flex-col">
        <Text
          as="h1"
          className={`${classes.text} font-black uppercase tracking-tight md:transform md:-rotate-1`}
        >
          HomeCuistot
        </Text>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
