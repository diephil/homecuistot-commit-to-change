import { CategorySelect } from "./CategorySelect";

interface ItemReviewRowProps {
  itemName: string;
  category: string;
  onCategoryChange: (category: string) => void;
  onRemove: () => void;
}

export function ItemReviewRow({
  itemName,
  category,
  onCategoryChange,
  onRemove,
}: ItemReviewRowProps) {
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
        <CategorySelect value={category} onChange={onCategoryChange} />
      </div>

      <button
        onClick={onRemove}
        className="border-2 border-black bg-red-200 hover:bg-red-300 px-4 py-2 font-bold uppercase cursor-pointer"
      >
        ✗
      </button>
    </div>
  );
}
