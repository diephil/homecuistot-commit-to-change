"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/retroui/Button";
import { InventorySection } from "@/components/inventory/inventory-section";
import { HelpModal } from "@/components/inventory/help-modal";
import { NeoHelpButton } from "@/components/shared/neo-help-button";
import { InventoryUpdateModal } from "@/components/inventory/inventory-update-modal";
import { DeleteConfirmationModal } from "@/components/shared/delete-confirmation-modal";
import { InventoryDisplayItem, QuantityLevel, InventoryGroups } from "@/types/inventory";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryGroups>({
    available: [],
    pantryStaples: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryDisplayItem | null>(null);

  // Sort items alphabetically by name
  const sortByName = (items: InventoryDisplayItem[]) =>
    items.sort((a, b) => a.name.localeCompare(b.name));

  // Fetch inventory data
  useEffect(() => {
    async function fetchInventory() {
      try {
        const response = await fetch("/api/inventory");
        if (!response.ok) {
          throw new Error("Failed to fetch inventory");
        }

        const data = await response.json();

        // Transform API response to InventoryDisplayItem[]
        const items: InventoryDisplayItem[] = data.inventory.map((item: {
          id: string;
          ingredientId: string;
          ingredientName: string;
          ingredientCategory: string;
          quantityLevel: number;
          isPantryStaple?: boolean;
          updatedAt: string;
        }) => ({
          id: item.id,
          ingredientId: item.ingredientId,
          name: item.ingredientName,
          category: item.ingredientCategory,
          quantityLevel: item.quantityLevel as QuantityLevel,
          isPantryStaple: item.isPantryStaple ?? false,
          updatedAt: new Date(item.updatedAt),
        }));

        // Group by isPantryStaple and sort alphabetically
        const grouped: InventoryGroups = {
          available: sortByName(items.filter((item) => !item.isPantryStaple)),
          pantryStaples: sortByName(items.filter((item) => item.isPantryStaple)),
        };

        setInventory(grouped);
      } catch (error) {
        console.error("Error fetching inventory:", error);
        toast.error("Failed to load inventory");
      } finally {
        setIsLoading(false);
      }
    }

    fetchInventory();
  }, []);

  // Handle quantity change (manual adjustment)
  const handleQuantityChange = async (params: { itemId: string; quantity: QuantityLevel }) => {
    const { itemId, quantity } = params;

    // Find item in current inventory
    const allItems = [...inventory.available, ...inventory.pantryStaples];
    const item = allItems.find((i) => i.id === itemId);
    if (!item) return;

    // Optimistic update
    const previousInventory = inventory;
    const updatedItems = allItems.map((i) =>
      i.id === itemId ? { ...i, quantityLevel: quantity } : i
    );

    setInventory({
      available: sortByName(updatedItems.filter((i) => !i.isPantryStaple)),
      pantryStaples: sortByName(updatedItems.filter((i) => i.isPantryStaple)),
    });

    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredientId: item.ingredientId,
          quantityLevel: quantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      toast.success(`Updated ${item.name}`);
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
      // Rollback on error
      setInventory(previousInventory);
    }
  };

  // Handle staple toggle
  const handleToggleStaple = async (itemId: string) => {
    // Find item in current inventory
    const allItems = [...inventory.available, ...inventory.pantryStaples];
    const item = allItems.find((i) => i.id === itemId);
    if (!item) return;

    // Optimistic update - move between sections
    const previousInventory = inventory;
    const updatedItems = allItems.map((i) =>
      i.id === itemId ? { ...i, isPantryStaple: !i.isPantryStaple } : i
    );

    setInventory({
      available: sortByName(updatedItems.filter((i) => !i.isPantryStaple)),
      pantryStaples: sortByName(updatedItems.filter((i) => i.isPantryStaple)),
    });

    try {
      const response = await fetch(`/api/inventory/${itemId}/toggle-staple`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to toggle staple");
      }

      const newStatus = !item.isPantryStaple;
      toast.success(
        newStatus
          ? `Moved ${item.name} to Pantry Staples`
          : `Moved ${item.name} to Available`
      );
    } catch (error) {
      console.error("Error toggling staple:", error);
      toast.error("Failed to toggle staple");
      // Rollback on error
      setInventory(previousInventory);
    }
  };

  // Handle delete - open confirmation modal
  const handleDelete = (itemId: string) => {
    // Find item in current inventory
    const allItems = [...inventory.available, ...inventory.pantryStaples];
    const item = allItems.find((i) => i.id === itemId);
    if (!item) return;

    setItemToDelete(item);
  };

  // Confirm and execute deletion
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    // Optimistic update - remove from UI
    const allItems = [...inventory.available, ...inventory.pantryStaples];
    const previousInventory = inventory;
    const remainingItems = allItems.filter((i) => i.id !== itemToDelete.id);

    setInventory({
      available: sortByName(remainingItems.filter((i) => !i.isPantryStaple)),
      pantryStaples: sortByName(remainingItems.filter((i) => i.isPantryStaple)),
    });

    // Close modal
    const itemName = itemToDelete.name;
    setItemToDelete(null);

    try {
      const response = await fetch(`/api/inventory/${itemToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      toast.success(`Deleted ${itemName}`);
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
      // Rollback on error
      setInventory(previousInventory);
    }
  };

  if (isLoading) {
    return (
      <PageContainer
        maxWidth="4xl"
        gradientFrom="from-yellow-50"
        gradientVia="via-amber-50"
        gradientTo="to-orange-50"
      >
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </PageContainer>
    );
  }

  // Empty state
  const totalItems = inventory.available.length + inventory.pantryStaples.length;
  if (totalItems === 0) {
    return (
      <PageContainer
        maxWidth="4xl"
        gradientFrom="from-yellow-50"
        gradientVia="via-amber-50"
        gradientTo="to-orange-50"
      >
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">My Inventory</h1>
            <div className="flex gap-2">
              <NeoHelpButton
                renderModal={({ isOpen, onClose }) => (
                  <HelpModal isOpen={isOpen} onClose={onClose} />
                )}
              />
              <Button
                variant="default"
                size="md"
                className="gap-2 bg-black text-white hover:bg-gray-800 border-black"
                onClick={() => setIsUpdateModalOpen(true)}
              >
                <Plus className="h-5 w-5" />
                Update Inventory
              </Button>
            </div>
          </div>

          <div className="text-center py-12 space-y-4">
            <p className="text-lg text-gray-600">Your inventory is empty</p>
            <p className="text-sm text-gray-500">
              Add ingredients to start tracking your pantry
            </p>
          </div>
        </div>

        <InventoryUpdateModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          onUpdatesApplied={() => {
            setIsUpdateModalOpen(false);
            window.location.reload();
          }}
          existingInventory={[]}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      maxWidth="4xl"
      gradientFrom="from-yellow-50"
      gradientVia="via-amber-50"
      gradientTo="to-orange-50"
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Inventory</h1>
          <div className="flex gap-2">
            <NeoHelpButton
              renderModal={({ isOpen, onClose }) => (
                <HelpModal isOpen={isOpen} onClose={onClose} />
              )}
            />
            <Button
              variant="default"
              size="md"
              className="gap-2 bg-black text-white hover:bg-gray-800 border-black"
              onClick={() => setIsUpdateModalOpen(true)}
            >
              <Plus className="h-5 w-5" />
              Update Inventory
            </Button>
          </div>
        </div>

        {/* Tracked Ingredients */}
        <InventorySection
          title="Tracked Ingredients"
          items={inventory.available}
          isPantrySection={false}
          onQuantityChange={handleQuantityChange}
          onToggleStaple={handleToggleStaple}
          onDelete={handleDelete}
        />

        {/* Pantry Staples */}
        <InventorySection
          title="Pantry Staples"
          description="Items here are always available in recipe matching."
          items={inventory.pantryStaples}
          isPantrySection={true}
          onQuantityChange={handleQuantityChange}
          onToggleStaple={handleToggleStaple}
          onDelete={handleDelete}
        />
      </div>

      <InventoryUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onUpdatesApplied={() => {
          // Refresh inventory after updates
          setIsLoading(true);
          fetch("/api/inventory")
            .then((res) => res.json())
            .then((data) => {
              const items: InventoryDisplayItem[] = data.inventory.map((item: {
                id: string;
                ingredientId: string;
                ingredientName: string;
                ingredientCategory: string;
                quantityLevel: number;
                isPantryStaple?: boolean;
                updatedAt: string;
              }) => ({
                id: item.id,
                ingredientId: item.ingredientId,
                name: item.ingredientName,
                category: item.ingredientCategory,
                quantityLevel: item.quantityLevel as QuantityLevel,
                isPantryStaple: item.isPantryStaple ?? false,
                updatedAt: new Date(item.updatedAt),
              }));
              setInventory({
                available: sortByName(items.filter((i) => !i.isPantryStaple)),
                pantryStaples: sortByName(items.filter((i) => i.isPantryStaple)),
              });
            })
            .finally(() => setIsLoading(false));
        }}
        existingInventory={[...inventory.available, ...inventory.pantryStaples]}
      />
      <DeleteConfirmationModal
        isOpen={itemToDelete !== null}
        itemName={itemToDelete?.name ?? ""}
        itemType="ingredient"
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </PageContainer>
  );
}
