"use client";

import { useState } from "react";
import { PageContainer } from "@/components/PageContainer";
import { ItemReviewRow } from "@/components/admin";
import { toast } from "sonner";

interface LoadedSpan {
  spanId: string;
  traceId: string;
  items: string[];
  totalInSpan: number;
}

interface PromotionEntry {
  name: string;
  category: string;
}

export default function UnrecognizedItemsPage() {
  const [loadedSpan, setLoadedSpan] = useState<LoadedSpan | null>(null);
  const [promotions, setPromotions] = useState<Record<string, PromotionEntry>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasReviewedSpan, setHasReviewedSpan] = useState(false);
  const [queueEmpty, setQueueEmpty] = useState(false);

  const handleLoadSpan = async () => {
    setIsLoading(true);
    setError(null);
    setLoadedSpan(null);
    setPromotions({});
    setQueueEmpty(false);

    try {
      const response = await fetch("/api/admin/spans/next");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load span");
        return;
      }

      if (!data.spanId) {
        setQueueEmpty(true);
        toast.info("No more spans to review");
        return;
      }

      setLoadedSpan(data);

      // Initialize promotions with default category
      const initial: Record<string, PromotionEntry> = {};
      for (const item of data.items) {
        initial[item] = { name: item, category: "non_classified" };
      }
      setPromotions(initial);

      toast.success(`Loaded ${data.items.length} items`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (itemName: string, category: string) => {
    setPromotions((prev) => ({
      ...prev,
      [itemName]: { name: itemName, category },
    }));
  };

  const handlePromote = async () => {
    if (!loadedSpan) return;

    const items = Object.values(promotions);
    if (items.length === 0) {
      toast.warning("No items to promote");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/ingredients/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spanId: loadedSpan.spanId,
          promotions: items,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to promote ingredients");
        return;
      }

      toast.success(`Promoted ${data.promoted} ingredient(s)`);
      if (data.skipped > 0) {
        toast.info(`${data.skipped} duplicate(s) skipped`);
      }

      // Reset for next span
      setLoadedSpan(null);
      setPromotions({});
      setHasReviewedSpan(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDismissAll = async () => {
    if (!loadedSpan) return;
    if (!confirm("Dismiss all items without promoting? This cannot be undone."))
      return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/spans/mark-reviewed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spanId: loadedSpan.spanId }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to dismiss span");
        return;
      }

      toast.success("Span dismissed");
      setLoadedSpan(null);
      setPromotions({});
      setHasReviewedSpan(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveItem = (itemName: string) => {
    setPromotions((prev) => {
      const updated = { ...prev };
      delete updated[itemName];
      return updated;
    });
  };

  const remainingItems = Object.keys(promotions);

  return (
    <PageContainer
      maxWidth="2xl"
      gradientFrom="from-yellow-100"
      gradientVia="via-green-100"
      gradientTo="to-cyan-100"
    >
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="border-4 md:border-6 border-black bg-gradient-to-br from-lime-300 to-green-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black uppercase mb-2">
            Review Unrecognized Items
          </h1>
          <p className="text-base md:text-lg font-bold">
            Promote detected ingredients to the database or dismiss them
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="border-4 border-red-500 bg-red-100 p-4 font-bold text-red-800">
            {error}
          </div>
        )}

        {/* Load CTA, queue empty, or review list */}
        {!loadedSpan ? (
          queueEmpty ? (
            <div className="border-4 md:border-6 border-black bg-gradient-to-br from-green-200 to-emerald-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10">
              <div className="text-center space-y-4">
                <p className="text-4xl">🎉</p>
                <p className="text-xl font-black uppercase">
                  All spans reviewed!
                </p>
                <p className="text-base font-bold">
                  No more unprocessed spans remain. Check back later when new
                  recipes are created.
                </p>
                <button
                  onClick={handleLoadSpan}
                  disabled={isLoading}
                  className="bg-cyan-300 hover:bg-cyan-400 disabled:opacity-50 border-4 border-black px-8 py-4 font-black uppercase text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition"
                >
                  {isLoading ? "Loading..." : "↻ Check Again"}
                </button>
              </div>
            </div>
          ) : (
            <div className="border-4 md:border-6 border-black bg-gradient-to-br from-blue-200 to-blue-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10">
              <div className="text-center space-y-4">
                {hasReviewedSpan && (
                  <p className="text-2xl font-black uppercase text-green-700 mb-2">
                    ✓ Span complete
                  </p>
                )}
                <p className="text-lg font-bold">
                  {hasReviewedSpan
                    ? "Ready for the next span"
                    : "Click below to load the next unrecognized ingredient span"}
                </p>
                <button
                  onClick={handleLoadSpan}
                  disabled={isLoading}
                  className="bg-cyan-300 hover:bg-cyan-400 disabled:opacity-50 border-4 border-black px-8 py-4 font-black uppercase text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition"
                >
                  {isLoading ? "Loading..." : "↓ Load Next Span"}
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="space-y-6">
            {/* Span info */}
            <div className="border-4 md:border-6 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl md:text-3xl font-black uppercase">
                  {loadedSpan.items.length} Item(s) to Review
                </h2>
                <span className="text-sm font-bold bg-gray-200 border-2 border-black px-3 py-1">
                  {loadedSpan.totalInSpan} total in span
                </span>
              </div>

              {/* Item rows */}
              <div className="space-y-4 mb-6">
                {loadedSpan.items.map((item) =>
                  promotions[item] ? (
                    <ItemReviewRow
                      key={item}
                      itemName={item}
                      category={promotions[item].category}
                      onCategoryChange={(cat) =>
                        handleCategoryChange(item, cat)
                      }
                      onRemove={() => handleRemoveItem(item)}
                    />
                  ) : null,
                )}
              </div>

              {remainingItems.length === 0 && (
                <div className="text-center py-4 bg-yellow-100 border-2 border-black p-4">
                  <p className="font-bold">
                    All items dismissed — use &quot;Dismiss All&quot; to mark
                    span as reviewed
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={handlePromote}
                disabled={isProcessing || remainingItems.length === 0}
                className="flex-1 bg-green-300 hover:bg-green-400 disabled:opacity-50 border-4 border-black px-6 py-4 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition"
              >
                {isProcessing
                  ? "Processing..."
                  : `✓ Promote (${remainingItems.length})`}
              </button>

              <button
                onClick={handleDismissAll}
                disabled={isProcessing}
                className="flex-1 bg-red-300 hover:bg-red-400 disabled:opacity-50 border-4 border-black px-6 py-4 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition"
              >
                {isProcessing ? "Processing..." : "✗ Dismiss All"}
              </button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
