"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/PageContainer";
import { ItemReviewRow } from "@/components/admin";
import { toast } from "sonner";

interface OpikInfo {
  workspace: string;
  projectName: string;
}

interface SpanItem {
  name: string;
  existsInDb: boolean;
}

interface LoadedSpan {
  spanId: string;
  spanName: string;
  traceId: string;
  tags: string[];
  items: SpanItem[];
  totalInSpan: number;
}

interface PromotionEntry {
  name: string;
  category: string;
}

export default function UnrecognizedItemsPage() {
  const [opikInfo, setOpikInfo] = useState<OpikInfo | null>(null);
  const [loadedSpan, setLoadedSpan] = useState<LoadedSpan | null>(null);
  const [promotions, setPromotions] = useState<Record<string, PromotionEntry>>(
    {},
  );
  const [dismissedItems, setDismissedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasReviewedSpan, setHasReviewedSpan] = useState(false);

  useEffect(() => {
    fetch("/api/admin/opik-info")
      .then((res) => res.json())
      .then(setOpikInfo)
      .catch(() => {});
  }, []);
  const [queueEmpty, setQueueEmpty] = useState(false);

  const handleLoadSpan = async () => {
    setIsLoading(true);
    setError(null);
    setLoadedSpan(null);
    setPromotions({});
    setDismissedItems(new Set());
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

      // Initialize promotions for NEW items only (not existing in DB)
      const initial: Record<string, PromotionEntry> = {};
      for (const item of data.items as SpanItem[]) {
        if (!item.existsInDb) {
          initial[item.name] = { name: item.name, category: "non_classified" };
        }
      }
      setPromotions(initial);

      const newCount = data.items.filter(
        (i: SpanItem) => !i.existsInDb,
      ).length;
      const existingCount = data.items.length - newCount;
      const parts: string[] = [`${newCount} new`];
      if (existingCount > 0) parts.push(`${existingCount} already in DB`);
      toast.success(`Loaded ${data.items.length} items (${parts.join(", ")})`);
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

  const handleDismissItem = (itemName: string) => {
    setDismissedItems((prev) => new Set(prev).add(itemName));
  };

  const handleUndoDismiss = (itemName: string) => {
    setDismissedItems((prev) => {
      const next = new Set(prev);
      next.delete(itemName);
      return next;
    });
  };

  // Promotable = new items that are NOT dismissed
  const promotableItems = loadedSpan
    ? loadedSpan.items.filter(
        (item) => !item.existsInDb && !dismissedItems.has(item.name),
      )
    : [];

  const handlePromote = async () => {
    if (!loadedSpan) return;

    const items = promotableItems
      .map((item) => promotions[item.name])
      .filter(Boolean);

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

      setLoadedSpan(null);
      setPromotions({});
      setDismissedItems(new Set());
      setHasReviewedSpan(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkReviewed = async () => {
    if (!loadedSpan) return;

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
        setError(data.error || "Failed to mark span as reviewed");
        return;
      }

      toast.success("Span marked as reviewed");
      setLoadedSpan(null);
      setPromotions({});
      setDismissedItems(new Set());
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

    await handleMarkReviewed();
  };

  const getItemStatus = (
    item: SpanItem,
  ): "active" | "dismissed" | "existing" => {
    if (item.existsInDb) return "existing";
    if (dismissedItems.has(item.name)) return "dismissed";
    return "active";
  };

  const newItemCount = loadedSpan
    ? loadedSpan.items.filter((i) => !i.existsInDb).length
    : 0;
  const existingItemCount = loadedSpan
    ? loadedSpan.items.filter((i) => i.existsInDb).length
    : 0;

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
          {opikInfo && (
            <p className="mt-3 text-sm font-mono font-bold text-black/50">
              Opik workspace: <span className="text-black/70">{opikInfo.workspace}</span>
              {" / "}
              project: <span className="text-black/70">{opikInfo.projectName}</span>
            </p>
          )}
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
              <div className="flex justify-between items-start mb-4 gap-4">
                <h2 className="text-2xl md:text-3xl font-black uppercase">
                  {loadedSpan.items.length} Item(s) to Review
                </h2>
                <div className="flex gap-3 text-center shrink-0">
                  {existingItemCount > 0 && (
                    <div className="border-3 border-black bg-gray-100 px-3 py-2 min-w-[56px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <div className="text-lg font-black leading-tight">{existingItemCount}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wide text-gray-600">in DB</div>
                    </div>
                  )}
                  <div className="border-3 border-black bg-lime-200 px-3 py-2 min-w-[56px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div className="text-lg font-black leading-tight">{newItemCount}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-gray-700">new</div>
                  </div>
                  <div className="border-3 border-black bg-purple-100 px-3 py-2 min-w-[56px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div className="text-lg font-black leading-tight">{loadedSpan.totalInSpan}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-gray-600">total</div>
                  </div>
                </div>
              </div>

              {/* Span metadata */}
              <div className="border-2 border-gray-200 bg-gray-50 rounded p-3 mb-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-mono text-gray-500">
                  <span className="font-bold uppercase text-[10px] tracking-wider text-gray-400 w-10 shrink-0">Span</span>
                  <span className="font-bold text-gray-600">{loadedSpan.spanName}</span>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(loadedSpan.spanId);
                      toast.success("Span ID copied");
                    }}
                    className="hover:text-black hover:bg-gray-100 px-1.5 py-0.5 rounded border border-transparent hover:border-gray-300 transition cursor-pointer truncate"
                    title="Click to copy span ID"
                  >
                    {loadedSpan.spanId}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase text-[10px] tracking-wider text-gray-400 w-10 shrink-0">Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {loadedSpan.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-white border border-gray-300 px-2 py-0.5 rounded font-mono text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-400 italic text-[11px] pl-12">
                  Promoting or marking as reviewed will add the <code className="bg-gray-200 px-1 rounded text-gray-600 not-italic">promotion_reviewed</code> tag so this span won&apos;t appear again.
                </p>
              </div>

              {/* Item rows */}
              <div className="space-y-4 mb-6">
                {loadedSpan.items.map((item) => {
                  const status = getItemStatus(item);
                  return (
                    <ItemReviewRow
                      key={item.name}
                      itemName={item.name}
                      status={status}
                      category={promotions[item.name]?.category}
                      onCategoryChange={
                        status === "active"
                          ? (cat) => handleCategoryChange(item.name, cat)
                          : undefined
                      }
                      onRemove={
                        status === "active"
                          ? () => handleDismissItem(item.name)
                          : undefined
                      }
                      onUndo={
                        status === "dismissed"
                          ? () => handleUndoDismiss(item.name)
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 flex-wrap">
              {promotableItems.length > 0 ? (
                <>
                  <button
                    onClick={handlePromote}
                    disabled={isProcessing}
                    className="flex-1 bg-green-300 hover:bg-green-400 disabled:opacity-50 border-4 border-black px-6 py-4 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition"
                  >
                    {isProcessing
                      ? "Processing..."
                      : `✓ Promote (${promotableItems.length})`}
                  </button>

                  <button
                    onClick={handleDismissAll}
                    disabled={isProcessing}
                    className="flex-1 bg-red-300 hover:bg-red-400 disabled:opacity-50 border-4 border-black px-6 py-4 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition"
                  >
                    {isProcessing ? "Processing..." : "✗ Dismiss All"}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleMarkReviewed}
                  disabled={isProcessing}
                  className="flex-1 bg-orange-300 hover:bg-orange-400 disabled:opacity-50 border-4 border-black px-6 py-4 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition"
                >
                  {isProcessing
                    ? "Processing..."
                    : "→ Mark as Reviewed (no items to promote)"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
