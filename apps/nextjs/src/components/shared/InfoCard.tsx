import { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Text } from "@/components/shared/Text";

const infoCardVariants = cva(
  "border-3 md:border-4 border-black p-4 md:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
  {
    variants: {
      variant: {
        purple: "bg-purple-200",
        blue: "bg-blue-200",
        green: "bg-green-200",
        yellow: "bg-yellow-200",
        pink: "bg-pink-200",
        orange: "bg-orange-200",
        cyan: "bg-cyan-200",
      },
    },
    defaultVariants: {
      variant: "purple",
    },
  }
);

interface InfoCardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof infoCardVariants> {
  emoji?: string;
  heading?: string;
  children?: ReactNode;
}

const InfoCard = ({
  className,
  variant,
  emoji = "👨‍🏫",
  heading,
  children,
  ...props
}: InfoCardProps) => {
  return (
    <div className={cn(infoCardVariants({ variant }), className)} {...props}>
      <div className="flex items-start gap-3">
        <span className="text-2xl md:text-3xl">{emoji}</span>
        <div>
          {heading && (
            <Text
              as="h3"
              className="text-sm md:text-base font-black uppercase mb-1 md:mb-2"
            >
              {heading}
            </Text>
          )}
          {children && (
            <div className="text-xs md:text-sm font-bold leading-relaxed">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

InfoCard.displayName = "InfoCard";

export { InfoCard };
