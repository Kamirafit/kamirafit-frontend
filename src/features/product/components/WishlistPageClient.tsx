"use client";

import Link from "next/link";
import { useMemo } from "react";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import { PRODUCTS } from "@/features/product/data/products";
import { useAppSelector } from "../hooks/redux";
import ProductCard from "./ProductCard";

export default function WishlistPageClient() {
  const savedIds = useAppSelector((s) => s.wishlist.ids);

  const savedProducts = useMemo(
    () => PRODUCTS.filter((p) => savedIds.includes(p.id)),
    [savedIds],
  );

  return (
    <div className="flex flex-col gap-10">
      <SectionHeader
        eyebrow="Your picks"
        title="Wishlist"
        description={
          savedProducts.length
            ? `${savedProducts.length} ${
                savedProducts.length === 1 ? "piece" : "pieces"
              } saved for later. Move them to the bag whenever you're ready.`
            : "Tap the heart on any product to keep it here for later."
        }
      />

      {savedProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
          {savedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <p className="font-display text-2xl text-paper">
            Nothing saved yet
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-paper-muted">
            Your wishlist is empty. Browse the shop and tap the heart icon on
            pieces you want to come back to.
          </p>
          <div className="mt-6 flex justify-center">
            <Link href="/shop">
              <Button variant="primary" size="md">
                Explore the shop
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
