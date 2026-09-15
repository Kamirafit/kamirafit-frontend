"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/features/product/hooks/redux";
import { useProducts } from "@/services/product";
import { resolveCartItems, FREE_SHIPPING_THRESHOLD, formatPrice } from "@/features/cart/utils";

export default function FreeShippingProgressBar() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const items = useAppSelector((s) => s.cart.items);
  const { data: products = [] } = useProducts();

  const [isOpen, setIsOpen] = useState(true);
  const prevCountRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolved = useMemo(() => resolveCartItems(items, products), [items, products]);
  const totalQuantity = useMemo(() => items.reduce((sum, it) => sum + it.quantity, 0), [items]);
  const subtotal = useMemo(() => resolved.reduce((sum, r) => sum + r.lineTotal, 0), [resolved]);

  // When a user adds an item to their cart, auto-reopen the bar to show progress feedback
  useEffect(() => {
    if (totalQuantity > prevCountRef.current && totalQuantity > 0) {
      setIsOpen(true);
    }
    prevCountRef.current = totalQuantity;
  }, [totalQuantity]);

  // Don't display during SSR, on checkout page to avoid form interference, or when cart is empty
  if (!mounted || !pathname || pathname.startsWith("/checkout") || totalQuantity === 0) {
    return null;
  }

  const isFreeDelivery = subtotal >= FREE_SHIPPING_THRESHOLD;
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  // Closed / Minimized state: floating reopen badge
  if (!isOpen) {
    return (
      <div className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-8 animate-fadeIn">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Reopen Free Delivery Progress"
          className="group flex items-center gap-2 rounded-full border border-gold/40 bg-ink-2/95 px-3.5 py-2 text-xs font-semibold text-paper shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300 hover:border-gold hover:bg-ink-3 hover:shadow-[0_10px_30px_rgba(201,162,77,0.25)] cursor-pointer"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/15 text-gold group-hover:scale-110 transition-transform">
            🚚
          </span>
          <span className="hidden sm:inline">
            {isFreeDelivery ? (
              <span className="text-emerald-400">Free Delivery Unlocked!</span>
            ) : (
              <span>
                Free Delivery: <strong className="text-gold">{formatPrice(amountNeeded)} left</strong>
              </span>
            )}
          </span>
          <span className="inline-flex items-center rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-gold">
            {progressPercent}%
          </span>
        </button>
      </div>
    );
  }

  // Open state: floating rounded bar
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,520px)] md:bottom-6 animate-fadeIn">
      <div className="relative overflow-hidden rounded-2xl border border-gold/40 bg-ink-2/95 p-3.5 sm:p-4 text-paper shadow-[0_16px_40px_-10px_rgba(0,0,0,0.7)] backdrop-blur-2xl transition-all">
        {/* Top gold ambient accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
        />

        {/* Content Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base transition-transform ${
                isFreeDelivery ? "bg-emerald-500/15 text-emerald-400" : "bg-gold/15 text-gold"
              }`}
            >
              {isFreeDelivery ? "🎉" : "🚚"}
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-[13px] font-medium text-paper leading-snug truncate">
                {isFreeDelivery ? (
                  <span>
                    You’ve unlocked <strong className="text-emerald-400 font-semibold">FREE Delivery</strong>!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-gold font-semibold">{formatPrice(amountNeeded)}</strong> more for{" "}
                    <strong className="text-paper font-semibold">FREE Delivery</strong>
                  </span>
                )}
              </p>
              <p className="text-[10px] text-paper-muted">
                {isFreeDelivery ? "Standard delivery is complimentary on this order" : `Orders above ${formatPrice(FREE_SHIPPING_THRESHOLD)} qualify for free shipping`}
              </p>
            </div>
          </div>

          {/* Actions: View Cart & Close */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/cart"
              className="rounded-full border border-gold/70 bg-gold/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold hover:bg-gold hover:text-white transition-all shadow-sm"
            >
              Bag
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close delivery progress bar"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs text-paper-muted hover:border-white/25 hover:bg-white/10 hover:text-paper transition-all cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Progress Track */}
        <div className="mt-3">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-ink-4 border border-white/5">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isFreeDelivery
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]"
                  : "bg-gradient-to-r from-gold/70 to-gold shadow-[0_0_12px_rgba(201,162,77,0.3)]"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
