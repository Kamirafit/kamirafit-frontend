"use client";

import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import { useAppSelector } from "@/features/product/hooks/redux";
import { calculateTotals, resolveCartItems } from "../utils";
import CartLineItem from "./CartLineItem";
import { useProducts } from "@/services/product";
import CartSummary from "./CartSummary";
import EmptyCart from "./EmptyCart";
import { ErrorState, LoadingState, OfflineState } from "@/components/states";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function CartPageClient() {
  const { data: products = [], isLoading, isError, refetch } = useProducts();
  const isOnline = useOnlineStatus();
  const items = useAppSelector((s) => s.cart.items);
  const resolved = resolveCartItems(items, products);
  const itemCount = resolved.reduce((sum, r) => sum + r.item.quantity, 0);
  const { subtotal, delivery, total } = calculateTotals(resolved);

  return (
    <Container className="py-14 lg:py-20">
      <SectionHeader
        size="lg"
        eyebrow="Your bag"
        title="Shopping cart"
        description="Review your items before proceeding to checkout."
        className="mb-12"
      />

      {!isOnline && products.length === 0 && items.length > 0 ? (
        <OfflineState onRetry={() => void refetch()} />
      ) : isLoading && products.length === 0 ? (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px] lg:gap-12 animate-pulse">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 border-b border-line pb-4">
                <div className="h-24 w-20 rounded-xl bg-ink-3" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-1/3 rounded bg-ink-4" />
                  <div className="h-3 w-1/4 rounded bg-ink-3" />
                  <div className="h-4 w-16 rounded bg-ink-4 mt-2" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-64 rounded-2xl border border-line bg-ink p-6" />
        </div>
      ) : isError && products.length === 0 && items.length > 0 ? (
        <ErrorState message="We couldn’t load the products in your cart." onRetry={() => void refetch()} />
      ) : resolved.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px] lg:gap-12">
          <section aria-label="Cart items" className="min-w-0">
            <ul className="flex flex-col border-t border-line">
              {resolved.map((r) => (
                <CartLineItem
                  key={`${r.item.id}-${r.item.size ?? "-"}-${r.item.color ?? "-"}`}
                  resolved={r}
                />
              ))}
            </ul>
            <div className="mt-6">
              <Link
                href="/shop"
                className="text-sm font-medium text-paper-muted underline-offset-4 transition-colors hover:text-gold hover:underline"
              >
                ← Continue shopping
              </Link>
            </div>
          </section>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <CartSummary
              subtotal={subtotal}
              delivery={delivery}
              total={total}
              itemCount={itemCount}
            />
          </div>
        </div>
      )}
    </Container>
  );
}
