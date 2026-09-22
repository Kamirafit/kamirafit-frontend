"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import AdminCard from "../components/AdminCard";
import SearchField from "../components/SearchField";
import AiAnalyticsSection from "../components/AiAnalyticsSection";
import MiniSparkline from "../components/MiniSparkline";
import AnalyticsTrendGraph from "../components/AnalyticsTrendGraph";
import { useBusinessAnalytics } from "@/services/admin";
import type {
  ProductPerformance,
  TimeframeOption,
} from "@/types/entities/analytics";

type ActiveTab = "products" | "categories" | "deadstock";

const TIMEFRAME_LABELS: Record<TimeframeOption, string> = {
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  "90d": "Last Quarter (90d)",
  all: "All Time",
};

const CLASSIFICATION_CONFIG: Record<
  ProductPerformance["classification"],
  { label: string; bg: string; text: string; border: string }
> = {
  STAR_PERFORMER: {
    label: "Star Performer",
    bg: "bg-amber-400/15",
    text: "text-amber-300",
    border: "border-amber-400/40",
  },
  HIGH_VELOCITY: {
    label: "High Velocity",
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/40",
  },
  STABLE: {
    label: "Stable",
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    border: "border-blue-500/40",
  },
  LACKING: {
    label: "Lacking Behind",
    bg: "bg-orange-500/15",
    text: "text-orange-400",
    border: "border-orange-500/40",
  },
  DEAD_STOCK: {
    label: "Dead Stock",
    bg: "bg-rose-500/15",
    text: "text-rose-400",
    border: "border-rose-500/40",
  },
  OUT_OF_STOCK: {
    label: "Out of Stock",
    bg: "bg-neutral-600/20",
    text: "text-neutral-400",
    border: "border-neutral-600/40",
  },
};

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState<TimeframeOption>("30d");
  const [activeTab, setActiveTab] = useState<ActiveTab>("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [classificationFilter, setClassificationFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"rank" | "revenue" | "units" | "velocity" | "rating" | "stock">("rank");

  const { data: analytics, isLoading, isError, refetch } = useBusinessAnalytics(timeframe);

  const summary = analytics?.summary;
  const timeline = analytics?.timeline;
  const trends = analytics?.trends;
  const products = useMemo(() => analytics?.rankedProducts || [], [analytics?.rankedProducts]);
  const categories = useMemo(() => analytics?.rankedCategories || [], [analytics?.rankedCategories]);
  const deadStock = useMemo(() => analytics?.deadStockReport || [], [analytics?.deadStockReport]);

  // Filtered and sorted products
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
      "Rank",
      "Product Name",
      "Category",
      "Status",
      "Classification",
      "Units Sold",
      "Revenue (INR)",
      "Velocity (Units/Day)",
      "Current Stock",
      "Inventory Value (INR)",
      "Days of Inventory",
      "Rating",
      "Review Count",
      "Recommendation",
    ];

    const rows = products.map((p) => [
      p.rank,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.status,
      p.classification,
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
    link.setAttribute("download", `kamirafit-analytics-${timeframe}-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Page Header with Timeframe Select */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader
          eyebrow="Intelligence & Executive Decisions"
          title="Business Analytics"
          description="Algorithmic ranking across sales volume, sales velocity, user reviews, inventory runout forecasts, and dead-stock diagnostics."
        />

        <div className="flex flex-wrap items-center gap-2">
          {(["7d", "30d", "90d", "all"] as TimeframeOption[]).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                timeframe === tf
                  ? "border border-gold bg-gold text-ink"
                  : "border border-line text-paper-muted hover:border-gold/60 hover:text-gold"
              }`}
            >
              {TIMEFRAME_LABELS[tf]}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 animate-pulse rounded-2xl border border-line bg-ink-2/40" />
          ))}
        </div>
      ) : isError || !summary ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center text-sm text-red-400">
          <p className="font-semibold">Unable to compile business analytics</p>
          <p className="mt-1 text-xs text-paper-muted">Verify database connectivity and try again.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-gold px-4 py-2 text-xs font-semibold text-ink"
          >
            Retry Analytics
          </button>
        </div>
      ) : (
        <>
          {/* Executive KPI Cards with Sparklines & Trend Indicators */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Revenue & AOV */}
            <AdminCard padding="md">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-paper-muted">
                      Gross Revenue ({TIMEFRAME_LABELS[timeframe]})
                    </span>
                    {trends && (
                      <span
                        className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          trends.revenueGrowth > 0
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : trends.revenueGrowth < 0
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            : "bg-neutral-500/15 text-paper-muted border border-line"
                        }`}
                      >
                        {trends.revenueGrowth > 0 ? "▲ +" : trends.revenueGrowth < 0 ? "▼ " : "— "}
                        {trends.revenueGrowth}%
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-baseline justify-between gap-2">
                    <span className="text-2xl font-bold tracking-tight text-gold">
                      ₹{Math.round(summary.totalRevenue || 0).toLocaleString("en-IN")}
                    </span>
                    <MiniSparkline
                      data={trends?.revenueSparkline}
                      color="gold"
                      width={84}
                      height={32}
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-paper-muted border-t border-line/60 pt-2">
                  <span>AOV: ₹{Math.round(summary.averageOrderValue || 0).toLocaleString("en-IN")}</span>
                  <span>{summary.totalOrders ?? 0} Orders</span>
                </div>
              </div>
            </AdminCard>

            {/* Units Sold & Sales Velocity */}
            <AdminCard padding="md">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-paper-muted">
                      Units Sold &amp; Velocity
                    </span>
                    {trends && (
                      <span
                        className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          trends.unitsGrowth > 0
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : trends.unitsGrowth < 0
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            : "bg-neutral-500/15 text-paper-muted border border-line"
                        }`}
                      >
                        {trends.unitsGrowth > 0 ? "▲ +" : trends.unitsGrowth < 0 ? "▼ " : "— "}
                        {trends.unitsGrowth}%
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-baseline justify-between gap-2">
                    <span className="text-2xl font-bold tracking-tight text-paper">
                      {(summary.totalUnitsSold || 0).toLocaleString("en-IN")}{" "}
                      <span className="text-xs font-normal text-paper-muted">units</span>
                    </span>
                    <MiniSparkline
                      data={trends?.unitsSparkline}
                      color="emerald"
                      width={84}
                      height={32}
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-paper-muted border-t border-line/60 pt-2">
                  <span>Store Velocity:</span>
                  <span className="font-semibold text-emerald-400">
                    {((summary.totalUnitsSold || 0) / Math.max(summary.daysCount || 1, 1)).toFixed(1)} units/day
                  </span>
                </div>
              </div>
            </AdminCard>

            {/* Total Inventory Stock & Valuation */}
            <AdminCard padding="md">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-paper-muted">
                      Warehouse Stock &amp; Value
                    </span>
                    <span className="rounded bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/30">
                      Physical Hold
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between gap-2">
                    <span className="text-2xl font-bold tracking-tight text-paper">
                      ₹{Math.round(summary.totalInventoryValue || 0).toLocaleString("en-IN")}
                    </span>
                    <MiniSparkline
                      data={trends?.stockSparkline}
                      color="blue"
                      width={84}
                      height={32}
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-paper-muted border-t border-line/60 pt-2">
                  <span>Physical Stock:</span>
                  <span className="font-semibold text-paper">
                    {(summary.totalStockUnits || 0).toLocaleString("en-IN")} units
                  </span>
                </div>
              </div>
            </AdminCard>

            {/* Dead Stock & Trapped Working Capital */}
            <AdminCard padding="md">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-rose-400">
                      Dead Stock Capital Trapped
                    </span>
                    <span className="rounded bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/30">
                      {summary.deadStockCount ?? 0} SKUs
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between gap-2">
                    <span className="text-2xl font-bold tracking-tight text-rose-400">
                      ₹{Math.round(summary.deadStockValue || 0).toLocaleString("en-IN")}
                    </span>
                    <MiniSparkline
                      data={trends?.deadStockSparkline}
                      color="rose"
                      width={84}
                      height={32}
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-paper-muted border-t border-line/60 pt-2">
                  <span>Avg Rating:</span>
                  <span className="font-semibold text-amber-400">
                    ★ {(summary.averageStoreRating || 0).toFixed(1)} / 5.0
                  </span>
                </div>
              </div>
            </AdminCard>
          </div>

          {/* Interactive Sales Velocity & Revenue Trend Timeline Graph */}
          <AnalyticsTrendGraph
            timeline={timeline}
            trends={trends}
            timeframe={timeframe}
            totalRevenue={summary.totalRevenue}
            totalUnits={summary.totalUnitsSold}
            totalOrders={summary.totalOrders}
            averageOrderValue={summary.averageOrderValue}
          />

          {/* AI Executive Intelligence (Grounded Business Diagnostics) */}
          <AiAnalyticsSection timeframe={timeframe} />

          {/* Critical Executive Alert Banners */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Urgent Restock Callout */}
            {(summary.criticalRestockCount || 0) > 0 && (
              <div className="flex items-start gap-3.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
                <span className="text-2xl">⚠️</span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-amber-300">
                    Stockout Risk Detected ({summary.criticalRestockCount || 0} High-Velocity Products)
                  </span>
                  <p className="mt-1 text-xs text-paper/80 leading-relaxed">
                    Based on current daily burn rates, these bestsellers will deplete within 14 days. Issue purchase orders to prevent revenue leakage.
                  </p>
                </div>
              </div>
            )}

            {/* Dead Stock Callout */}
            {(summary.deadStockCount || 0) > 0 && (
              <div className="flex items-start gap-3.5 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4">
                <span className="text-2xl">❄️</span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-rose-300">
                    {summary.deadStockCount || 0} Inactive Products Trapping ₹
                    {Math.round(summary.deadStockValue || 0).toLocaleString("en-IN")} Working Capital
                  </span>
                  <p className="mt-1 text-xs text-paper/80 leading-relaxed">
                    Zero sales registered during this window despite physical warehouse holding. Consider markdown clearance or promotional bundling to liberate capital.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("products")}
                className={`pb-2 text-sm font-semibold transition-colors relative ${
                  activeTab === "products"
                    ? "text-gold after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-0.5 after:bg-gold"
                    : "text-paper-muted hover:text-paper"
                }`}
              >
                Products Ranking ({products.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("categories")}
                className={`pb-2 text-sm font-semibold transition-colors relative ${
                  activeTab === "categories"
                    ? "text-gold after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-0.5 after:bg-gold"
                    : "text-paper-muted hover:text-paper"
                }`}
              >
                Categories Ranking ({categories.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("deadstock")}
                className={`pb-2 text-sm font-semibold transition-colors relative ${
                  activeTab === "deadstock"
                    ? "text-gold after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-0.5 after:bg-gold"
                    : "text-paper-muted hover:text-paper"
                }`}
              >
                Dead Stock Diagnostic ({deadStock.length})
              </button>
            </div>

            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-ink-2 px-3 py-1.5 text-xs font-semibold text-paper-muted hover:border-gold hover:text-gold transition-colors"
            >
              <span>📥</span>
              Export Decision CSV
            </button>
          </div>

          {/* TAB 1: PRODUCTS RANKING (BEST TO WORST) */}
          {activeTab === "products" && (
            <div className="flex flex-col gap-4">
              {/* Filter & Sort Bar */}
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 items-center gap-3">
                  <div className="w-full sm:max-w-xs">
                    <SearchField
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder="Search product or category…"
                      label="Filter rankings"
                    />
                  </div>
                  <span className="text-xs text-paper-muted whitespace-nowrap">
                    Showing {filteredProducts.length} of {products.length}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-paper-muted">Sort by:</span>
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
                    className="rounded-lg border border-line bg-ink-2 px-3 py-1.5 text-xs text-paper focus:border-gold focus:outline-none"
                  >
                    <option value="rank">Algorithmic Rank (Best to Worst)</option>
                    <option value="revenue">Gross Revenue</option>
                    <option value="units">Units Sold</option>
                    <option value="velocity">Daily Velocity</option>
                    <option value="rating">Review Rating</option>
                    <option value="stock">Current Stock</option>
                  </select>

                  <select
                    value={classificationFilter}
                    onChange={(e) => setClassificationFilter(e.target.value)}
                    className="rounded-lg border border-line bg-ink-2 px-3 py-1.5 text-xs text-paper focus:border-gold focus:outline-none"
                  >
                    <option value="ALL">All Classifications</option>
                    <option value="STAR_PERFORMER">Star Performers</option>
                    <option value="HIGH_VELOCITY">High Velocity</option>
                    <option value="STABLE">Stable</option>
                    <option value="LACKING">Lacking Behind</option>
                    <option value="DEAD_STOCK">Dead Stock</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Products Ranking Table */}
              <div className="overflow-x-auto rounded-2xl border border-line bg-ink">
                <table className="w-full text-left text-xs text-paper">
                  <thead className="border-b border-line bg-ink-2/60 text-[11px] uppercase tracking-wider text-paper-muted">
                    <tr>
                      <th className="px-4 py-3.5 text-center w-16">Rank</th>
                      <th className="px-4 py-3.5">Product & Category</th>
                      <th className="px-4 py-3.5">Classification</th>
                      <th className="px-4 py-3.5 text-right">Sold & Revenue</th>
                      <th className="px-4 py-3.5 text-right">Velocity</th>
                      <th className="px-4 py-3.5 text-right">Stock & Value</th>
                      <th className="px-4 py-3.5 text-right">Runout Forecast</th>
                      <th className="px-4 py-3.5 text-center">Reviews</th>
                      <th className="px-4 py-3.5">Actionable Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {filteredProducts.map((p) => {
                      const badge = CLASSIFICATION_CONFIG[p.classification];

                      return (
                        <tr
                          key={p.id}
                          className="transition-colors hover:bg-ink-2/40"
                        >
                          {/* Rank */}
                          <td className="px-4 py-3 text-center font-bold">
                            <span
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                                p.rank === 1
                                  ? "bg-amber-400 text-ink font-extrabold shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                                  : p.rank === 2
                                  ? "bg-neutral-300 text-ink font-bold"
                                  : p.rank === 3
                                  ? "bg-amber-700 text-white font-bold"
                                  : "text-paper-muted font-normal"
                              }`}
                            >
                              #{p.rank}
                            </span>
                          </td>

                          {/* Product Info */}
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
                              <div className="min-w-0 flex-1">
                                <span className="font-semibold text-paper line-clamp-1">
                                  {p.name}
                                </span>
                                <div className="flex items-center gap-1.5 text-[11px] text-paper-muted">
                                  <span className="text-gold">{p.category}</span>
                                  <span>·</span>
                                  <span>₹{Number(p.price).toLocaleString("en-IN")}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Classification */}
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {badge.label}
                            </span>
                          </td>

                          {/* Units Sold & Revenue */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex flex-col">
                              <span className="font-bold text-paper">
                                ₹{Math.round(p.revenue || 0).toLocaleString("en-IN")}
                              </span>
                              <span className="text-[11px] text-paper-muted">
                                {p.unitsSold || 0} units ({p.ordersCount || 0} orders)
                              </span>
                            </div>
                          </td>

                          {/* Velocity */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex flex-col">
                              <span
                                className={`font-semibold ${
                                  (p.velocity || 0) > 1
                                    ? "text-emerald-400"
                                    : (p.velocity || 0) > 0
                                    ? "text-blue-400"
                                    : "text-paper-muted"
                                }`}
                              >
                                {(p.velocity || 0).toFixed(2)}/day
                              </span>
                              <span className="text-[10px] text-paper-muted">units burned</span>
                            </div>
                          </td>

                          {/* Stock & Inventory Valuation */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex flex-col">
                              <span className="font-semibold text-paper">
                                {p.currentStock || 0} in stock
                              </span>
                              <span className="text-[11px] text-paper-muted">
                                ₹{Math.round(p.inventoryValue || 0).toLocaleString("en-IN")} val
                              </span>
                            </div>
                          </td>

                          {/* Days of Inventory Remaining (DOIR) */}
                          <td className="px-4 py-3 text-right">
                            {(p.currentStock || 0) === 0 ? (
                              <span className="font-semibold text-neutral-400">OUT OF STOCK</span>
                            ) : p.daysOfInventory === null ? (
                              <span className="text-rose-400 font-medium">No sales</span>
                            ) : (p.daysOfInventory || 0) <= 14 ? (
                              <span className="inline-flex items-center gap-1 font-bold text-amber-400">
                                <span>⚠️</span> {p.daysOfInventory} days
                              </span>
                            ) : (p.daysOfInventory || 0) <= 60 ? (
                              <span className="font-semibold text-emerald-400">
                                {p.daysOfInventory} days
                              </span>
                            ) : (
                              <span className="font-medium text-orange-400">
                                {p.daysOfInventory} days (over)
                              </span>
                            )}
                          </td>

                          {/* Reviews */}
                          <td className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-bold text-amber-400">
                                ★ {(p.averageRating || 0) > 0 ? (p.averageRating || 0).toFixed(1) : "—"}
                              </span>
                              <span className="text-[10px] text-paper-muted">
                                ({p.reviewCount || 0} rev)
                              </span>
                            </div>
                          </td>

                          {/* Recommendation */}
                          <td className="px-4 py-3">
                            <p className="max-w-xs text-[11px] leading-snug text-paper-muted">
                              {p.actionRecommendation}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CATEGORIES RANKING (BEST TO WORST) */}
          {activeTab === "categories" && (
            <div className="flex flex-col gap-4">
              <div className="overflow-x-auto rounded-2xl border border-line bg-ink">
                <table className="w-full text-left text-xs text-paper">
                  <thead className="border-b border-line bg-ink-2/60 text-[11px] uppercase tracking-wider text-paper-muted">
                    <tr>
                      <th className="px-4 py-3.5 text-center w-16">Rank</th>
                      <th className="px-4 py-3.5">Category Name</th>
                      <th className="px-4 py-3.5">Strategic Role</th>
                      <th className="px-4 py-3.5 text-right">Revenue & Share</th>
                      <th className="px-4 py-3.5 text-right">Volume</th>
                      <th className="px-4 py-3.5 text-right">Avg Price</th>
                      <th className="px-4 py-3.5 text-right">Stock & Valuation</th>
                      <th className="px-4 py-3.5 text-right">Dead Stock Exposure</th>
                      <th className="px-4 py-3.5 text-center">Category Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {categories.map((c) => {
                      const isDriver = c.status === "DRIVER_CATEGORY";
                      const isLacking = c.status === "LACKING";

                      return (
                        <tr key={c.id} className="transition-colors hover:bg-ink-2/40">
                          <td className="px-4 py-3 text-center font-bold">
                            <span
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                                c.rank === 1
                                  ? "bg-amber-400 text-ink font-bold shadow-[0_0_10px_rgba(251,191,36,0.4)]"
                                  : "text-paper-muted"
                              }`}
                            >
                              #{c.rank}
                            </span>
                          </td>

                          <td className="px-4 py-3 font-semibold text-paper text-sm">
                            {c.name}
                            <div className="text-[11px] font-normal text-paper-muted">
                              {c.productCount} active SKUs
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                isDriver
                                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                                  : isLacking
                                  ? "border-rose-500/40 bg-rose-500/15 text-rose-400"
                                  : "border-blue-500/40 bg-blue-500/15 text-blue-400"
                              }`}
                            >
                              {(c.status || "STABLE").replace(/_/g, " ")}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-bold text-gold">
                                ₹{Math.round(c.revenue || 0).toLocaleString("en-IN")}
                              </span>
                              <div className="mt-1 flex items-center gap-1.5 w-24">
                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                                  <div
                                    className="h-full bg-gold rounded-full"
                                    style={{ width: `${Math.min(c.revenueShare || 0, 100)}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-paper-muted">
                                  {(c.revenueShare || 0).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-right">
                            <span className="font-semibold text-paper">
                              {c.unitsSold || 0} units
                            </span>
                          </td>

                          <td className="px-4 py-3 text-right text-paper">
                            ₹{Math.round(c.averagePrice || 0).toLocaleString("en-IN")}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div className="flex flex-col">
                              <span className="font-semibold text-paper">{c.totalStock || 0} units</span>
                              <span className="text-[11px] text-paper-muted">
                                ₹{Math.round(c.inventoryValue || 0).toLocaleString("en-IN")} val
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div className="flex flex-col">
                              <span
                                className={`font-semibold ${
                                  (c.deadStockCount || 0) > 0 ? "text-rose-400" : "text-emerald-400"
                                }`}
                              >
                                {c.deadStockCount || 0} SKUs
                              </span>
                              {(c.deadStockValue || 0) > 0 && (
                                <span className="text-[11px] text-rose-400/80">
                                  ₹{Math.round(c.deadStockValue || 0).toLocaleString("en-IN")} trapped
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span className="font-bold text-amber-400">
                              ★ {(c.averageRating || 0) > 0 ? (c.averageRating || 0).toFixed(1) : "—"}
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

          {/* TAB 3: DEAD STOCK & CAPITAL TRAPPED DIAGNOSTIC */}
          {activeTab === "deadstock" && (
            <div className="flex flex-col gap-6">
              {/* Executive Diagnostic Advice Header */}
              <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-rose-300">
                      Working Capital Liquidation Protocol
                    </h3>
                    <p className="mt-1 text-xs text-paper/80 leading-relaxed max-w-2xl">
                      The items below represent idle inventory: products with zero sales during the {TIMEFRAME_LABELS[timeframe]} window that continue to incur carrying costs and tie up liquidity.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs uppercase tracking-wider text-rose-300 font-semibold">
                      Total Capital Locked
                    </span>
                    <div className="text-2xl font-extrabold text-rose-400">
                      ₹{Math.round(summary.deadStockValue).toLocaleString("en-IN")}
                    </div>
                    <span className="text-xs text-paper-muted">across {deadStock.length} products</span>
                  </div>
                </div>
              </div>

              {deadStock.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line py-16 text-center">
                  <span className="text-3xl">🎉</span>
                  <p className="mt-2 text-sm font-semibold text-paper">Zero Dead Stock Identified</p>
                  <p className="mt-1 text-xs text-paper-muted">
                    Every stocked product in the catalog generated sales activity during this timeframe.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-line bg-ink">
                  <table className="w-full text-left text-xs text-paper">
                    <thead className="border-b border-line bg-ink-2/60 text-[11px] uppercase tracking-wider text-paper-muted">
                      <tr>
                        <th className="px-4 py-3.5">Idle Product</th>
                        <th className="px-4 py-3.5">Category</th>
                        <th className="px-4 py-3.5 text-right">Unit Price</th>
                        <th className="px-4 py-3.5 text-right">Idle Stock</th>
                        <th className="px-4 py-3.5 text-right">Trapped Valuation</th>
                        <th className="px-4 py-3.5 text-center">Reviews</th>
                        <th className="px-4 py-3.5">Prescribed Action Plan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/60">
                      {deadStock.map((p) => (
                        <tr key={p.id} className="transition-colors hover:bg-ink-2/40">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-line bg-ink-2">
                                <Image
                                  src={p.image || "/images/placeholder.jpg"}
                                  alt={p.name}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <span className="font-semibold text-paper line-clamp-1">{p.name}</span>
                                <span className="text-[11px] text-paper-muted">ID: {p.id}</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-gold font-medium">{p.category}</td>

                          <td className="px-4 py-3 text-right">
                            ₹{Number(p.price || 0).toLocaleString("en-IN")}
                          </td>

                          <td className="px-4 py-3 text-right font-bold text-rose-400">
                            {p.currentStock || 0} units
                          </td>

                          <td className="px-4 py-3 text-right font-extrabold text-rose-400">
                            ₹{Math.round(p.inventoryValue || 0).toLocaleString("en-IN")}
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span className="font-medium text-paper-muted">
                              {(p.reviewCount || 0) > 0 ? `★ ${(p.averageRating || 0).toFixed(1)} (${p.reviewCount || 0})` : "No reviews"}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center rounded bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
                                Clearance / Bundle
                              </span>
                              <span className="text-[11px] text-paper-muted">
                                {p.actionRecommendation}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
