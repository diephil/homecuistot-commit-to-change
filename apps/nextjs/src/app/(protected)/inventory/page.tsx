import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createUserDb, decodeSupabaseToken } from '@/db/client'
import { userInventory, ingredients } from '@/db/schema'
import { eq, gt } from 'drizzle-orm'

export default async function InventoryPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Decode JWT token for Drizzle RLS
  const token = decodeSupabaseToken(session.access_token)
  const db = createUserDb(token)

  // Type-safe query with RLS enforcement
  const inventory = await db((tx) =>
    tx.select({
      id: userInventory.id,
      quantity: userInventory.quantityLevel,
      ingredientId: userInventory.ingredientId,
      ingredientName: ingredients.name,
      ingredientCategory: ingredients.category,
      updatedAt: userInventory.updatedAt,
    })
    .from(userInventory)
      .innerJoin(ingredients, eq(userInventory.ingredientId, ingredients.id))
      .where(gt(userInventory.quantityLevel, 0))
  )

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Your Inventory</h1>

      {inventory.length === 0 ? (
        <p className="text-gray-600">No items in inventory. Add some ingredients to get started!</p>
      ) : (
        <div className="grid gap-4">
          {inventory.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">{item.ingredientName}</h2>
                  <p className="text-sm text-gray-600 capitalize">{item.ingredientCategory}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-medium">
                    Level {item.quantity}
                  </div>
                  <div className="text-xs text-gray-500">
                    Updated: {new Date(item.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
