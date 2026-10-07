"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { useAppSelector } from "@/features/product/hooks/redux";
import { calculateTotals, resolveCartItems } from "../utils";
import CartLineItem from "./CartLineItem";
import CartSummary from "./CartSummary";
import EmptyCart from "./EmptyCart";
import FreeShippingBanner from "./FreeShippingBanner";
import CartRecommendations from "./CartRecommendations";
import { useProducts } from "@/services/product";
import { orderService, type CouponValidationResult } from "@/services/order";
import { ErrorState, OfflineState } from "@/components/states";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function CartPageClient() {
  const { data: products = [], isLoading, isError, refetch } = useProducts();
  const isOnline = useOnlineStatus();
  const items = useAppSelector((s) => s.cart.items);
  const resolved = resolveCartItems(items, products);
  const itemCount = resolved.reduce((sum, r) => sum + r.item.quantity, 0);
  const { subtotal, delivery } = calculateTotals(resolved);

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Load any previously applied coupon from session storage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("kamirafit_applied_coupon");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.code === "string") {
          setAppliedCoupon(parsed);
        }
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  const handleApplyCoupon = async (code: string) => {
    setCouponError(null);
    setIsApplyingCoupon(true);
    try {
      const res = await orderService.validateCoupon({
        code,
        subtotal,
        items: items.map((it) => ({
          variantId: it.id,
          quantity: it.quantity,
          size: it.size,
          color: it.color,
        })),
      });
      setAppliedCoupon(res);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("kamirafit_applied_coupon", JSON.stringify(res));
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const msg =
        errorObj?.response?.data?.message ||
        errorObj?.message ||
        "Invalid or expired promotional code";
      setCouponError(msg);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("kamirafit_applied_coupon");
    }
  };

  // Authoritative grand total incorporating applied coupon
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + delivery);

  // Derived real savings from authoritative MRP + applied promo code
  const totalSavings = useMemo(() => {
    const itemSavings = resolved.reduce((sum, r) => {
      const matchedVariant =
        r.product.variants?.find(
          (v) =>
            (!r.item.size || v.size === r.item.size) &&
            (!r.item.color || v.color === r.item.color)
        ) || r.product.variants?.[0];
      const effectiveMrp = matchedVariant?.mrp || r.product.mrp || 0;
      const unitPrice = r.product.price;
      return sum + (effectiveMrp > unitPrice ? (effectiveMrp - unitPrice) * r.item.quantity : 0);
    }, 0);
    return itemSavings + discountAmount;
  }, [resolved, discountAmount]);

  return (
    <Container className="py-10 sm:py-14 lg:py-16">
      {/* Editorial Page Header matching Stitch */}
      <div className="mb-8 pb-5 border-b border-outline-variant/30 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-sans text-[11px] uppercase tracking-widest text-surface-tint font-semibold block">
            Your Bag
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-primary font-medium tracking-tight mt-1">
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-sans mt-1">
            Review your atelier selections before proceeding to checkout.
          </p>
        </div>

        <div>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-1.5 font-sans text-xs uppercase tracking-wider font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            <svg
              className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>

      {!isOnline && products.length === 0 && items.length > 0 ? (
        <OfflineState onRetry={() => void refetch()} />
      ) : isLoading && products.length === 0 ? (
        /* Loading Skeleton matching Stitch Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-pulse">
          <div className="lg:col-span-8 space-y-4">
            <div className="h-16 w-full rounded-2xl bg-surface-container-low" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-36 w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 flex gap-4"
              >
                <div className="h-full w-24 rounded-lg bg-surface-container" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-4 w-1/3 rounded bg-surface-container-high" />
                  <div className="h-3 w-1/4 rounded bg-surface-container" />
                  <div className="h-4 w-20 rounded bg-surface-container-high mt-4" />
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-4 h-96 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6" />
        </div>
      ) : isError && products.length === 0 && items.length > 0 ? (
        <ErrorState
          message="We couldn’t load the products in your cart."
          onRetry={() => void refetch()}
        />
      ) : resolved.length === 0 ? (
        <EmptyCart />
      ) : (
        /* Main Two-Column Layout (8 cols items, 4 cols sticky summary) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Free Shipping Banner + Items + Recommendations */}
          <section aria-label="Shopping bag items" className="lg:col-span-8 min-w-0">
            {/* Free Delivery Threshold Banner */}
            <FreeShippingBanner subtotal={subtotal} />

            {/* Table Column Headers (Desktop Only) */}
            <div className="hidden md:grid grid-cols-12 gap-4 pb-3 mb-3 text-[11px] font-sans uppercase tracking-widest text-outline border-b border-outline-variant/30 font-semibold">
              <div className="col-span-6">Pieces</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Valuation</div>
            </div>

            {/* Cart Items List */}
            <div className="flex flex-col gap-4">
              {resolved.map((r) => (
                <CartLineItem
                  key={`${r.item.id}-${r.item.size ?? "-"}-${r.item.color ?? "-"}`}
                  resolved={r}
                />
              ))}
            </div>

            {/* Curated Recommendations ("Pairs Seamlessly") */}
            <CartRecommendations
              products={products}
              currentCartIds={items.map((it) => it.id)}
            />
          </section>

          {/* Right Column: Sticky Order Summary */}
          <div className="lg:col-span-4">
            <CartSummary
              subtotal={subtotal}
              delivery={delivery}
              total={grandTotal}
              itemCount={itemCount}
              totalSavings={totalSavings}
              appliedCoupon={appliedCoupon}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              isApplyingCoupon={isApplyingCoupon}
              couponError={couponError}
            />
          </div>
        </div>
      )}
    </Container>
  );
}
