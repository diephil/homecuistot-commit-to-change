"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/PageContainer";
import { InventorySection } from "@/components/inventory/InventorySection";
import { HelpModal } from "@/components/inventory/HelpModal";
import { NeoHelpButton } from "@/components/shared/NeoHelpButton";
import { ProposalConfirmationModal } from "@/components/inventory/ProposalConfirmationModal";
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import { UnrecognizedItemRow } from "@/components/shared/UnrecognizedItemRow";
import { VoiceGuidanceCard } from "@/components/inventory/VoiceGuidanceCard";
import { VoiceTextInput, Separator } from "@/components/shared";
import { InventoryDisplayItem, QuantityLevel, InventoryGroups, InventoryUpdateProposal } from "@/types/inventory";
import { deleteUnrecognizedItem } from "@/app/actions/inventory";
import { createClient } from "@/utils/supabase/client";
import { Info } from "lucide-react";
import { toast } from "sonner";

// Feature 021: Unrecognized item type
type UnrecognizedItem = {
  id: string;
  rawText: string;
};

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryGroups>({
    available: [],
    pantryStaples: [],
  });
  const [unrecognizedItems, setUnrecognizedItems] = useState<UnrecognizedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [proposal, setProposal] = useState<InventoryUpdateProposal | null>(null);
  const [itemToDelete, setItemToDelete] = useState<InventoryDisplayItem | null>(null);
  const [lastTranscription, setLastTranscription] = useState<string | undefined>();
  const [groupByCategory, setGroupByCategory] = useState(() => {
    try {
      if (typeof window === "undefined") return true;
      return localStorage.getItem("inventory:groupByCategory") !== "false";
    } catch { return true; }
  });
  const [showEmptyOnly, setShowEmptyOnly] = useState(() => {
    try {
      if (typeof window === "undefined") return false;
      return localStorage.getItem("inventory:showEmptyOnly") === "true";
    } catch { return false; }
  });
  const [useWord, setUseWord] = useState(() => {
    try {
      if (typeof window === "undefined") return true;
      return localStorage.getItem("inventory:useWord") !== "false";
    } catch { return true; }
  });

  // Banner dismiss state (persisted in localStorage)
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    try {
      if (typeof window === "undefined") return false;
      return localStorage.getItem("banner:inventory:dismissed") === "true";
    } catch { return false; }
  });

  const handleBannerDismiss = () => {
    try { localStorage.setItem("banner:inventory:dismissed", "true"); } catch {}
    setBannerDismissed(true);
  };

  const handleBannerRestore = () => {
    try { localStorage.removeItem("banner:inventory:dismissed"); } catch {}
    setBannerDismissed(false);
  };

  useEffect(() => {
    try { localStorage.setItem("inventory:groupByCategory", String(groupByCategory)); } catch {}
  }, [groupByCategory]);

  useEffect(() => {
    try { localStorage.setItem("inventory:showEmptyOnly", String(showEmptyOnly)); } catch {}
  }, [showEmptyOnly]);

  useEffect(() => {
    try { localStorage.setItem("inventory:useWord", String(useWord)); } catch {}
  }, [useWord]);

  // Sort items alphabetically by name
  const sortByName = (items: InventoryDisplayItem[]) =>
    items.sort((a, b) => a.name.localeCompare(b.name));

  // Get contextual message based on quantity level
  const getQuantityMessage = (params: { name: string; quantity: QuantityLevel }): string => {
    const { name, quantity } = params;
    switch (quantity) {
      case 0: return `No more ${name}`;
      case 1: return `Running low on ${name}`;
      case 2: return `You have some ${name}`;
      case 3: return `Stocked up on ${name}`;
    }
  };

  // Fetch inventory data - extracted so it can be called after updates
  async function fetchInventory() {
    try {
      const response = await fetch("/api/inventory");
      if (!response.ok) {
        throw new Error("Failed to fetch inventory");
      }

      const data = await response.json();

      // Feature 021: Separate recognized and unrecognized items
      const recognizedItems: InventoryDisplayItem[] = [];
      const unrecognized: UnrecognizedItem[] = [];

      data.inventory.forEach((item: {
        id: string;
        ingredientId: string | null;
        unrecognizedItemId: string | null;
        ingredientName: string | null;
        ingredientCategory: string | null;
        unrecognizedRawText: string | null;
        quantityLevel: number;
        isPantryStaple?: boolean;
        updatedAt: string;
      }) => {
        // FR-001: Separate recognized from unrecognized
        if (item.ingredientId && item.ingredientName && item.ingredientCategory) {
          // Recognized ingredient
          recognizedItems.push({
            id: item.id,
            ingredientId: item.ingredientId,
            name: item.ingredientName,
            category: item.ingredientCategory,
            quantityLevel: item.quantityLevel as QuantityLevel,
            isPantryStaple: item.isPantryStaple ?? false,
            updatedAt: new Date(item.updatedAt),
          });
        } else if (item.unrecognizedItemId && item.unrecognizedRawText) {
          // Unrecognized item (FR-010: use rawText as display name)
          unrecognized.push({
            id: item.id,
            rawText: item.unrecognizedRawText,
          });
        }
      });

      // Group recognized items by isPantryStaple and sort alphabetically
      const grouped: InventoryGroups = {
        available: sortByName(recognizedItems.filter((item) => !item.isPantryStaple)),
        pantryStaples: sortByName(recognizedItems.filter((item) => item.isPantryStaple)),
      };

      setInventory(grouped);
      setUnrecognizedItems(unrecognized);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to load inventory");
    } finally {
      setIsLoading(false);
    }
  }

  // Initial fetch on mount
  useEffect(() => {
    fetchInventory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

      toast.success(getQuantityMessage({ name: item.name, quantity }));
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

  // Feature 021: Handle unrecognized item deletion
  // FR-007, FR-008, FR-014
  const handleDeleteUnrecognized = async (itemId: string) => {
    // Find item for optimistic update and rollback
    const item = unrecognizedItems.find((i) => i.id === itemId);
    if (!item) return;

    // Optimistic update - remove from UI immediately
    const previousUnrecognized = unrecognizedItems;
    setUnrecognizedItems(unrecognizedItems.filter((i) => i.id !== itemId));

    try {
      // Get user ID from Supabase client
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      // Call server action with named parameters
      const result = await deleteUnrecognizedItem({ userId: user.id, inventoryId: itemId });

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete item');
      }

      toast.success('Item deleted');
    } catch (error) {
      console.error('Error deleting unrecognized item:', error);
      toast.error('Failed to delete item'); // FR-014: Error toast only
      // Rollback on error
      setUnrecognizedItems(previousUnrecognized);
    }
  };

  // Handle voice/text input submission
  const handleVoiceTextSubmit = async (
    result: { type: "voice"; audioBlob: Blob } | { type: "text"; text: string }
  ) => {
    setIsProcessing(true);

    try {
      let requestBody: { input?: string; audioBase64?: string };

      if (result.type === "voice") {
        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(result.audioBlob);
        const audioBase64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            resolve(dataUrl.split(",")[1]);
          };
        });
        requestBody = { audioBase64 };
      } else {
        requestBody = { input: result.text };
      }

      const response = await fetch("/api/inventory/agent-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to process input");
        return;
      }

      // Store transcription if voice input was used
      if (data.transcribedText) {
        setLastTranscription(data.transcribedText);
      }

      const resultProposal = data.proposal as InventoryUpdateProposal;

      if (resultProposal.recognized.length === 0) {
        toast.info("No inventory updates detected");
      } else {
        setProposal(resultProposal);
      }
    } catch (error) {
      console.error("Voice/text processing error:", error);
      toast.error("Failed to process input");
    } finally {
      setIsProcessing(false);
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

  // Empty state - Feature 021: include unrecognized items in total count
  const totalItems = inventory.available.length + inventory.pantryStaples.length + unrecognizedItems.length;
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
            <NeoHelpButton
              renderModal={({ isOpen, onClose }) => (
                <HelpModal isOpen={isOpen} onClose={onClose} />
              )}
            />
          </div>

          <div className="space-y-4">
            {!bannerDismissed ? (
              <VoiceGuidanceCard
                onDismiss={handleBannerDismiss}
              />
            ) : (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleBannerRestore}
                  className="cursor-pointer border-2 border-black bg-cyan-200 p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  aria-label="Show voice guidance"
                  title="Show voice guidance"
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>
            )}

            <VoiceTextInput
              onSubmit={handleVoiceTextSubmit}
              disabled={isProcessing}
              processing={isProcessing}
              textPlaceholder="I have eggs, milk, and butter..."
              lastTranscription={lastTranscription}
            />
          </div>

          <div className="text-center py-4 space-y-2">
            <p className="text-lg text-gray-600">Your inventory is empty</p>
            <p className="text-sm text-gray-500">
              Speak or type to add ingredients
            </p>
          </div>
        </div>

        {proposal && (
          <ProposalConfirmationModal
            isOpen={true}
            proposal={proposal}
            onClose={() => setProposal(null)}
            onUpdatesApplied={() => {
              setProposal(null);
              fetchInventory();
            }}
            transcription={lastTranscription}
          />
        )}
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
          <NeoHelpButton
            renderModal={({ isOpen, onClose }) => (
              <HelpModal isOpen={isOpen} onClose={onClose} />
            )}
          />
        </div>

        {/* Voice Input Section */}
        <div className="space-y-4">
          {!bannerDismissed ? (
            <VoiceGuidanceCard
              onDismiss={handleBannerDismiss}
            />
          ) : (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleBannerRestore}
                className="cursor-pointer border-2 border-black bg-cyan-200 p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                aria-label="Show voice guidance"
                title="Show voice guidance"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
          )}

          <VoiceTextInput
            onSubmit={handleVoiceTextSubmit}
            disabled={isProcessing}
            processing={isProcessing}
            textPlaceholder="Add eggs and butter, remove bacon..."
            lastTranscription={lastTranscription}
          />
        </div>

        <Separator />

        {/* Tracked Ingredients */}
        <InventorySection
          title="Tracked Ingredients"
          description="Tap the ingredient to adjust its approximate quantity level to match what you have at home!"
          items={inventory.available}
          isPantrySection={false}
          groupByCategory={groupByCategory}
          showEmptyOnly={showEmptyOnly}
          useWord={useWord}
          // onToggleView={setGroupByCategory} // DO NOT DELETE, KEEP IT COMMENTED FOR NOW
          onToggleEmpty={setShowEmptyOnly}
          onToggleWord={setUseWord}
          onQuantityChange={handleQuantityChange}
          onToggleStaple={handleToggleStaple}
          onDelete={handleDelete}
        />

        {/* Pantry Staples */}
        <div className="space-y-2">
          <InventorySection
            title="Pantry Staples"
            description="Basic or important foods you have a supply of. They are always considered available in recipe matching"
            items={inventory.pantryStaples}
            isPantrySection={true}
            useWord={useWord}
            onQuantityChange={handleQuantityChange}
            onToggleStaple={handleToggleStaple}
            onDelete={handleDelete}
          />

        </div>

        {/* Feature 021: Unrecognized Items Section (FR-001: appears at end of list) */}
        {unrecognizedItems.length > 0 && (
          <section className="mt-8 border-t-4 border-black pt-8">
            <h2 className="text-2xl font-black uppercase mb-4">
              Unrecognized Items
            </h2>
            <div className="space-y-2">
              {unrecognizedItems.map((item) => (
                <UnrecognizedItemRow
                  key={item.id}
                  item={{
                    id: item.id,
                    userId: '',
                    ingredientId: null,
                    unrecognizedItemId: item.id,
                    quantityLevel: 0,
                    isPantryStaple: false,
                    updatedAt: new Date(),
                    ingredient: null,
                    unrecognizedItem: {
                      id: item.id,
                      userId: '',
                      rawText: item.rawText,
                      context: null,
                      resolvedAt: null,
                      createdAt: new Date(),
                    },
                  }}
                  onDelete={handleDeleteUnrecognized}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {proposal && (
        <ProposalConfirmationModal
          isOpen={true}
          proposal={proposal}
          onClose={() => setProposal(null)}
          onUpdatesApplied={() => {
            setProposal(null);
            fetchInventory();
          }}
          transcription={lastTranscription}
        />
      )}
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
