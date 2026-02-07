"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/PageContainer";
import { ItemReviewRow } from "@/components/admin";
import { toast } from "sonner";

interface OpikInfo {
  workspace: string;
  projectName: string;
  isAdmin: boolean;
}

interface SpanItem {
  name: string;
  existsInDb: boolean;
}

interface SpanEntry {
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
  const [spans, setSpans] = useState<SpanEntry[]>([]);
  const [promotions, setPromotions] = useState<
    Record<string, Record<string, PromotionEntry>>
  >({});
  const [dismissedItems, setDismissedItems] = useState<
    Record<string, Set<string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [processingSpans, setProcessingSpans] = useState<Set<string>>(
    new Set(),
  );
  const [error, setError] = useState<string | null>(null);
  const [queueEmpty, setQueueEmpty] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    fetch("/api/admin/opik-info")
      .then((res) => res.json())
      .then(setOpikInfo)
      .catch(() => {});
  }, []);

  const handleLoadSpans = async () => {
    setIsLoading(true);
    setError(null);
    setSpans([]);
    setPromotions({});
    setDismissedItems({});
    setQueueEmpty(false);

    try {
      const response = await fetch("/api/admin/spans/next");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load spans");
        return;
      }

      const loadedSpans: SpanEntry[] = data.spans ?? [];
      setIsDemo(!!data.isDemo);

      if (loadedSpans.length === 0) {
        setQueueEmpty(true);
        toast.info("No more spans to review");
        return;
      }

      setSpans(loadedSpans);

      // Initialize promotions per span
      const initialPromotions: Record<string, Record<string, PromotionEntry>> =
        {};
      for (const span of loadedSpans) {
        const spanPromos: Record<string, PromotionEntry> = {};
        for (const item of span.items) {
          if (!item.existsInDb) {
            spanPromos[item.name] = {
              name: item.name,
              category: "non_classified",
            };
          }
        }
        initialPromotions[span.spanId] = spanPromos;
      }
      setPromotions(initialPromotions);

      toast.success(`Loaded ${loadedSpans.length} span(s)`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  };

  const handleCategoryChange = (params: {
    spanId: string;
    itemName: string;
    category: string;
  }) => {
    setPromotions((prev) => ({
      ...prev,
      [params.spanId]: {
        ...prev[params.spanId],
        [params.itemName]: { name: params.itemName, category: params.category },
      },
    }));
  };

  const handleDismissItem = (params: { spanId: string; itemName: string }) => {
    setDismissedItems((prev) => {
      const spanSet = new Set(prev[params.spanId] ?? []);
      spanSet.add(params.itemName);
      return { ...prev, [params.spanId]: spanSet };
    });
  };

  const handleUndoDismiss = (params: { spanId: string; itemName: string }) => {
    setDismissedItems((prev) => {
      const spanSet = new Set(prev[params.spanId] ?? []);
      spanSet.delete(params.itemName);
      return { ...prev, [params.spanId]: spanSet };
    });
  };

  const getPromotableItems = (span: SpanEntry) => {
    const dismissed = dismissedItems[span.spanId] ?? new Set();
    return span.items.filter(
      (item) => !item.existsInDb && !dismissed.has(item.name),
    );
  };

  const handlePromoteSpan = async (span: SpanEntry) => {
    const promotable = getPromotableItems(span);
    const spanPromos = promotions[span.spanId] ?? {};
    const items = promotable
      .map((item) => spanPromos[item.name])
      .filter(Boolean);

    if (items.length === 0) {
      toast.warning("No items to promote");
      return;
    }

    if (isDemo) {
      toast.info("Demo mode — real admins can promote ingredients to the DB");
      removeSpan(span.spanId);
      return;
    }

    setProcessingSpans((prev) => new Set(prev).add(span.spanId));
    setError(null);

    try {
      const response = await fetch("/api/admin/ingredients/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spanId: span.spanId, promotions: items }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.demo) {
          toast.info(data.error);
          removeSpan(span.spanId);
          return;
        }
        setError(data.error || "Failed to promote ingredients");
        return;
      }

      toast.success(`Promoted ${data.promoted} ingredient(s)`);
      if (data.skipped > 0) {
        toast.info(`${data.skipped} duplicate(s) skipped`);
      }

      removeSpan(span.spanId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setProcessingSpans((prev) => {
        const next = new Set(prev);
        next.delete(span.spanId);
        return next;
      });
    }
  };

  const handleMarkReviewed = async (spanId: string) => {
    if (isDemo) {
      toast.info("Demo mode — real admins can mark spans as reviewed in Opik");
      removeSpan(spanId);
      return;
    }

    setProcessingSpans((prev) => new Set(prev).add(spanId));
    setError(null);

    try {
      const response = await fetch("/api/admin/spans/mark-reviewed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spanId }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to mark span as reviewed");
        return;
      }

      toast.success("Span marked as reviewed");
      removeSpan(spanId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setProcessingSpans((prev) => {
        const next = new Set(prev);
        next.delete(spanId);
        return next;
      });
    }
  };

  const removeSpan = (spanId: string) => {
    setSpans((prev) => prev.filter((s) => s.spanId !== spanId));
    setPromotions((prev) => {
      const next = { ...prev };
      delete next[spanId];
      return next;
    });
    setDismissedItems((prev) => {
      const next = { ...prev };
      delete next[spanId];
      return next;
    });
  };

  const getItemStatus = (params: {
    span: SpanEntry;
    item: SpanItem;
  }): "active" | "dismissed" | "existing" => {
    if (params.item.existsInDb) return "existing";
    if (dismissedItems[params.span.spanId]?.has(params.item.name))
      return "dismissed";
    return "active";
  };

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
              Opik workspace:{" "}
              <span className="text-black/70">{opikInfo.workspace}</span>
              {" / "}
              project:{" "}
              <span className="text-black/70">{opikInfo.projectName}</span>
            </p>
          )}
        </div>

        {/* Demo banner */}
        {opikInfo && !opikInfo.isAdmin && (
          <div className="border-4 border-amber-500 bg-amber-100 p-4 font-bold text-amber-900 text-center">
            You are viewing demo data. To inspect real spans from Opik, you need
            to be an administrator.
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="border-4 border-red-500 bg-red-100 p-4 font-bold text-red-800">
            {error}
          </div>
        )}

        {/* Load CTA or queue empty */}
        {spans.length === 0 ? (
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
                  onClick={handleLoadSpans}
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
                {hasLoaded && (
                  <p className="text-2xl font-black uppercase text-green-700 mb-2">
                    ✓ Batch complete
                  </p>
                )}
                <p className="text-lg font-bold">
                  {hasLoaded
                    ? "Ready for the next batch"
                    : "Click below to load up to 5 unrecognized ingredient spans"}
                </p>
                <button
                  onClick={handleLoadSpans}
                  disabled={isLoading}
                  className="bg-cyan-300 hover:bg-cyan-400 disabled:opacity-50 border-4 border-black px-8 py-4 font-black uppercase text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition"
                >
                  {isLoading ? "Loading..." : "↓ Load Next 5 Spans"}
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="space-y-6">
            {/* Summary bar */}
            <div className="flex items-center justify-between border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-black uppercase text-lg">
                {spans.length} span(s) remaining
              </p>
              <button
                onClick={handleLoadSpans}
                disabled={isLoading}
                className="bg-cyan-300 hover:bg-cyan-400 disabled:opacity-50 border-3 border-black px-4 py-2 font-black uppercase text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition"
              >
                {isLoading ? "Loading..." : "↻ Reload"}
              </button>
            </div>

            {/* Span cards */}
            {spans.map((span) => {
              const isProcessing = processingSpans.has(span.spanId);
              const newCount = span.items.filter((i) => !i.existsInDb).length;
              const existingCount = span.items.length - newCount;
              const promotable = getPromotableItems(span);

              return (
                <div
                  key={span.spanId}
                  className="border-4 md:border-6 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8"
                >
                  {/* Span header */}
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <h2 className="text-xl md:text-2xl font-black uppercase">
                      {span.items.length} Item(s)
                    </h2>
                    <div className="flex gap-3 text-center shrink-0">
                      {existingCount > 0 && (
                        <div className="border-3 border-black bg-gray-100 px-3 py-2 min-w-[56px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          <div className="text-lg font-black leading-tight">
                            {existingCount}
                          </div>
                          <div className="text-[10px] font-bold uppercase tracking-wide text-gray-600">
                            in DB
                          </div>
                        </div>
                      )}
                      <div className="border-3 border-black bg-lime-200 px-3 py-2 min-w-[56px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div className="text-lg font-black leading-tight">
                          {newCount}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wide text-gray-700">
                          new
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Span metadata */}
                  <div className="border-2 border-gray-200 bg-gray-50 rounded p-3 mb-4 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-mono text-gray-500">
                      <span className="font-bold uppercase text-[10px] tracking-wider text-gray-400 w-10 shrink-0">
                        Span
                      </span>
                      <span className="font-bold text-gray-600">
                        {span.spanName}
                      </span>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(span.spanId);
                          toast.success("Span ID copied");
                        }}
                        className="hover:text-black hover:bg-gray-100 px-1.5 py-0.5 rounded border border-transparent hover:border-gray-300 transition cursor-pointer truncate"
                        title="Click to copy span ID"
                      >
                        {span.spanId}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold uppercase text-[10px] tracking-wider text-gray-400 w-10 shrink-0">
                        Tags
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {span.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-white border border-gray-300 px-2 py-0.5 rounded font-mono text-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Item rows */}
                  <div className="space-y-4 mb-6">
                    {span.items.map((item) => {
                      const status = getItemStatus({ span, item });
                      return (
                        <ItemReviewRow
                          key={item.name}
                          itemName={item.name}
                          status={status}
                          category={
                            promotions[span.spanId]?.[item.name]?.category
                          }
                          onCategoryChange={
                            status === "active"
                              ? (cat) =>
                                  handleCategoryChange({
                                    spanId: span.spanId,
                                    itemName: item.name,
                                    category: cat,
                                  })
                              : undefined
                          }
                          onRemove={
                            status === "active"
                              ? () =>
                                  handleDismissItem({
                                    spanId: span.spanId,
                                    itemName: item.name,
                                  })
                              : undefined
                          }
                          onUndo={
                            status === "dismissed"
                              ? () =>
                                  handleUndoDismiss({
                                    spanId: span.spanId,
                                    itemName: item.name,
                                  })
                              : undefined
                          }
                        />
                      );
                    })}
                  </div>

                  {/* Per-span action buttons */}
                  <div className="flex gap-3 flex-wrap">
                    {promotable.length > 0 && (
                      <button
                        onClick={() => handlePromoteSpan(span)}
                        disabled={isProcessing}
                        className="flex-1 bg-green-300 hover:bg-green-400 disabled:opacity-50 border-4 border-black px-4 py-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition"
                      >
                        {isProcessing
                          ? "Processing..."
                          : `✓ Promote (${promotable.length})`}
                      </button>
                    )}
                    <button
                      onClick={() => handleMarkReviewed(span.spanId)}
                      disabled={isProcessing}
                      className="flex-1 bg-orange-300 hover:bg-orange-400 disabled:opacity-50 border-4 border-black px-4 py-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition"
                    >
                      {isProcessing
                        ? "Processing..."
                        : "→ Mark as Reviewed"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
