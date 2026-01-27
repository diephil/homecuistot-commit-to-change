import { Card } from "@/components/retroui/Card";

interface RecipeCardProps {
  title: string;
  description: string | null;
  variant?: "interactive" | "summary";
  onClick?: () => void;
}

export function RecipeCard(props: RecipeCardProps) {
  const { title, description, variant = "summary", onClick } = props;

  const cardClasses = variant === "interactive"
    ? "p-4 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all"
    : "p-4";

  return (
    <Card className={cardClasses} onClick={onClick}>
      <h3 className="truncate text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2">
        {description || "No description provided."}
      </p>
    </Card>
  );
}
