"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import SearchField from "../components/SearchField";
import AiAnalyticsSection from "../components/AiAnalyticsSection";
import AnalyticsTrendGraph from "../components/AnalyticsTrendGraph";
import AnalyticsKpiCards from "../components/AnalyticsKpiCards";
import InventoryOverviewSection from "../components/InventoryOverviewSection";
import AttentionNeededSection from "../components/AttentionNeededSection";
import RecentMovementsSection from "../components/RecentMovementsSection";
import ProductAnalyticsDetailModal, { formatSellingSpeed } from "../components/ProductAnalyticsDetailModal";
import { useBusinessAnalytics } from "@/services/admin";
import type {
  ProductPerformance,
  TimeframeOption,
} from "@/types/entities/analytics";

type ActiveTab = "bestsellers" | "lowstock" | "deadstock" | "categories" | "activity" | "all_products";

const TIMEFRAME_LABELS: Record<TimeframeOption, string> = {
  today: "Today",
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  "90d": "Last 90 Days",
  all: "All Time",
};

const CLASSIFICATION_CONFIG: Record<
  ProductPerformance["classification"],
  { label: string; bg: string; text: string; border: string }
> = {
  STAR_PERFORMER: {
    label: "Top Seller",
    bg: "bg-amber-100",
    text: "text-amber-900",
    border: "border-amber-300",
  },
  HIGH_VELOCITY: {
    label: "Selling Fast",
    bg: "bg-emerald-100",
    text: "text-emerald-900",
    border: "border-emerald-300",
  },
  STABLE: {
    label: "Steady",
    bg: "bg-blue-100",
    text: "text-blue-900",
    border: "border-blue-300",
  },
  LACKING: {
    label: "Slow",
    bg: "bg-orange-100",
    text: "text-orange-950",
    border: "border-orange-300",
  },
  DEAD_STOCK: {
    label: "Not Moving",
    bg: "bg-rose-100",
    text: "text-rose-900",
    border: "border-rose-300",
  },
  OUT_OF_STOCK: {
    label: "Out of Stock",
    bg: "bg-neutral-200",
    text: "text-neutral-800",
    border: "border-neutral-300",
  },
};

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState<TimeframeOption>("30d");
  const [activeTab, setActiveTab] = useState<ActiveTab>("bestsellers");
  const [searchQuery, setSearchQuery] = useState("");
  const [classificationFilter, setClassificationFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"rank" | "revenue" | "units" | "velocity" | "rating" | "stock">("rank");
  const [selectedProduct, setSelectedProduct] = useState<ProductPerformance | null>(null);
  const [restockSubFilter, setRestockSubFilter] = useState<"all" | "outofstock" | "runninglow">("all");

  const { data: analytics, isLoading, isError, refetch } = useBusinessAnalytics(timeframe);

  const summary = analytics?.summary;
  const timeline = analytics?.timeline;
  const trends = analytics?.trends;
  const products = useMemo(() => analytics?.rankedProducts || [], [analytics?.rankedProducts]);
  const categories = useMemo(() => analytics?.rankedCategories || [], [analytics?.rankedCategories]);
  const deadStock = useMemo(() => analytics?.deadStockReport || [], [analytics?.deadStockReport]);

  const daysCount = Math.max(summary?.daysCount || 30, 1);

  // Out of stock products (currentStock === 0)
  const outOfStockProducts = useMemo(() => {
    return products.filter((p) => p.currentStock === 0);
  }, [products]);

  // Running low products (currentStock > 0, approaching stockout or low units)
  const runningLowProducts = useMemo(() => {
    return products.filter(
      (p) => p.currentStock > 0 && ((p.daysOfInventory !== null && p.daysOfInventory <= 14) || p.currentStock <= 10)
    );
  }, [products]);

  // Combined restock alert list (out of stock first, then lowest stock)
  const allRestockProducts = useMemo(() => {
    return [...outOfStockProducts, ...runningLowProducts];
  }, [outOfStockProducts, runningLowProducts]);

  // Filtered restock products based on selected sub-filter
  const displayedRestockProducts = useMemo(() => {
    if (restockSubFilter === "outofstock") return outOfStockProducts;
    if (restockSubFilter === "runninglow") return runningLowProducts;
    return allRestockProducts;
  }, [restockSubFilter, outOfStockProducts, runningLowProducts, allRestockProducts]);

  // Best sellers (sorted by units sold descending)
  const bestSellers = useMemo(() => {
    return [...products]
      .filter((p) => p.unitsSold > 0)
      .sort((a, b) => b.unitsSold - a.unitsSold);
  }, [products]);

  // Filtered and sorted products for "All Products" tab
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
      );
    }

    if (classificationFilter !== "ALL") {
      result = result.filter((p) => p.classification === classificationFilter);
    }

    result.sort((a, b) => {
      if (sortBy === "revenue") return b.revenue - a.revenue;
      if (sortBy === "units") return b.unitsSold - a.unitsSold;
      if (sortBy === "velocity") return b.velocity - a.velocity;
      if (sortBy === "rating") return b.averageRating - a.averageRating;
      if (sortBy === "stock") return b.currentStock - a.currentStock;
      return a.rank - b.rank;
    });

    return result;
  }, [products, searchQuery, classificationFilter, sortBy]);

  // Export CSV Handler
  const exportCsv = () => {
    if (!products.length) return;
    const headers = [
      "Product Name",
      "Category",
      "Status",
      "Units Sold",
      "Sales (INR)",
      "How Fast Selling (Units/Day)",
      "Stock Left",
      "Stock Value (INR)",
      "Days Left Estimate",
      "Customer Rating",
      "Reviews",
      "Friendly Suggestion",
    ];

    const rows = products.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      CLASSIFICATION_CONFIG[p.classification]?.label || p.classification,
      p.unitsSold,
      p.revenue,
      p.velocity,
      p.currentStock,
      p.inventoryValue,
      p.daysOfInventory ?? "N/A",
      p.averageRating,
      p.reviewCount,
      `"${p.actionRecommendation.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `kamirafit-store-report-${timeframe}-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-7 pb-16">
      {/* 1. Header with Plain English Subtitle & Period Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line/60 pb-5">
        <SectionHeader
          eyebrow="Business Dashboard"
          title="Analytics"
          description="See how your store is doing and what needs your attention."
        />

        <div className="flex flex-wrap items-center gap-2">
          {(["today", "7d", "30d", "90d", "all"] as TimeframeOption[]).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                timeframe === tf
                  ? "bg-gold text-white shadow-sm"
                  : "border border-line bg-white/80 text-paper-muted hover:border-gold/60 hover:text-paper"
              }`}
            >
              {TIMEFRAME_LABELS[tf]}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-28 animate-pulse rounded-xl border border-line bg-ink-2/50" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-xl border border-line bg-ink-2/30" />
        </div>
      ) : isError || !summary ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-8 text-center text-sm text-rose-900 shadow-sm">
          <p className="font-bold text-base">Unable to load analytics data</p>
          <p className="mt-1 text-xs text-paper-muted">
            Please check your connection or database status and try again.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-gold px-4 py-2 text-xs font-semibold text-white hover:bg-gold-bright transition-colors shadow-sm"
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <>
          {/* 2. Needs Your Attention (Actionable Alerts) */}
          <AttentionNeededSection
            summary={summary}
            topProduct={products[0]}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onSelectTab={(tab, subFilter) => {
              if (tab === "bestsellers") setActiveTab("bestsellers");
              else if (tab === "runninglow") {
                setActiveTab("lowstock");
                if (subFilter) setRestockSubFilter(subFilter);
                else setRestockSubFilter("all");
              } else if (tab === "notmoving") setActiveTab("deadstock");
              else if (tab === "categories") setActiveTab("categories");
              else if (tab === "activity") setActiveTab("activity");
            }}
          />

          {/* 3. Key Business Numbers (Summary Cards) */}
          <AnalyticsKpiCards
            summary={summary}
            trends={trends}
            timeframe={timeframe}
            onFilterLowStock={() => {
              setActiveTab("lowstock");
              setRestockSubFilter((summary.outOfStockCount ?? 0) > 0 ? "outofstock" : "runninglow");
              document.getElementById("drilldown-tabs")?.scrollIntoView({ behavior: "smooth" });
            }}
          />

          {/* 4. Sales Overview (Clean Sales Chart) */}
          <AnalyticsTrendGraph
            timeline={timeline}
            trends={trends}
            timeframe={timeframe}
            totalRevenue={summary.totalRevenue}
            totalUnits={summary.totalUnitsSold}
            totalOrders={summary.totalOrders}
            averageOrderValue={summary.averageOrderValue}
          />

          {/* 5. Inventory Overview & Health */}
          <InventoryOverviewSection
            summary={summary}
            onFilterOutOfStock={() => {
              setActiveTab("lowstock");
              setRestockSubFilter("outofstock");
              document.getElementById("drilldown-tabs")?.scrollIntoView({ behavior: "smooth" });
            }}
            onFilterRunningLow={() => {
              setActiveTab("lowstock");
              setRestockSubFilter("runninglow");
              document.getElementById("drilldown-tabs")?.scrollIntoView({ behavior: "smooth" });
            }}
            onFilterLowStock={() => {
              setActiveTab("lowstock");
              setRestockSubFilter("all");
              document.getElementById("drilldown-tabs")?.scrollIntoView({ behavior: "smooth" });
            }}
            onFilterDeadStock={() => {
              setActiveTab("deadstock");
              document.getElementById("drilldown-tabs")?.scrollIntoView({ behavior: "smooth" });
            }}
          />

          {/* 6. Tabbed Drill-Down Navigation */}
          <div id="drilldown-tabs" className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("bestsellers")}
                  className={`px-3.5 py-1.5 text-xs rounded-lg transition-all border ${
                    activeTab === "bestsellers"
                      ? "bg-gold text-white font-semibold border-gold shadow-sm"
                      : "bg-white/80 text-paper-muted hover:text-paper hover:bg-white border-line font-medium"
                  }`}
                >
                  Best Sellers ({bestSellers.length})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("lowstock");
                    setRestockSubFilter("all");
                  }}
                  className={`px-3.5 py-1.5 text-xs rounded-lg transition-all border ${
                    activeTab === "lowstock"
                      ? "bg-gold text-white font-semibold border-gold shadow-sm"
                      : "bg-white/80 text-paper-muted hover:text-paper hover:bg-white border-line font-medium"
                  }`}
                >
                  Restock Alerts ({allRestockProducts.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("deadstock")}
                  className={`px-3.5 py-1.5 text-xs rounded-lg transition-all border ${
                    activeTab === "deadstock"
                      ? "bg-gold text-white font-semibold border-gold shadow-sm"
                      : "bg-white/80 text-paper-muted hover:text-paper hover:bg-white border-line font-medium"
                  }`}
                >
                  Products That Aren&apos;t Moving ({deadStock.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("categories")}
                  className={`px-3.5 py-1.5 text-xs rounded-lg transition-all border ${
                    activeTab === "categories"
                      ? "bg-gold text-white font-semibold border-gold shadow-sm"
                      : "bg-white/80 text-paper-muted hover:text-paper hover:bg-white border-line font-medium"
                  }`}
                >
                  Categories ({categories.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("activity")}
                  className={`px-3.5 py-1.5 text-xs rounded-lg transition-all border ${
                    activeTab === "activity"
                      ? "bg-gold text-white font-semibold border-gold shadow-sm"
                      : "bg-white/80 text-paper-muted hover:text-paper hover:bg-white border-line font-medium"
                  }`}
                >
                  Recent Stock Activity
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("all_products")}
                  className={`px-3.5 py-1.5 text-xs rounded-lg transition-all border ${
                    activeTab === "all_products"
                      ? "bg-gold text-white font-semibold border-gold shadow-sm"
                      : "bg-white/80 text-paper-muted hover:text-paper hover:bg-white border-line font-medium"
                  }`}
                >
                  All Products ({products.length})
                </button>
              </div>

              <button
                type="button"
                onClick={exportCsv}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-paper-muted hover:border-gold hover:text-gold transition-colors ml-auto shadow-sm"
              >
                <span>📥</span>
                <span>Download Report (CSV)</span>
              </button>
            </div>

            {/* TAB: BEST SELLERS */}
            {activeTab === "bestsellers" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-paper-muted">
                  <span>Products with the highest sales in this period. <strong>Click any product to view full details.</strong></span>
                  <span>{bestSellers.length} products sold</span>
                </div>

                {bestSellers.length === 0 ? (
                  <div className="rounded-xl border border-line bg-white/70 p-8 text-center text-xs text-paper-muted">
                    No sales recorded for this period yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-line bg-white/80 shadow-sm">
                    <table className="w-full text-left text-xs text-paper">
                      <thead className="border-b border-line bg-ink-3/80 text-[11px] font-bold uppercase tracking-wider text-paper">
                        <tr>
                          <th className="px-4 py-3 text-center w-14">Rank</th>
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3 text-right">Items Sold</th>
                          <th className="px-4 py-3 text-right">Total Sales</th>
                          <th className="px-4 py-3 text-right">Selling Speed</th>
                          <th className="px-4 py-3 text-right">Stock Left</th>
                          <th className="px-4 py-3 text-center">Customer Rating</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line/60">
                        {bestSellers.map((p, idx) => {
                          const speed = formatSellingSpeed(p.unitsSold, p.velocity, daysCount);
                          return (
                            <tr
                              key={p.id}
                              onClick={() => setSelectedProduct(p)}
                              className="hover:bg-ink-2/70 transition-colors cursor-pointer group"
                              title="Click to view complete performance breakdown & stock actions"
                            >
                              <td className="px-4 py-3 text-center font-bold">
                                <span
                                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                                    idx === 0
                                      ? "bg-gold text-white font-bold shadow-sm"
                                      : idx === 1
                                      ? "bg-neutral-800 text-white font-bold"
                                      : idx === 2
                                      ? "bg-amber-700 text-white font-bold"
                                      : "bg-ink-3 text-paper font-semibold border border-line"
                                  }`}
                                >
                                  {idx + 1}
                                </span>
                              </td>

                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg border border-line bg-ink-2">
                                    <Image
                                      src={p.image || "/images/placeholder.jpg"}
                                      alt={p.name}
                                      fill
                                      sizes="44px"
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-semibold text-paper group-hover:text-gold group-hover:underline line-clamp-1">
                                      {p.name}
                                    </span>
                                    <span className="text-[11px] text-paper-muted">
                                      ₹{Number(p.price).toLocaleString("en-IN")}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3 text-paper-muted font-medium">{p.category}</td>

                              <td className="px-4 py-3 text-right">
                                <span className="font-bold text-paper">{p.unitsSold} sold</span>
                                <div className="text-[11px] text-paper-muted">
                                  ({p.ordersCount} {p.ordersCount === 1 ? "order" : "orders"})
                                </div>
                              </td>

                              <td className="px-4 py-3 text-right font-bold text-gold text-sm">
                                ₹{Math.round(p.revenue).toLocaleString("en-IN")}
                              </td>

                              <td className="px-4 py-3 text-right">
                                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80 inline-block text-[11px]">
                                  {speed.speed}
                                </span>
                                <div className="text-[10px] text-paper-muted mt-0.5">{speed.sub}</div>
                              </td>

                              <td className="px-4 py-3 text-right">
                                <span className={`font-semibold ${p.currentStock <= 5 ? "text-amber-800 font-bold" : "text-paper"}`}>
                                  {p.currentStock} units
                                </span>
                              </td>

                              <td className="px-4 py-3 text-center">
                                <span className="font-semibold text-amber-700">
                                  {p.averageRating > 0 ? `★ ${p.averageRating.toFixed(1)}` : "—"}
                                </span>
                                {p.reviewCount > 0 && (
                                  <span className="text-[10px] text-paper-muted ml-1">
                                    ({p.reviewCount})
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB: RESTOCK ALERTS (OUT OF STOCK & RUNNING LOW) */}
            {activeTab === "lowstock" && (
              <div className="space-y-3.5">
                {/* Sub-filter pill buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRestockSubFilter("all")}
                      className={`px-3 py-1 text-xs rounded-lg border font-semibold transition-all ${
                        restockSubFilter === "all"
                          ? "bg-gold text-white border-gold shadow-sm"
                          : "bg-white/80 text-paper-muted hover:text-paper border-line"
                      }`}
                    >
                      All Restock Needs ({allRestockProducts.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setRestockSubFilter("outofstock")}
                      className={`px-3 py-1 text-xs rounded-lg border font-bold transition-all ${
                        restockSubFilter === "outofstock"
                          ? "bg-rose-700 text-white border-rose-700 shadow-sm"
                          : "bg-rose-50 text-rose-800 hover:bg-rose-100 border-rose-200"
                      }`}
                    >
                      🔴 Out of Stock ({outOfStockProducts.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setRestockSubFilter("runninglow")}
                      className={`px-3 py-1 text-xs rounded-lg border font-bold transition-all ${
                        restockSubFilter === "runninglow"
                          ? "bg-amber-700 text-white border-amber-700 shadow-sm"
                          : "bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-200"
                      }`}
                    >
                      🟠 Running Low ({runningLowProducts.length})
                    </button>
                  </div>

                  <span className="text-xs text-paper-muted">
                    Showing {displayedRestockProducts.length} of {allRestockProducts.length} items
                  </span>
                </div>

                {displayedRestockProducts.length === 0 ? (
                  <div className="rounded-xl border border-line bg-white/70 p-8 text-center text-xs text-paper-muted shadow-sm">
                    {restockSubFilter === "outofstock" ? (
                      <div>
                        <span className="text-2xl">🎉</span>
                        <div className="mt-1 font-bold text-sm text-paper">Zero products currently out of stock!</div>
                        <p className="mt-0.5 text-xs text-paper-muted">All active catalog garments have inventory available for purchase.</p>
                      </div>
                    ) : restockSubFilter === "runninglow" ? (
                      <div>
                        <span className="text-2xl">🎉</span>
                        <div className="mt-1 font-bold text-sm text-paper">No products running low!</div>
                        <p className="mt-0.5 text-xs text-paper-muted">All stocked products have comfortable inventory runway.</p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-2xl">🎉</span>
                        <div className="mt-1 font-bold text-sm text-paper">All products have healthy stock levels!</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-line bg-white/80 shadow-sm">
                    <table className="w-full text-left text-xs text-paper">
                      <thead className="border-b border-line bg-ink-3/80 text-[11px] font-bold uppercase tracking-wider text-paper">
                        <tr>
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3 text-right">Stock Status</th>
                          <th className="px-4 py-3 text-right">Selling Speed</th>
                          <th className="px-4 py-3 text-right" title="Estimated days until stockout">
                            Estimated Days Left
                          </th>
                          <th className="px-4 py-3">Suggested Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line/60">
                        {displayedRestockProducts.map((p) => {
                          const daysLeft = p.daysOfInventory;
                          const speed = formatSellingSpeed(p.unitsSold, p.velocity, daysCount);
                          const isOutOfStock = p.currentStock === 0;
                          return (
                            <tr
                              key={p.id}
                              onClick={() => setSelectedProduct(p)}
                              className="hover:bg-ink-2/70 transition-colors cursor-pointer group"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg border border-line bg-ink-2">
                                    <Image
                                      src={p.image || "/images/placeholder.jpg"}
                                      alt={p.name}
                                      fill
                                      sizes="44px"
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-semibold text-paper group-hover:text-gold group-hover:underline line-clamp-1">
                                      {p.name}
                                    </span>
                                    <span className="text-[11px] text-paper-muted">
                                      ₹{Number(p.price).toLocaleString("en-IN")}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3 text-paper-muted font-medium">{p.category}</td>

                              <td className="px-4 py-3 text-right">
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                                    isOutOfStock
                                      ? "bg-rose-100 text-rose-800 border-rose-300"
                                      : p.currentStock <= 5
                                      ? "bg-amber-100 text-amber-900 border-amber-300"
                                      : "bg-ink-2 text-paper border-line"
                                  }`}
                                >
                                  {isOutOfStock ? "🔴 Out of stock" : `🟠 ${p.currentStock} left`}
                                </span>
                              </td>

                              <td className="px-4 py-3 text-right">
                                <span className="font-medium text-paper text-xs">{speed.speed}</span>
                                <div className="text-[10px] text-paper-muted">{speed.sub}</div>
                              </td>

                              <td className="px-4 py-3 text-right font-medium">
                                {isOutOfStock ? (
                                  <span className="text-rose-800 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                    0 days (Depleted)
                                  </span>
                                ) : daysLeft !== null && daysLeft <= 14 ? (
                                  <span className="text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                    ≈ {daysLeft} days
                                  </span>
                                ) : daysLeft !== null ? (
                                  <span className="text-paper">≈ {daysLeft} days</span>
                                ) : (
                                  <span className="text-paper-muted">Based on recent sales</span>
                                )}
                              </td>

                              <td className="px-4 py-3">
                                <span className="text-[11px] text-paper-muted group-hover:text-paper transition-colors">
                                  {isOutOfStock
                                    ? "Urgent: Expedite restock or publish updated inventory."
                                    : p.actionRecommendation || "Consider ordering fresh stock to avoid running out."}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB: PRODUCTS THAT AREN'T MOVING */}
            {activeTab === "deadstock" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-line bg-white/80 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
                  <div>
                    <h3 className="text-xs font-bold text-paper uppercase tracking-wider">
                      Products with No Sales in This Period
                    </h3>
                    <p className="text-[11px] text-paper-muted mt-0.5">
                      Units sitting in your stock that haven&apos;t generated sales during the selected dates. Click any item to inspect.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-paper-muted">Total Stock Value Tied Up</span>
                    <div className="text-xl font-bold text-gold">
                      ₹{Math.round(summary.deadStockValue || 0).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                {deadStock.length === 0 ? (
                  <div className="rounded-xl border border-line bg-white/70 p-8 text-center text-xs text-paper-muted">
                    🎉 Excellent! Every product in your store had sales activity during this period.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-line bg-white/80 shadow-sm">
                    <table className="w-full text-left text-xs text-paper">
                      <thead className="border-b border-line bg-ink-3/80 text-[11px] font-bold uppercase tracking-wider text-paper">
                        <tr>
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3 text-right">Price</th>
                          <th className="px-4 py-3 text-right">Stock Sitting</th>
                          <th className="px-4 py-3 text-right">Value Tied Up</th>
                          <th className="px-4 py-3">Friendly Suggestion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line/60">
                        {deadStock.map((p) => (
                          <tr
                            key={p.id}
                            onClick={() => setSelectedProduct(p)}
                            className="hover:bg-ink-2/70 transition-colors cursor-pointer group"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg border border-line bg-ink-2">
                                  <Image
                                    src={p.image || "/images/placeholder.jpg"}
                                    alt={p.name}
                                    fill
                                    sizes="44px"
                                    className="object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <span className="font-semibold text-paper group-hover:text-gold group-hover:underline line-clamp-1">
                                    {p.name}
                                  </span>
                                  <span className="text-[11px] text-paper-muted">0 sold in period</span>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3 text-paper-muted font-medium">{p.category}</td>

                            <td className="px-4 py-3 text-right font-medium">
                              ₹{Number(p.price || 0).toLocaleString("en-IN")}
                            </td>

                            <td className="px-4 py-3 text-right font-bold text-paper">
                              {p.currentStock || 0} units
                            </td>

                            <td className="px-4 py-3 text-right font-bold text-rose-800">
                              ₹{Math.round(p.inventoryValue || 0).toLocaleString("en-IN")}
                            </td>

                            <td className="px-4 py-3">
                              <span className="text-[11px] text-paper-muted group-hover:text-paper transition-colors">
                                Consider reviewing the price, promotion, or product photos.
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB: CATEGORIES */}
            {activeTab === "categories" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-paper-muted">
                  <span>How each product category contributed to your overall sales. <strong>Click a category to filter products.</strong></span>
                  <span>{categories.length} categories</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-line bg-white/80 shadow-sm">
                  <table className="w-full text-left text-xs text-paper">
                    <thead className="border-b border-line bg-ink-3/80 text-[11px] font-bold uppercase tracking-wider text-paper">
                      <tr>
                        <th className="px-4 py-3 text-center w-14">Rank</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3 text-right">Sales &amp; Share</th>
                        <th className="px-4 py-3 text-right">Items Sold</th>
                        <th className="px-4 py-3 text-right">Current Stock</th>
                        <th className="px-4 py-3 text-right">Stock Value</th>
                        <th className="px-4 py-3 text-center">Avg Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/60">
                      {categories.map((c, idx) => (
                        <tr
                          key={c.id}
                          onClick={() => {
                            setSearchQuery(c.name);
                            setActiveTab("all_products");
                          }}
                          className="hover:bg-ink-2/70 transition-colors cursor-pointer group"
                          title="Click to view products in this category"
                        >
                          <td className="px-4 py-3 text-center font-bold text-paper-muted">
                            #{idx + 1}
                          </td>

                          <td className="px-4 py-3">
                            <span className="font-semibold text-paper group-hover:text-gold group-hover:underline">
                              {c.name}
                            </span>
                            <span className="text-[11px] font-normal text-paper-muted block">
                              {c.productCount} products
                            </span>
                          </td>

                          <td className="px-4 py-3 text-right">
                            <span className="font-bold text-gold text-sm">
                              ₹{Math.round(c.revenue || 0).toLocaleString("en-IN")}
                            </span>
                            <div className="mt-1 flex items-center justify-end gap-1.5">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-line">
                                <div
                                  className="h-full bg-gold rounded-full"
                                  style={{ width: `${Math.min(c.revenueShare || 0, 100)}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-paper-muted font-medium">
                                {(c.revenueShare || 0).toFixed(1)}%
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-right font-medium text-paper">
                            {c.unitsSold || 0} units
                          </td>

                          <td className="px-4 py-3 text-right text-paper-muted">
                            {c.totalStock || 0} units
                          </td>

                          <td className="px-4 py-3 text-right text-paper-muted font-medium">
                            ₹{Math.round(c.inventoryValue || 0).toLocaleString("en-IN")}
                          </td>

                          <td className="px-4 py-3 text-center text-amber-700 font-semibold">
                            {c.averageRating > 0 ? `★ ${c.averageRating.toFixed(1)}` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: RECENT STOCK ACTIVITY */}
            {activeTab === "activity" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-paper-muted">
                  <span>Audit trail of recent sales, returns, and customer reservations.</span>
                  <span>Latest activity</span>
                </div>
                <RecentMovementsSection movements={analytics?.recentMovements} />
              </div>
            )}

            {/* TAB: ALL PRODUCTS (FILTER & SEARCH) */}
            {activeTab === "all_products" && (
              <div className="flex flex-col gap-4">
                {/* Search & Filter Controls */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-1 items-center gap-3">
                    <div className="w-full sm:max-w-xs">
                      <SearchField
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search product or category…"
                        label="Filter products"
                      />
                    </div>
                    <span className="text-xs text-paper-muted whitespace-nowrap">
                      Showing {filteredProducts.length} of {products.length}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-paper-muted">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(
                          e.target.value as
                            | "rank"
                            | "revenue"
                            | "units"
                            | "velocity"
                            | "rating"
                            | "stock"
                        )
                      }
                      className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs text-paper focus:border-gold focus:outline-none shadow-sm"
                    >
                      <option value="rank">Recommended Order</option>
                      <option value="revenue">Total Sales</option>
                      <option value="units">Items Sold</option>
                      <option value="velocity">Selling Speed</option>
                      <option value="rating">Customer Rating</option>
                      <option value="stock">Stock Left</option>
                    </select>

                    <select
                      value={classificationFilter}
                      onChange={(e) => setClassificationFilter(e.target.value)}
                      className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs text-paper focus:border-gold focus:outline-none shadow-sm"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="STAR_PERFORMER">Top Sellers</option>
                      <option value="HIGH_VELOCITY">Selling Fast</option>
                      <option value="STABLE">Steady</option>
                      <option value="LACKING">Slow Moving</option>
                      <option value="DEAD_STOCK">Not Moving</option>
                      <option value="OUT_OF_STOCK">Out of Stock</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-line bg-white/80 shadow-sm">
                  <table className="w-full text-left text-xs text-paper">
                    <thead className="border-b border-line bg-ink-3/80 text-[11px] font-bold uppercase tracking-wider text-paper">
                      <tr>
                        <th className="px-4 py-3 text-center w-14">#</th>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Items Sold</th>
                        <th className="px-4 py-3 text-right">Sales</th>
                        <th className="px-4 py-3 text-right">Selling Speed</th>
                        <th className="px-4 py-3 text-right">Stock Left</th>
                        <th className="px-4 py-3 text-right">Days Left</th>
                        <th className="px-4 py-3 text-center">Reviews</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/60">
                      {filteredProducts.map((p, idx) => {
                        const badge = CLASSIFICATION_CONFIG[p.classification];
                        const speed = formatSellingSpeed(p.unitsSold, p.velocity, daysCount);
                        return (
                          <tr
                            key={p.id}
                            onClick={() => setSelectedProduct(p)}
                            className="hover:bg-ink-2/70 transition-colors cursor-pointer group"
                          >
                            <td className="px-4 py-3 text-center text-paper-muted font-medium">{idx + 1}</td>

                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg border border-line bg-ink-2">
                                  <Image
                                    src={p.image || "/images/placeholder.jpg"}
                                    alt={p.name}
                                    fill
                                    sizes="44px"
                                    className="object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <span className="font-semibold text-paper group-hover:text-gold group-hover:underline line-clamp-1">
                                    {p.name}
                                  </span>
                                  <span className="text-[11px] text-paper-muted">
                                    {p.category} · ₹{Number(p.price).toLocaleString("en-IN")}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${badge.bg} ${badge.text} ${badge.border}`}
                              >
                                {badge.label}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-right font-medium text-paper">
                              {p.unitsSold} units
                            </td>

                            <td className="px-4 py-3 text-right font-bold text-gold">
                              ₹{Math.round(p.revenue).toLocaleString("en-IN")}
                            </td>

                            <td className="px-4 py-3 text-right">
                              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80 inline-block text-[11px]">
                                {speed.speed}
                              </span>
                              <div className="text-[10px] text-paper-muted mt-0.5">{speed.sub}</div>
                            </td>

                            <td className="px-4 py-3 text-right font-medium text-paper">
                              {p.currentStock} left
                            </td>

                            <td className="px-4 py-3 text-right text-paper-muted font-medium">
                              {p.currentStock === 0 ? (
                                <span className="text-rose-800 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                  Out of stock
                                </span>
                              ) : p.daysOfInventory !== null ? (
                                `≈ ${p.daysOfInventory} days`
                              ) : (
                                "—"
                              )}
                            </td>

                            <td className="px-4 py-3 text-center">
                              <span className="text-amber-700 font-semibold">
                                {p.averageRating > 0 ? `★ ${p.averageRating.toFixed(1)}` : "—"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* 7. AI Business Assistant */}
          <AiAnalyticsSection timeframe={timeframe} />

          {/* 8. Interactive Product Diagnostics Modal */}
          <ProductAnalyticsDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            daysCount={daysCount}
          />
        </>
      )}
    </div>
  );
}
