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

export default function CartPageClient() {
  const { data: products = [] } = useProducts();
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

      {resolved.length === 0 ? (
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
