import { INGREDIENT_CATEGORIES } from "@/db/schema/enums";

interface CategorySelectProps {
  value: string;
  onChange: (category: string) => void;
}

export function CategorySelect({ value, onChange }: CategorySelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border-2 border-black p-2 font-bold bg-white"
    >
      {[...INGREDIENT_CATEGORIES]
        .sort((a, b) => a.localeCompare(b))
        .map((cat) => (
          <option key={cat} value={cat}>
            {cat.replace(/_/g, " ")}
          </option>
        ))}
    </select>
  );
}
