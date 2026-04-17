"use client";

import Link from "next/link";
import { useAppSelector } from "@/features/product/hooks/redux";
import { calculateTotals, resolveCartItems } from "../utils";
import CartLineItem from "./CartLineItem";
import CartSummary from "./CartSummary";
import EmptyCart from "./EmptyCart";

export default function CartPageClient() {
  const items = useAppSelector((s) => s.cart.items);
  const resolved = resolveCartItems(items);
  const itemCount = resolved.reduce((sum, r) => sum + r.item.quantity, 0);
  const { subtotal, delivery, total } = calculateTotals(resolved);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <header className="mb-10 flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Your bag
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
          Shopping cart
        </h1>
        <p className="text-sm text-neutral-600">
          Review your items before proceeding to checkout.
        </p>
      </header>

      {resolved.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] lg:gap-12">
          <section aria-label="Cart items" className="min-w-0">
            <ul className="flex flex-col border-t border-neutral-200">
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
                className="text-sm font-medium text-neutral-700 underline-offset-4 transition-colors hover:text-neutral-900 hover:underline"
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
    </div>
  );
}
