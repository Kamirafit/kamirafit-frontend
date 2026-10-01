"use client";

import Image from "next/image";
import Link from "next/link";
import Modal from "./Modal";
import type { ProductPerformance } from "@/types/entities/analytics";

interface Props {
  product: ProductPerformance | null;
  onClose: () => void;
  daysCount?: number;
}

export function formatSellingSpeed(
  unitsSold: number,
  velocity: number,
  daysCount: number = 30
): { speed: string; sub: string } {
  if (unitsSold <= 0) {
    return { speed: "No sales yet", sub: "0 sold in this period" };
  }

  if (velocity >= 2) {
    return { speed: `${Math.round(velocity)} / day`, sub: "Selling fast" };
  }

  if (velocity >= 1) {
    return { speed: `${velocity.toFixed(1)} / day`, sub: "Steady pace" };
  }

  const days = Math.max(daysCount, 1);
  const daysPerUnit = Math.round(days / unitsSold);

  if (daysPerUnit <= 7) {
    const perWeek = Math.max(1, Math.round((unitsSold / days) * 7));
    return { speed: `~${perWeek} / week`, sub: `${unitsSold} sold in ${days} days` };
  }

  if (daysPerUnit <= 14) {
    return { speed: `~1 every 2 weeks`, sub: `${unitsSold} sold in ${days} days` };
  }

  if (days <= 30 && unitsSold <= 2) {
    return {
      speed: `${unitsSold} ${unitsSold === 1 ? "sale" : "sales"} this month`,
      sub: `~1 every ${daysPerUnit} days`,
    };
  }

  return { speed: `~1 every ${daysPerUnit} days`, sub: `${unitsSold} sold in ${days} days` };
}

export default function ProductAnalyticsDetailModal({
  product,
  onClose,
  daysCount = 30,
}: Props) {
  if (!product) return null;

  const speedInfo = formatSellingSpeed(product.unitsSold, product.velocity, daysCount);
  const isOutOfStock = product.currentStock === 0;
  const isRunningLow =
    !isOutOfStock &&
    (product.currentStock <= 10 || (product.daysOfInventory !== null && product.daysOfInventory <= 14));

  return (
    <Modal open={Boolean(product)} onClose={onClose} title="Product Performance" maxWidth="lg">
      <div className="space-y-6">
        {/* Header Preview */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-line pb-5">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-line bg-ink-2 shadow-sm">
            <Image
              src={product.image || "/images/placeholder.jpg"}
              alt={product.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-ink-3 px-2.5 py-0.5 text-xs font-semibold text-paper">
                {product.category}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                  isOutOfStock
                    ? "bg-rose-100 text-rose-800 border-rose-300"
                    : isRunningLow
                    ? "bg-amber-100 text-amber-900 border-amber-300"
                    : "bg-emerald-100 text-emerald-800 border-emerald-300"
                }`}
              >
                {isOutOfStock ? "Out of Stock" : isRunningLow ? "Running Low" : "In Stock"}
              </span>
            </div>

            <h3 className="text-lg font-bold text-paper line-clamp-2">
              {product.name}
            </h3>

            <div className="text-sm font-semibold text-gold">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {/* 6 Grid Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Total Sales */}
          <div className="rounded-xl border border-line bg-white/70 p-3.5 space-y-1 shadow-sm">
            <span className="text-xs font-medium text-paper-muted">Total Sales</span>
            <div className="text-xl font-bold text-gold">
              ₹{Math.round(product.revenue || 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-paper-muted">
              {product.unitsSold} units sold ({product.ordersCount}{" "}
              {product.ordersCount === 1 ? "order" : "orders"})
            </div>
          </div>

          {/* Selling Speed */}
          <div className="rounded-xl border border-line bg-white/70 p-3.5 space-y-1 shadow-sm">
            <span className="text-xs font-medium text-paper-muted">Selling Speed</span>
            <div className="text-xl font-bold text-emerald-800">
              {speedInfo.speed}
            </div>
            <div className="text-[11px] text-paper-muted">{speedInfo.sub}</div>
          </div>

          {/* Current Stock */}
          <div className="rounded-xl border border-line bg-white/70 p-3.5 space-y-1 shadow-sm">
            <span className="text-xs font-medium text-paper-muted">Stock Remaining</span>
            <div
              className={`text-xl font-bold ${
                isOutOfStock
                  ? "text-rose-700"
                  : isRunningLow
                  ? "text-amber-800"
                  : "text-paper"
              }`}
            >
              {product.currentStock} units
            </div>
            <div className="text-[11px] text-paper-muted">
              ₹{Math.round(product.inventoryValue || 0).toLocaleString("en-IN")} value
            </div>
          </div>

          {/* Forecast Runway */}
          <div className="rounded-xl border border-line bg-white/70 p-3.5 space-y-1 shadow-sm">
            <span className="text-xs font-medium text-paper-muted">Estimated Runway</span>
            <div className="text-xl font-bold text-paper">
              {isOutOfStock
                ? "Depleted"
                : product.daysOfInventory !== null
                ? `≈ ${product.daysOfInventory} days`
                : "Sufficient"}
            </div>
            <div className="text-[11px] text-paper-muted">Until stock runs out</div>
          </div>

          {/* Customer Reviews */}
          <div className="rounded-xl border border-line bg-white/70 p-3.5 space-y-1 shadow-sm">
            <span className="text-xs font-medium text-paper-muted">Customer Rating</span>
            <div className="text-xl font-bold text-amber-700">
              ★ {product.averageRating > 0 ? product.averageRating.toFixed(1) : "—"}
            </div>
            <div className="text-[11px] text-paper-muted">
              {product.reviewCount} customer {product.reviewCount === 1 ? "review" : "reviews"}
            </div>
          </div>

          {/* Performance Score */}
          <div className="rounded-xl border border-line bg-white/70 p-3.5 space-y-1 shadow-sm">
            <span className="text-xs font-medium text-paper-muted">Rank in Store</span>
            <div className="text-xl font-bold text-paper">
              #{product.rank}
            </div>
            <div className="text-[11px] text-paper-muted">
              Score: {product.performanceScore}/100
            </div>
          </div>
        </div>

        {/* Friendly Suggestion */}
        <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 space-y-1">
          <span className="text-xs font-semibold text-gold uppercase tracking-wider flex items-center gap-1.5">
            <span>💡</span> Suggestion for this product
          </span>
          <p className="text-xs text-paper leading-relaxed">
            {product.actionRecommendation ||
              "Monitor customer demand and keep stock buffered to maintain steady sales."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line bg-white px-4 py-2 text-xs font-medium text-paper hover:bg-ink-2 transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <Link
              href={`/dedicated-admin/products?search=${encodeURIComponent(product.name)}`}
              className="rounded-lg border border-gold bg-gold px-4 py-2 text-xs font-semibold text-white hover:bg-gold-bright transition-colors inline-flex items-center gap-1.5 shadow-sm"
            >
              <span>✏️</span> Manage Stock in Products
            </Link>

            <Link
              href={`/product/${product.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-line bg-ink-2 px-3.5 py-2 text-xs font-medium text-paper hover:border-gold hover:text-gold transition-colors inline-flex items-center gap-1.5"
            >
              <span>👁️</span> View on Storefront ↗
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
