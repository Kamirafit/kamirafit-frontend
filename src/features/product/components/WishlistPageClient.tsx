"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useProducts } from "@/services/product";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { addToCart } from "../store/cartSlice";
import { useOptimisticWishlist } from "@/services/wishlist";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import type { Product, Size, Color } from "../types";
import WishlistProductCard from "./WishlistProductCard";
import WishlistRecommendationCard from "./WishlistRecommendationCard";
import WishlistVariantModal from "./WishlistVariantModal";
import WishlistGridSkeleton from "./WishlistGridSkeleton";
import WishlistToast, { type ToastMessage } from "./WishlistToast";
import { HeartIcon, ShoppingBagIcon } from "./icons";
import { OfflineState } from "@/components/states";

type FilterTab = "all" | "stock" | "sale";

export default function WishlistPageClient() {
  const dispatch = useAppDispatch();
  const isOnline = useOnlineStatus();
  const { wishlistIds, isSaved, toggle } = useOptimisticWishlist();
  const cartItems = useAppSelector((s) => s.cart.items);

  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [variantModalProduct, setVariantModalProduct] = useState<Product | null>(null);

  const productsQuery = useProducts();
  const { data: latestProducts = [], isError, refetch } = productsQuery;
  const isLoading = productsQuery.isLoading || productsQuery.isFetching;

  // Real KamiraFit saved products (excluding archived or deleted items)
  const savedProducts = useMemo(() => {
    return latestProducts.filter(
      (p) => wishlistIds.includes(p.id) && p.status !== "inactive"
    );
  }, [latestProducts, wishlistIds]);

  // Dynamic stock calculations
  const isProductInStock = useCallback((p: Product) => {
    if (!p.variants || p.variants.length === 0) return Boolean(p.isAvailable);
    return p.variants.reduce((sum, v) => sum + (v.stock || 0), 0) > 0 && Boolean(p.isAvailable);
  }, []);

  const isProductOnSale = useCallback((p: Product) => {
    const mrp = typeof p.mrp === "number" ? p.mrp : typeof p.baseMrp === "number" ? p.baseMrp : 0;
    const price = typeof p.price === "number" ? p.price : 0;
    return mrp > 0 && price > 0 && mrp > price;
  }, []);

  // Filter counts
  const inStockCount = useMemo(
    () => savedProducts.filter(isProductInStock).length,
    [savedProducts, isProductInStock]
  );

  const onSaleCount = useMemo(
    () => savedProducts.filter(isProductOnSale).length,
    [savedProducts, isProductOnSale]
  );

  // Filtered list
  const filteredProducts = useMemo(() => {
    if (activeTab === "stock") {
      return savedProducts.filter(isProductInStock);
    }
    if (activeTab === "sale") {
      return savedProducts.filter(isProductOnSale);
    }
    return savedProducts;
  }, [savedProducts, activeTab, isProductInStock, isProductOnSale]);

  // Complementary recommendations from real catalog (pieces not currently in wishlist)
  const recommendations = useMemo(() => {
    const unsaved = latestProducts.filter(
      (p) => !wishlistIds.includes(p.id) && p.status !== "inactive" && Boolean(p.isAvailable)
    );
    return unsaved.slice(0, 3);
  }, [latestProducts, wishlistIds]);

  const showToast = useCallback((text: string, icon: ToastMessage["icon"] = "check") => {
    setToast({
      id: String(Date.now()),
      text,
      icon,
    });
  }, []);

  // Wishlist item removal with smooth animation and feedback
  const handleRemoveItem = useCallback((product: Product) => {
    toggle(product.id);
    showToast(`${product.name} removed from your curated list`, "remove");
  }, [toggle, showToast]);

  // Quick save for recommendation cards
  const handleQuickSave = useCallback((product: Product) => {
    const alreadySaved = isSaved(product.id);
    toggle(product.id);
    showToast(
      alreadySaved
        ? `${product.name} removed from your curated edit`
        : `${product.name} added to your curated edit`,
      "heart"
    );
  }, [isSaved, toggle, showToast]);

  // Move single product to bag (verifying variants)
  const handleMoveToBag = useCallback((product: Product) => {
    if (!isProductInStock(product)) {
      showToast(`${product.name} is currently out of stock`, "remove");
      return;
    }

    const availableColors = Array.isArray(product.color) && product.color.length > 0
      ? product.color
      : (product.variants || []).map((v) => v.color).filter((c): c is string => Boolean(c && c.trim()));

    const availableSizes = Array.isArray(product.size) && product.size.length > 0
      ? product.size
      : (product.variants || []).map((v) => v.size).filter((s): s is string => Boolean(s && s.trim()));

    const hasMultipleVariants = availableColors.length > 1 || availableSizes.length > 1;

    if (hasMultipleVariants) {
      setVariantModalProduct(product);
      return;
    }

    const variant = product.variants?.[0];
    const size = (variant?.size || availableSizes[0] || "M") as Size;
    const color = (variant?.color || availableColors[0] || "Default") as Color;

    dispatch(
      addToCart({
        id: product.id,
        variantId: variant?.id,
        size,
        color,
        quantity: 1,
      })
    );
    showToast(`${product.name} moved to your shopping bag`, "bag");
  }, [isProductInStock, dispatch, showToast]);

  // Variant modal confirmation
  const handleConfirmVariant = useCallback((product: Product, size: Size, color: Color) => {
    const matchingVariant =
      product.variants?.find(
        (v) =>
          (!color || v.color?.toLowerCase() === color.toLowerCase()) &&
          (!size || v.size?.toLowerCase() === size.toLowerCase())
      ) || product.variants?.[0];

    dispatch(
      addToCart({
        id: product.id,
        variantId: matchingVariant?.id,
        size,
        color,
        quantity: 1,
      })
    );
    setVariantModalProduct(null);
    showToast(`${product.name} (${size}) moved to your shopping bag`, "bag");
  }, [dispatch, showToast]);

  // Bulk Move All To Bag
  const handleMoveAllToBag = useCallback(() => {
    const inStockItems = savedProducts.filter(isProductInStock);

    if (inStockItems.length === 0) {
      showToast("No in-stock pieces currently available to move to bag.", "remove");
      return;
    }

    let addedCount = 0;
    let variantPromptCount = 0;

    inStockItems.forEach((product) => {
      const availableColors = Array.isArray(product.color) && product.color.length > 0
        ? product.color
        : (product.variants || []).map((v) => v.color).filter((c): c is string => Boolean(c && c.trim()));

      const availableSizes = Array.isArray(product.size) && product.size.length > 0
        ? product.size
        : (product.variants || []).map((v) => v.size).filter((s): s is string => Boolean(s && s.trim()));

      const hasMultipleVariants = availableColors.length > 1 || availableSizes.length > 1;

      if (hasMultipleVariants) {
        variantPromptCount++;
        // Use default primary variant safely
        const variant = product.variants?.[0];
        const size = (variant?.size || availableSizes[0] || "M") as Size;
        const color = (variant?.color || availableColors[0] || "Default") as Color;
        dispatch(
          addToCart({
            id: product.id,
            variantId: variant?.id,
            size,
            color,
            quantity: 1,
          })
        );
        addedCount++;
      } else {
        const variant = product.variants?.[0];
        const size = (variant?.size || availableSizes[0] || "M") as Size;
        const color = (variant?.color || availableColors[0] || "Default") as Color;
        dispatch(
          addToCart({
            id: product.id,
            variantId: variant?.id,
            size,
            color,
            quantity: 1,
          })
        );
        addedCount++;
      }
    });

    if (variantPromptCount > 0) {
      showToast(
        `${addedCount} in-stock ${addedCount === 1 ? "piece" : "pieces"} transferred to your bag with standard sizes.`,
        "bag"
      );
    } else {
      showToast(
        `All ${addedCount} in-stock ${addedCount === 1 ? "piece" : "pieces"} transferred to your shopping bag.`,
        "bag"
      );
    }
  }, [savedProducts, isProductInStock, dispatch, showToast]);

  // Share Wishlist
  const handleShareWishlist = useCallback(() => {
    if (typeof window === "undefined") return;
    if (navigator.share) {
      navigator.share({
        title: "My KamiraFit Curated Edit",
        text: "Private fashion archive from KamiraFit Atelier.",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("Private curation link copied to clipboard", "share");
    }
  }, [showToast]);

  const formattedSavedCount = savedProducts.length < 10 ? `0${savedProducts.length}` : `${savedProducts.length}`;

  return (
    <div className="w-full bg-surface text-on-surface antialiased overflow-hidden">
      {/* Subtle ambient decorative glow backdrop */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-40 right-10 w-96 h-96 rounded-full bg-secondary-container/30 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-surface-container-high/60 blur-2xl pointer-events-none" />

        {/* Editorial Header Section */}
        <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 sm:pb-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 sm:pb-10">
            <div className="flex flex-col gap-2.5 sm:gap-3">
              <span className="font-sans text-xs uppercase text-surface-tint tracking-[0.2em] font-semibold">
                Your Private Edit
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-primary font-medium tracking-tight">
                Curated Wishlist
              </h1>
              <p className="font-sans text-sm sm:text-base text-secondary font-light max-w-xl leading-relaxed">
                Your saved pieces, gathered in one place. Move them to your shopping bag whenever you&apos;re ready.
              </p>
            </div>

            {/* Metric Counter & Status Plate */}
            <div className="flex items-center gap-6 self-start lg:self-end bg-surface-container-lowest/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-outline-variant/30 shadow-sm">
              <div>
                <span className="block text-2xl sm:text-3xl font-serif font-bold text-primary">
                  {formattedSavedCount}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-secondary font-medium">
                  {savedProducts.length === 1 ? "Piece Saved" : "Pieces Saved"}
                </span>
              </div>
              <div className="w-px h-10 bg-outline-variant/40" />
              <div>
                <span className="block text-xs uppercase tracking-wider text-surface-tint font-bold">
                  Curated Edit
                </span>
                <span className="text-[11px] text-on-surface-variant font-light">
                  KamiraFit Atelier
                </span>
              </div>
            </div>
          </div>

          {/* Action Bar & Filter Switchers */}
          {savedProducts.length > 0 && (
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 py-3 sm:py-4 px-4 sm:px-5 rounded-2xl md:rounded-full bg-surface-container shadow-sm">
              {/* Interactive Filter Chips */}
              <div
                role="tablist"
                aria-label="Wishlist filters"
                className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none"
              >
                <button
                  type="button"
                  role="tab"
                  id="filter-all"
                  aria-selected={activeTab === "all"}
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 rounded-full font-sans text-xs uppercase tracking-wider font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === "all"
                      ? "bg-primary-container text-white shadow-sm"
                      : "bg-surface-container-lowest text-on-surface-variant hover:text-primary"
                  }`}
                >
                  All Saved ({savedProducts.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  id="filter-stock"
                  aria-selected={activeTab === "stock"}
                  onClick={() => setActiveTab("stock")}
                  className={`px-4 py-2 rounded-full font-sans text-xs uppercase tracking-wider font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === "stock"
                      ? "bg-primary-container text-white shadow-sm"
                      : "bg-surface-container-lowest text-on-surface-variant hover:text-primary"
                  }`}
                >
                  In Stock ({inStockCount})
                </button>
                <button
                  type="button"
                  role="tab"
                  id="filter-sale"
                  aria-selected={activeTab === "sale"}
                  onClick={() => setActiveTab("sale")}
                  className={`px-4 py-2 rounded-full font-sans text-xs uppercase tracking-wider font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === "sale"
                      ? "bg-primary-container text-white shadow-sm"
                      : "bg-surface-container-lowest text-on-surface-variant hover:text-primary"
                  }`}
                >
                  On Sale ({onSaleCount})
                </button>
              </div>

              {/* Global Batch Actions */}
              <div className="flex items-center gap-3 self-end md:self-auto ml-auto">
                <button
                  type="button"
                  onClick={handleShareWishlist}
                  aria-label="Share wishlist"
                  title="Share curation"
                  className="px-4 py-2.5 rounded-full bg-surface-container-lowest text-primary hover:bg-surface-container-high font-sans text-xs uppercase tracking-wider font-medium transition-all flex items-center gap-1.5 shadow-xs cursor-pointer border border-outline-variant/30"
                >
                  <span className="material-symbols-outlined text-[16px] not-italic">share</span>
                  <span className="hidden sm:inline">Share</span>
                </button>

                <button
                  type="button"
                  onClick={handleMoveAllToBag}
                  disabled={inStockCount === 0}
                  className="px-5 sm:px-6 py-2.5 rounded-full bg-primary-container text-white hover:bg-primary font-sans text-xs uppercase tracking-[0.06em] font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ShoppingBagIcon width={16} height={16} />
                  <span>Move All to Bag</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Main Editorial Wishlist Grid / States */}
        <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-24">
          {!isOnline && latestProducts.length === 0 ? (
            <OfflineState onRetry={() => void refetch()} />
          ) : isLoading ? (
            <WishlistGridSkeleton count={wishlistIds.length || 4} />
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
              <span className="w-14 h-14 rounded-full bg-error-container text-error flex items-center justify-center text-2xl mb-4">
                !
              </span>
              <h2 className="font-serif text-2xl text-primary mb-2 font-medium">
                We Couldn&apos;t Load Your Curated Edit
              </h2>
              <p className="font-sans text-sm text-on-surface-variant max-w-md mb-6 leading-relaxed font-light">
                Something went wrong while retrieving your saved pieces. Please check your connection and try again.
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="px-6 py-2.5 rounded-full bg-primary-container text-white hover:bg-primary font-sans text-xs uppercase tracking-wider font-medium transition-all shadow-sm cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : savedProducts.length > 0 ? (
            filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const inCart = cartItems.some((it) => it.id === product.id);
                  return (
                    <WishlistProductCard
                      key={product.id}
                      product={product}
                      inCart={inCart}
                      onRemove={handleRemoveItem}
                      onMoveToBag={handleMoveToBag}
                    />
                  );
                })}
              </div>
            ) : (
              /* State when active filter yields 0 items */
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
                <span className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary mb-3">
                  <HeartIcon width={20} height={20} />
                </span>
                <h3 className="font-serif text-xl text-primary mb-1">
                  No Pieces Match This Filter
                </h3>
                <p className="font-sans text-xs text-on-surface-variant max-w-sm mb-5 font-light">
                  {activeTab === "stock"
                    ? "None of your saved pieces are currently marked as in stock."
                    : "None of your saved pieces currently have active promotional pricing."}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className="px-6 py-2 rounded-full bg-surface-container-high hover:bg-primary-container hover:text-white text-primary font-sans text-xs uppercase tracking-wider transition-all font-medium cursor-pointer"
                >
                  View All Saved ({savedProducts.length})
                </button>
              </div>
            )
          ) : (
            /* Dedicated Editorial Empty State matching Stitch */
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-surface-container-lowest/60 rounded-3xl border border-outline-variant/20 my-4">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-primary-container mb-4 shadow-xs">
                <HeartIcon width={28} height={28} />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-primary mb-2 font-medium">
                Your Private Edit is Empty
              </h2>
              <p className="font-sans text-sm text-on-surface-variant max-w-sm mb-6 leading-relaxed font-light">
                Explore the current season collection to archive and preserve your preferred silhouettes.
              </p>
              <Link
                href="/shop"
                className="px-8 py-3.5 rounded-full bg-primary-container text-white font-sans text-xs uppercase tracking-wider hover:bg-primary transition-all shadow-sm hover:shadow-md font-medium"
              >
                Explore Current Collection
              </Link>
            </div>
          )}
        </section>

        {/* Recommendation Section: You May Also Cherish (Stitch Editorial Capsule) */}
        {recommendations.length > 0 && (
          <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24 border-t border-outline-variant/30">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
              <div>
                <span className="font-sans text-xs uppercase text-surface-tint tracking-[0.2em] block mb-1.5 font-semibold">
                  Complements To Your Edit
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-primary font-medium">
                  You May Also Cherish
                </h2>
              </div>
              <Link
                href="/shop"
                className="group flex items-center gap-2 font-sans text-xs text-primary uppercase tracking-wider hover:text-surface-tint transition-colors font-semibold"
              >
                <span>View Coordinated Capsule</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.map((product) => {
                const isItemSaved = isSaved(product.id);
                const isItemInCart = cartItems.some((it) => it.id === product.id);
                return (
                  <WishlistRecommendationCard
                    key={product.id}
                    product={product}
                    isSaved={isItemSaved}
                    inCart={isItemInCart}
                    onQuickSave={handleQuickSave}
                    onAddToCart={handleMoveToBag}
                  />
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Quick Variant Selection Modal */}
      <WishlistVariantModal
        product={variantModalProduct}
        isOpen={Boolean(variantModalProduct)}
        onClose={() => setVariantModalProduct(null)}
        onConfirm={handleConfirmVariant}
      />

      {/* Interactive Feedback Toast */}
      <WishlistToast
        toast={toast}
        onDismiss={() => setToast(null)}
      />
    </div>
  );
}
