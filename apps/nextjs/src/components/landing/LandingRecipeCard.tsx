import { Badge } from "@/components/shared/Badge";

interface LandingRecipeCardIngredient {
  name: string;
  type: "anchor" | "optional";
  available: boolean;
}

interface LandingRecipeCardProps {
  name: string;
  description: string;
  ingredients: LandingRecipeCardIngredient[];
  status: "cookable" | "almost" | "missing";
}

const STATUS_CONFIG = {
  cookable: {
    bg: "bg-gradient-to-br from-green-200 to-green-300",
    badgeClass: "bg-green-400 text-black border-2 border-black",
  },
  almost: {
    bg: "bg-gradient-to-br from-yellow-200 to-yellow-300",
    badgeClass: "bg-yellow-400 text-black border-2 border-black",
  },
  missing: {
    bg: "bg-gradient-to-br from-gray-100 to-gray-200",
    badgeClass: "bg-gray-400 text-black border-2 border-black",
  },
} as const;

export function LandingRecipeCard({
  name,
  description,
  ingredients,
  status,
}: LandingRecipeCardProps) {
  const missingCount = ingredients.filter((i) => !i.available).length;
  const config = STATUS_CONFIG[status];

  const badgeText =
    status === "cookable"
      ? "✅ Ready tonight"
      : `${status === "almost" ? "⚠️" : "❌"} Missing ${missingCount}`;

  return (
    <div
      className={`border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-5 md:p-6 relative ${config.bg}`}
    >
      <span
        className={`absolute top-3 right-3 px-2 py-1 text-xs font-black uppercase ${config.badgeClass}`}
      >
        {badgeText}
      </span>

      <div className="pr-24 md:pr-28">
        <h4 className="text-xl font-black truncate">{name}</h4>
        <p className="text-sm font-bold text-black/70 line-clamp-2 mt-1">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-4">
        {ingredients.map((ingredient) => (
          <Badge
            key={ingredient.name}
            variant="outline"
            size="sm"
            className={
              ingredient.available
                ? "bg-white/50"
                : "bg-red-200 text-red-800 line-through"
            }
          >
            <span
              className={
                ingredient.type === "anchor"
                  ? "text-amber-600"
                  : "text-gray-400"
              }
            >
              ★
            </span>{" "}
            {ingredient.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
