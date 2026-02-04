import { CategorySelect } from "./CategorySelect";

type ItemStatus = "active" | "dismissed" | "existing";

interface ItemReviewRowProps {
  itemName: string;
  status: ItemStatus;
  category?: string;
  onCategoryChange?: (category: string) => void;
  onRemove?: () => void;
  onUndo?: () => void;
}

export function ItemReviewRow({
  itemName,
  status,
  category,
  onCategoryChange,
  onRemove,
  onUndo,
}: ItemReviewRowProps) {
  if (status === "existing") {
    return (
      <div className="border-3 border-black p-4 bg-gray-100 flex gap-3 items-end opacity-60">
        <div className="flex-1 space-y-2">
          <label className="block text-sm font-bold uppercase text-gray-500">
            Item
          </label>
          <div className="font-bold bg-gray-50 border-2 border-gray-400 p-2 text-gray-500">
            {itemName}
          </div>
        </div>
        <span className="border-2 border-gray-400 bg-gray-200 px-3 py-2 font-bold text-sm uppercase text-gray-500">
          Already in database
        </span>
      </div>
    );
  }

  if (status === "dismissed") {
    return (
      <div className="border-3 border-black p-4 bg-gray-100 flex gap-3 items-center opacity-50">
        <div className="flex-1">
          <label className="block text-sm font-bold uppercase text-gray-400">
            Item
          </label>
          <div className="font-bold bg-gray-50 border-2 border-gray-300 p-2 text-gray-400 line-through">
            {itemName}
          </div>
        </div>
        {onUndo && (
          <button
            onClick={onUndo}
            className="border-2 border-black bg-yellow-200 hover:bg-yellow-300 px-4 py-2 font-bold uppercase cursor-pointer"
          >
            Undo
          </button>
        )}
      </div>
    );
  }

  // active
  return (
    <div className="border-3 border-black p-4 bg-gray-50 flex gap-3 items-end">
      <div className="flex-1 space-y-2">
        <label className="block text-sm font-bold uppercase">Item</label>
        <div className="font-bold bg-white border-2 border-black p-2">
          {itemName}
        </div>
      </div>

      <div className="flex-1 space-y-2">
        <label className="block text-sm font-bold uppercase">Category</label>
        <CategorySelect
          value={category ?? "non_classified"}
          onChange={onCategoryChange ?? (() => {})}
        />
      </div>

      {onRemove && (
        <button
          onClick={onRemove}
          className="border-2 border-black bg-red-200 hover:bg-red-300 px-4 py-2 font-bold uppercase cursor-pointer"
        >
          ✗
        </button>
      )}
    </div>
  );
}
