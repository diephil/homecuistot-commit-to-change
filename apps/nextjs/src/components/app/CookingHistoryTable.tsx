import { cn } from '@/lib/utils'
import type { CookingLogEntry } from '@/types/cooking'

export interface CookingHistoryTableProps {
  entries: CookingLogEntry[]
}

// Format date for display
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function CookingHistoryTable(props: CookingHistoryTableProps) {
  const { entries } = props

  // T026: Empty state
  if (entries.length === 0) {
    return (
      <div className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white p-6 text-center">
        <p className="font-bold text-gray-500">No cooking history yet.</p>
        <p className="text-sm text-gray-400 mt-1">
          Mark a recipe as cooked to start tracking.
        </p>
      </div>
    )
  }

  // T024: Neo-brutalism table styling
  return (
    <div className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      {/* Header */}
      <div className="bg-cyan-200 p-3 border-b-4 border-black">
        <h3 className="text-xl font-black uppercase">Cooking History</h3>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead className="bg-gray-100 border-b-4 border-black">
          <tr>
            <th className="p-3 text-left font-black border-r-2 border-black">Recipe</th>
            <th className="p-3 text-left font-black">Cooked</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr
              key={entry.id}
              className={cn(
                i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              )}
            >
              <td className="p-3 font-bold border-r-2 border-black border-t-2">
                {entry.recipeName}
              </td>
              <td className="p-3 font-bold border-t-2 border-black">
                {formatDate(entry.cookedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
