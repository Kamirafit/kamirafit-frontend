"use client";

import type { AnalyticsSummary, AnalyticsTrends, TimeframeOption } from "@/types/entities/analytics";
import AdminCard from "./AdminCard";
import MiniSparkline from "./MiniSparkline";

interface Props {
  summary: AnalyticsSummary;
  trends?: AnalyticsTrends;
  timeframe: TimeframeOption;
  onFilterLowStock?: () => void;
}

const TIMEFRAME_SHORT_LABELS: Record<TimeframeOption, string> = {
  today: "Today",
  "7d": "7d",
  "30d": "30d",
  "90d": "90d",
  all: "All",
};

export default function AnalyticsKpiCards({
  summary,
  trends,
  timeframe,
  onFilterLowStock,
}: Props) {
  const periodLabel = TIMEFRAME_SHORT_LABELS[timeframe] || "Period";

  const outOfStockCount = summary.outOfStockCount ?? 0;
  const runningLowCount = summary.runningLowCount ?? summary.criticalRestockCount ?? 0;
  const days = Math.max(summary.daysCount || 1, 1);
  const unitsSold = summary.totalUnitsSold || 0;
  const unitsPerDay = (unitsSold / days).toFixed(1);

  // Humanize selling pace
  const humanizedPace =
    unitsSold === 0
      ? "No sales yet"
      : Number(unitsPerDay) >= 2
      ? `~${Math.round(Number(unitsPerDay))} / day`
      : Number(unitsPerDay) >= 1
      ? `~${unitsPerDay} / day`
      : days <= 30 && unitsSold <= 3
      ? `${unitsSold} ${unitsSold === 1 ? "sale" : "sales"} this month`
      : `~${Math.max(1, Math.round((unitsSold / days) * 7))} / week`;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. SALES */}
      <AdminCard padding="md" className="group relative bg-white/80 border-line shadow-sm">
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-semibold uppercase tracking-wider text-paper-muted cursor-help"
                title="Total revenue from delivered and confirmed orders during this period."
              >
                Sales ({periodLabel})
              </span>
              {trends && trends.revenueGrowth !== 0 && (
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold border ${
                    trends.revenueGrowth > 0
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-rose-100 text-rose-800 border-rose-300"
                  }`}
                  title={`${Math.abs(trends.revenueGrowth)}% compared to the previous ${periodLabel} period`}
                >
                  {trends.revenueGrowth > 0 ? "↑ +" : "↓ "}
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
                width={76}
                height={28}
              />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-paper-muted border-t border-line/60 pt-2">
            <span>Avg order: ₹{Math.round(summary.averageOrderValue || 0).toLocaleString("en-IN")}</span>
            <span className="font-medium text-paper">
              {summary.totalOrders ?? 0} {summary.totalOrders === 1 ? "order" : "orders"}
            </span>
          </div>
        </div>
      </AdminCard>

      {/* 2. ORDERS */}
      <AdminCard padding="md" className="bg-white/80 border-line shadow-sm">
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-semibold uppercase tracking-wider text-paper-muted cursor-help"
                title="Total number of customer orders placed during this period (excluding cancellations)."
              >
                Orders ({periodLabel})
              </span>
              {trends && trends.ordersGrowth !== 0 && (
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold border ${
                    trends.ordersGrowth > 0
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-rose-100 text-rose-800 border-rose-300"
                  }`}
                >
                  {trends.ordersGrowth > 0 ? "↑ +" : "↓ "}
                  {trends.ordersGrowth}%
                </span>
              )}
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-2">
              <span className="text-2xl font-bold tracking-tight text-paper">
                {(summary.totalOrders || 0).toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-paper-muted">
                {summary.totalOrders === 1 ? "order" : "orders"}
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-paper-muted border-t border-line/60 pt-2">
            <span>Previous: {trends?.previousPeriodOrders ?? 0}</span>
            <span className="font-semibold text-amber-700">★ {(summary.averageStoreRating || 5.0).toFixed(1)} rating</span>
          </div>
        </div>
      </AdminCard>

      {/* 3. ITEMS SOLD */}
      <AdminCard padding="md" className="bg-white/80 border-line shadow-sm">
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-semibold uppercase tracking-wider text-paper-muted cursor-help"
                title="Total physical garments purchased across all orders in this period."
              >
                Items Sold
              </span>
              {trends && trends.unitsGrowth !== 0 && (
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold border ${
                    trends.unitsGrowth > 0
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-rose-100 text-rose-800 border-rose-300"
                  }`}
                >
                  {trends.unitsGrowth > 0 ? "↑ +" : "↓ "}
                  {trends.unitsGrowth}%
                </span>
              )}
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-2">
              <span className="text-2xl font-bold tracking-tight text-paper">
                {(summary.totalUnitsSold || 0).toLocaleString("en-IN")}{" "}
                <span className="text-xs font-normal text-paper-muted">items</span>
              </span>
              <MiniSparkline
                data={trends?.unitsSparkline}
                color="emerald"
                width={76}
                height={28}
              />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-paper-muted border-t border-line/60 pt-2">
            <span>Selling speed:</span>
            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {humanizedPace}
            </span>
          </div>
        </div>
      </AdminCard>

      {/* 4. STOCK VALUE & ATTENTION COUNT */}
      <AdminCard padding="md" className="bg-white/80 border-line shadow-sm">
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-semibold uppercase tracking-wider text-paper-muted cursor-help"
                title="Total value and physical garment units currently stored in your warehouse."
              >
                Stock Value
              </span>
              {outOfStockCount > 0 ? (
                <button
                  type="button"
                  onClick={onFilterLowStock}
                  className="rounded-full bg-rose-100 border border-rose-300 px-2.5 py-0.5 text-[10px] font-bold text-rose-800 hover:bg-rose-200 transition-colors"
                >
                  {outOfStockCount} out of stock
                </button>
              ) : runningLowCount > 0 ? (
                <button
                  type="button"
                  onClick={onFilterLowStock}
                  className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 hover:bg-amber-200 transition-colors"
                >
                  {runningLowCount} running low
                </button>
              ) : (
                <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  Stock healthy
                </span>
              )}
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-2">
              <span className="text-2xl font-bold tracking-tight text-paper">
                ₹{Math.round(summary.totalInventoryValue || 0).toLocaleString("en-IN")}
              </span>
              <span className="text-xs font-medium text-paper-muted">
                {(summary.totalStockUnits || 0).toLocaleString("en-IN")} units
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-paper-muted border-t border-line/60 pt-2">
            <span>
              Running low: <strong className="text-amber-800 font-bold">{runningLowCount}</strong>
            </span>
            <span>
              Out of stock: <strong className="text-rose-800 font-bold">{outOfStockCount}</strong>
            </span>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
