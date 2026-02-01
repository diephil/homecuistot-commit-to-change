"use client";

import { cn } from "@/lib/utils";
import { SmallActionButton } from "@/components/shared/SmallActionButton";
import { Pencil, X } from "lucide-react";

interface RecipeCardProps {
  title: string;
  description: string | null;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export function RecipeCard(props: RecipeCardProps) {
  const { title, description, onClick, onEdit, onDelete, showActions = false } = props;

  return (
    <div
      className={cn(
        "relative border-4 border-black p-5 overflow-hidden bg-white min-h-[140px]",
        "sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
        onClick && "cursor-pointer hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow"
      )}
      onClick={onClick}
    >
      <h3 className="text-xl font-black mb-2 pr-14 line-clamp-2">{title}</h3>
      <p className="text-sm font-bold text-black/70 line-clamp-3">
        {description || "No description provided."}
      </p>

      {/* Action buttons */}
      {showActions && (onEdit || onDelete) && (
        <div className="absolute top-2 right-2 flex gap-1">
          {onEdit && (
            <SmallActionButton
              icon={Pencil}
              variant="blue"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              title="Edit recipe"
            />
          )}
          {onDelete && (
            <SmallActionButton
              icon={X}
              variant="red"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Delete recipe"
            />
          )}
        </div>
      )}
    </div>
  );
}
