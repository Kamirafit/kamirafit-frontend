"use client";

import type { AnalyticsSummary } from "@/types/entities/analytics";
import AdminCard from "./AdminCard";

interface Props {
  summary: AnalyticsSummary;
  onFilterLowStock?: () => void;
  onFilterOutOfStock?: () => void;
  onFilterRunningLow?: () => void;
  onFilterDeadStock?: () => void;
  onOpenCalculationRules?: () => void;
}

export default function InventoryOverviewSection({
  summary,
  onFilterLowStock,
  onFilterOutOfStock,
  onFilterRunningLow,
  onFilterDeadStock,
  onOpenCalculationRules,
}: Props) {
  const totalStock = summary.totalStockUnits || 0;
  const stockVal = summary.totalInventoryValue || 0;
  const deadVal = summary.deadStockValue || 0;
  const outOfStock = summary.outOfStockCount ?? 0;
  const runningLow = summary.runningLowCount ?? summary.criticalRestockCount ?? 0;
  const healthyPct = summary.healthyStockPercent ?? 85;
  const healthyCount = summary.healthyStockCount ?? Math.max(0, (summary.totalProductsCount ?? 0) - outOfStock - runningLow);
  const totalProducts = summary.totalProductsCount || (healthyCount + outOfStock + runningLow) || 1;

  const runningLowPct = Math.round((runningLow / Math.max(totalProducts, 1)) * 100);
  const outOfStockPct = Math.max(0, 100 - healthyPct - runningLowPct);

  // Conceptual model: Physical Stock = Available + Reserved, Online <= Available
  const physicalStock = summary.physicalStockUnits ?? totalStock;
  const reservedStock = summary.reservedStockUnits ?? 0;
  const availableStock = summary.availableStockUnits ?? totalStock;
  const onlineStock = summary.onlineStockUnits ?? availableStock;

  const healthHeadline =
    outOfStock === 0 && runningLow === 0
      ? "All of your garments are in great shape."
      : healthyPct >= 80
      ? "Most of your garments have healthy stock, with a few items to reorder."
      : healthyPct >= 60
      ? "A few products are running low or out of stock."
      : "Several popular garments require immediate restocking.";

  const handleRunningLowClick = () => {
    (onFilterRunningLow || onFilterLowStock)?.();
    setTimeout(() => {
      document.getElementById("drilldown-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleOutOfStockClick = () => {
    (onFilterOutOfStock || onFilterLowStock)?.();
    setTimeout(() => {
      document.getElementById("drilldown-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleDeadStockClick = () => {
    onFilterDeadStock?.();
    setTimeout(() => {
      document.getElementById("drilldown-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 1. STOCK OVERVIEW */}
      <AdminCard padding="lg" className="flex flex-col justify-between bg-white/80 border-line shadow-sm">
        <div>
          <div className="flex items-center justify-between border-b border-line/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">📦</span>
                <h3 className="font-display text-base font-bold text-paper">
                  Stock Overview
                </h3>
              </div>
              <p className="mt-0.5 text-xs text-paper-muted">
                Garments held physically in warehouse and ready for online shoppers
              </p>
            </div>
            <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold text-blue-900">
              Live Stock
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {/* Physical Stock */}
            <div className="rounded-xl border border-line bg-ink-2/60 p-3.5">
              <span
                className="text-[11px] font-semibold text-paper-muted cursor-help"
                title="All physical garment units in the warehouse, including units reserved for pending orders."
              >
                Physical Stock
              </span>
              <div className="mt-1 text-xl font-bold text-paper">
                {physicalStock.toLocaleString("en-IN")}{" "}
                <span className="text-xs font-normal text-paper-muted">units</span>
              </div>
              <span className="text-[10px] text-paper-muted">in warehouse</span>
            </div>

            {/* Reserved Stock */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5">
              <span
                className="text-[11px] font-semibold text-amber-900 cursor-help"
                title="Units currently held for customer checkouts awaiting payment confirmation."
              >
                Reserved Stock
              </span>
              <div className="mt-1 text-xl font-bold text-amber-950">
                {reservedStock.toLocaleString("en-IN")}{" "}
                <span className="text-xs font-normal text-amber-800">units</span>
              </div>
              <span className="text-[10px] text-amber-800">in customer cart hold</span>
            </div>

            {/* Available to Sell */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
              <span
                className="text-[11px] font-semibold text-emerald-900 cursor-help"
                title="Physical stock minus reserved stock that is ready to ship."
              >
                Available to Sell
              </span>
              <div className="mt-1 text-xl font-bold text-emerald-950">
                {availableStock.toLocaleString("en-IN")}{" "}
                <span className="text-xs font-normal text-emerald-800">units</span>
              </div>
              <span className="text-[10px] text-emerald-800">ready to ship</span>
            </div>

            {/* Online Stock */}
            <div className="rounded-xl border border-line bg-ink-2/60 p-3.5">
              <span
                className="text-[11px] font-semibold text-paper-muted cursor-help"
                title="Garment units currently published and purchasable by shoppers on the website."
              >
                Online Stock
              </span>
              <div className="mt-1 text-xl font-bold text-paper">
                {onlineStock.toLocaleString("en-IN")}{" "}
                <span className="text-xs font-normal text-paper-muted">units</span>
              </div>
              <span className="text-[10px] text-paper-muted">active online</span>
            </div>

            {/* Stock Value */}
            <div className="rounded-xl border border-line bg-ink-2/60 p-3.5">
              <span
                className="text-[11px] font-semibold text-paper-muted cursor-help"
                title="Total monetary valuation of all garments in stock."
              >
                Stock Value
              </span>
              <div className="mt-1 text-xl font-bold text-gold">
                ₹{Math.round(stockVal).toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] text-paper-muted">total inventory value</span>
            </div>

            {/* Hasn't Moved */}
            <button
              type="button"
              onClick={handleDeadStockClick}
              className="text-left group rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 transition-all hover:bg-rose-100 hover:border-rose-300 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[11px] font-semibold text-rose-900 cursor-help"
                  title="Value of unsold products that have had at least 60 days of selling opportunity."
                >
                  Hasn&apos;t Moved
                </span>
                <span className="text-[10px] font-bold text-rose-800 group-hover:underline">view ↓</span>
              </div>
              <div className="mt-1 text-xl font-bold text-rose-950">
                ₹{Math.round(deadVal).toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] text-rose-800 font-medium">{summary.deadStockCount ?? 0} idle products</span>
            </button>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-paper-muted border-t border-line/60 pt-3">
          💡 Physical stock updates automatically when customer orders are placed, paid, or cancelled.
        </p>
      </AdminCard>

      {/* 2. INVENTORY HEALTH */}
      <AdminCard padding="lg" className="flex flex-col justify-between bg-white/80 border-line shadow-sm">
        <div>
          <div className="flex items-center justify-between border-b border-line/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">🩺</span>
                <h3 className="font-display text-base font-bold text-paper">
                  Inventory Health
                </h3>
              </div>
              <p className="mt-0.5 text-xs text-paper-muted">
                How well your stock is balanced against customer demand
              </p>
            </div>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                healthyPct >= 80
                  ? "border-emerald-300 bg-emerald-100 text-emerald-900"
                  : healthyPct >= 60
                  ? "border-amber-300 bg-amber-100 text-amber-950"
                  : "border-rose-300 bg-rose-100 text-rose-950"
              }`}
            >
              {healthyPct}% Healthy
            </span>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <div className="text-sm font-bold text-paper">
                &ldquo;{healthHeadline}&rdquo;
              </div>
              <p className="mt-0.5 text-xs text-paper-muted leading-relaxed">
                Compares how much stock you have on hand against customer demand to prevent stockouts and unsold garments.
              </p>
            </div>

            {/* Health visual progress bar */}
            <div className="h-3 w-full overflow-hidden rounded-full bg-ink-3 flex border border-line">
              <div
                className="h-full bg-emerald-600 transition-all"
                style={{ width: `${healthyPct}%` }}
                title={`Healthy stock: ${healthyCount} products (${healthyPct}%)`}
              />
              <div
                className="h-full bg-amber-500 transition-all"
                style={{ width: `${runningLowPct}%` }}
                title={`Running low: ${runningLow} products`}
              />
              <div
                className="h-full bg-rose-600 transition-all"
                style={{ width: `${outOfStockPct}%` }}
                title={`Out of stock: ${outOfStock} products`}
              />
            </div>

            {/* Breakdown checklist */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-emerald-50/70 border border-emerald-200/60 px-3 py-2">
                <span className="flex items-center gap-2 text-emerald-950 font-medium">
                  <span className="text-emerald-800 font-bold">✓</span>
                  <span>Healthy stock</span>
                </span>
                <span className="font-bold text-emerald-900">
                  {healthyCount > 0 ? `${healthyCount} products (${healthyPct}%)` : `${healthyPct}% of products`}
                </span>
              </div>

              <button
                type="button"
                onClick={handleRunningLowClick}
                className="w-full text-left flex items-center justify-between rounded-lg bg-amber-50/70 border border-amber-200/60 px-3 py-2 cursor-pointer hover:bg-amber-100 transition-colors"
              >
                <span className="flex items-center gap-2 text-amber-950 font-medium">
                  <span className="text-amber-800 font-bold">⚠</span>
                  <span>Running low</span>
                </span>
                <span className="font-bold text-amber-900 inline-flex items-center gap-1">
                  {runningLow} {runningLow === 1 ? "product" : "products"} ↓
                </span>
              </button>

              <button
                type="button"
                onClick={handleOutOfStockClick}
                className="w-full text-left flex items-center justify-between rounded-lg bg-rose-50/70 border border-rose-200/60 px-3 py-2 cursor-pointer hover:bg-rose-100 transition-colors"
              >
                <span className="flex items-center gap-2 text-rose-950 font-medium">
                  <span className="text-rose-800 font-bold">✕</span>
                  <span>Out of stock</span>
                </span>
                <span className="font-bold text-rose-900 inline-flex items-center gap-1">
                  {outOfStock} {outOfStock === 1 ? "product" : "products"} ↓
                </span>
              </button>

              <button
                type="button"
                onClick={handleDeadStockClick}
                className="w-full text-left flex items-center justify-between rounded-lg bg-ink-2/80 border border-line px-3 py-2 cursor-pointer hover:bg-ink-3 transition-colors"
              >
                <span className="flex items-center gap-2 text-paper font-medium">
                  <span className="text-paper-muted font-bold">❄</span>
                  <span>Stock that hasn&apos;t moved</span>
                </span>
                <span className="font-bold text-gold inline-flex items-center gap-1">
                  ₹{Math.round(deadVal).toLocaleString("en-IN")} tied up ↓
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-line/60 pt-3 gap-2">
          <p className="text-[11px] text-paper-muted">
            💡 Healthy inventory means you have enough clothes in stock to satisfy customer orders without running out, while avoiding excess clothes that sit unsold for months.
          </p>
          {onOpenCalculationRules && (
            <button
              type="button"
              onClick={onOpenCalculationRules}
              className="text-[11px] font-semibold text-gold hover:underline whitespace-nowrap inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>How is this calculated?</span>
              <span>ℹ️</span>
            </button>
          )}
        </div>
      </AdminCard>
    </div>
  );
}
