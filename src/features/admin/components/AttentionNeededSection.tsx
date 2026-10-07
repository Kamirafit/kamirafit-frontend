"use client";

import type { AnalyticsSummary, ProductPerformance } from "@/types/entities/analytics";

interface Props {
  summary?: AnalyticsSummary;
  topProduct?: ProductPerformance;
  onSelectTab?: (
    tab: "bestsellers" | "runninglow" | "notmoving" | "categories" | "activity",
    subFilter?: "outofstock" | "runninglow"
  ) => void;
  onSelectProduct?: (product: ProductPerformance) => void;
}

export default function AttentionNeededSection({
  summary,
  topProduct,
  onSelectTab,
  onSelectProduct,
}: Props) {
  if (!summary) return null;

  const outOfStockCount = summary.outOfStockCount ?? 0;
  const runningLowCount = summary.runningLowCount ?? summary.criticalRestockCount ?? 0;
  const deadStockValue = summary.deadStockValue ?? 0;
  const deadStockCount = summary.deadStockCount ?? 0;

  const handleTabClick = (
    tab: "bestsellers" | "runninglow" | "notmoving" | "categories" | "activity",
    subFilter?: "outofstock" | "runninglow"
  ) => {
    onSelectTab?.(tab, subFilter);
    setTimeout(() => {
      document.getElementById("drilldown-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
            🔔
          </span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-paper">
            Needs Your Attention
          </h2>
        </div>
        <span className="text-xs text-paper-muted">
          Click any card to inspect items
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Out of stock alert */}
        {outOfStockCount > 0 ? (
          <button
            type="button"
            onClick={() => handleTabClick("runninglow", "outofstock")}
            className="group flex flex-col justify-between h-full text-left rounded-xl border border-rose-200 bg-rose-50/90 p-4 transition-all hover:bg-rose-100 hover:border-rose-300 hover:shadow-sm cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-200/80 text-sm">
                  🔴
                </span>
                <span className="text-[11px] font-bold text-rose-800 group-hover:underline inline-flex items-center gap-1">
                  View items ↓
                </span>
              </div>
              <div className="mt-2.5">
                <div className="text-base sm:text-lg font-bold text-rose-950 min-h-[3.25rem] line-clamp-2">
                  {outOfStockCount} {outOfStockCount === 1 ? "product is" : "products are"} out of stock
                </div>
                <p className="mt-1 text-xs text-rose-800/90 leading-relaxed">
                  Customers cannot buy these right now. Restock to prevent lost sales.
                </p>
              </div>
            </div>
          </button>
        ) : (
          <div className="flex flex-col justify-between h-full rounded-xl border border-line bg-white/70 p-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-sm">
                  ✓
                </span>
                <span className="text-[11px] font-bold text-emerald-800">
                  Optimal Stock
                </span>
              </div>
              <div className="mt-2.5">
                <div className="text-base sm:text-lg font-bold text-emerald-950 min-h-[3.25rem] line-clamp-2">
                  Zero Out of Stock
                </div>
                <p className="mt-1 text-xs text-paper-muted leading-relaxed">
                  All active products have stock units available.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. Running low alert */}
        {runningLowCount > 0 ? (
          <button
            type="button"
            onClick={() => handleTabClick("runninglow", "runninglow")}
            className="group flex flex-col justify-between h-full text-left rounded-xl border border-amber-200 bg-amber-50/90 p-4 transition-all hover:bg-amber-100 hover:border-amber-300 hover:shadow-sm cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-200/80 text-sm">
                  🟠
                </span>
                <span className="text-[11px] font-bold text-amber-900 group-hover:underline inline-flex items-center gap-1">
                  View items ↓
                </span>
              </div>
              <div className="mt-2.5">
                <div className="text-base sm:text-lg font-bold text-amber-950 min-h-[3.25rem] line-clamp-2">
                  {runningLowCount} {runningLowCount === 1 ? "product is" : "products are"} running low
                </div>
                <p className="mt-1 text-xs text-amber-900/90 leading-relaxed">
                  At recent sales rates, stock may run out soon. Click to review restock runway.
                </p>
              </div>
            </div>
          </button>
        ) : (
          <div className="flex flex-col justify-between h-full rounded-xl border border-line bg-white/70 p-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-sm">
                  ✓
                </span>
                <span className="text-[11px] font-bold text-emerald-800">
                  Healthy Runway
                </span>
              </div>
              <div className="mt-2.5">
                <div className="text-base sm:text-lg font-bold text-emerald-950 min-h-[3.25rem] line-clamp-2">
                  Healthy Stock Runway
                </div>
                <p className="mt-1 text-xs text-paper-muted leading-relaxed">
                  Current products have sufficient stock runway.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. Slow-moving stock alert */}
        {deadStockValue > 0 ? (
          <button
            type="button"
            onClick={() => handleTabClick("notmoving")}
            className="group flex flex-col justify-between h-full text-left rounded-xl border border-line bg-white/90 p-4 transition-all hover:border-gold/60 hover:shadow-sm cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-3 text-sm">
                  ❄️
                </span>
                <span className="text-[11px] font-bold text-gold group-hover:underline inline-flex items-center gap-1">
                  View items ↓
                </span>
              </div>
              <div className="mt-2.5">
                <div className="text-base sm:text-lg font-bold text-paper min-h-[3.25rem] line-clamp-2">
                  ₹{Math.round(deadStockValue).toLocaleString("en-IN")} tied up
                </div>
                <p className="mt-1 text-xs text-paper-muted leading-relaxed">
                  {deadStockCount} {deadStockCount === 1 ? "product has" : "products have"} dormant stock with 60+ days of selling opportunity.
                </p>
              </div>
            </div>
          </button>
        ) : (
          <div className="flex flex-col justify-between h-full rounded-xl border border-line bg-white/70 p-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-sm">
                  ✓
                </span>
                <span className="text-[11px] font-bold text-emerald-800">
                  Optimal Turnover
                </span>
              </div>
              <div className="mt-2.5">
                <div className="text-base sm:text-lg font-bold text-emerald-950 min-h-[3.25rem] line-clamp-2">
                  Fast Product Turnover
                </div>
                <p className="mt-1 text-xs text-paper-muted leading-relaxed">
                  No dormant inventory meeting dead-stock criteria (60+ days).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. Top selling highlight (Earthy Linen card - aligned with same min-h, line-clamp, and full card height) */}
        {topProduct ? (
          <button
            type="button"
            onClick={() => {
              if (onSelectProduct) {
                onSelectProduct(topProduct);
              } else {
                handleTabClick("bestsellers");
              }
            }}
            className="group flex flex-col justify-between h-full text-left rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 transition-all hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-sm cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-200/80 text-sm">
                  ⭐
                </span>
                <span className="text-[11px] font-bold text-emerald-800 group-hover:underline inline-flex items-center gap-1">
                  Inspect product ↗
                </span>
              </div>
              <div className="mt-2.5">
                <div
                  className="text-base sm:text-lg font-bold text-emerald-950 min-h-[3.25rem] line-clamp-2 leading-snug"
                  title={topProduct.name}
                >
                  {topProduct.name}
                </div>
                <p className="mt-1 text-xs text-emerald-900/90 leading-relaxed">
                  Top seller with {topProduct.unitsSold} sold (₹{Math.round(topProduct.revenue).toLocaleString("en-IN")}). Click for full breakdown.
                </p>
              </div>
            </div>
          </button>
        ) : (
          <div className="flex flex-col justify-between h-full rounded-xl border border-line bg-white/70 p-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-3 text-sm">
                  ⭐
                </span>
                <span className="text-[11px] font-bold text-paper-muted">
                  Bestsellers
                </span>
              </div>
              <div className="mt-2.5">
                <div className="text-base sm:text-lg font-bold text-paper min-h-[3.25rem] line-clamp-2">
                  No Sales Activity
                </div>
                <p className="mt-1 text-xs text-paper-muted leading-relaxed">
                  Sales metrics will highlight top-performing products once orders are placed.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
