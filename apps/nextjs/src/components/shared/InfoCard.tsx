import { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
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
  onDismiss?: () => void;
}

const InfoCard = ({
  className,
  variant,
  emoji = "👨‍🏫",
  heading,
  children,
  onDismiss,
  ...props
}: InfoCardProps) => {
  return (
    <div className={cn(infoCardVariants({ variant }), "relative", className)} {...props}>
      <div className="flex items-start gap-3">
        <span className="text-2xl md:text-3xl">{emoji}</span>
        <div className="flex-1">
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
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-2 right-2 cursor-pointer border-2 border-black bg-white p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          aria-label="Dismiss"
          title="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

InfoCard.displayName = "InfoCard";

export { InfoCard };
