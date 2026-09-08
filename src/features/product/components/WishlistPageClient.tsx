"use client";

import { useMemo } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import { useProducts } from "@/services/product";
import { useAppSelector } from "../hooks/redux";
import ProductCard from "./ProductCard";
import ProductGridSkeleton from "@/components/skeleton/ProductGridSkeleton";
import { EmptyState, ErrorState, OfflineState } from "@/components/states";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function WishlistPageClient() {
  const savedIds = useAppSelector((s) => s.wishlist.ids);
  const productsQuery = useProducts();
  const { data: latestProducts = [], isError, refetch } = productsQuery;
  const isLoading = productsQuery.isLoading || (productsQuery.isFetching && latestProducts.length === 0);
  const isOnline = useOnlineStatus();

  const savedProducts = useMemo(
    () => latestProducts.filter((p) => savedIds.includes(p.id)),
    [latestProducts, savedIds],
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

      {!isOnline && latestProducts.length === 0 ? (
        <OfflineState onRetry={() => void refetch()} />
      ) : isLoading ? (
        <ProductGridSkeleton count={savedIds.length || 4} />
      ) : isError ? (
        <ErrorState message="We couldn’t load your saved products." onRetry={() => void refetch()} />
      ) : savedProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
          {savedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState title="Nothing saved yet" description="Your wishlist is empty. Browse the shop and tap the heart icon on pieces you want to come back to." action={<Link href="/shop"><Button variant="primary" size="md">Explore the shop</Button></Link>} />
      )}
    </div>
  );
}
