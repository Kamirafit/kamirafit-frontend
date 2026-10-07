"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { DEFAULT_PRODUCT_IMAGE, formatPrice, getValidImageSrc } from "@/lib/format";
import type { Product } from "../types";
import { CloseIcon, ShoppingBagIcon, CheckIcon } from "./icons";

type Props = {
  product: Product;
  onRemove: (product: Product) => void;
  onMoveToBag: (product: Product) => void;
  inCart?: boolean;
};

export default function WishlistProductCard({
  product,
  onRemove,
  onMoveToBag,
  inCart = false,
}: Props) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [imgSrc, setImgSrc] = useState(() => getValidImageSrc(product.image, DEFAULT_PRODUCT_IMAGE));

  const totalStock = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return product.isAvailable ? 10 : 0;
    return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  }, [product.variants, product.isAvailable]);

  const isOutOfStock = totalStock <= 0 || !product.isAvailable;
  const isLowStock = !isOutOfStock && totalStock > 0 && totalStock <= 3;

  const mrp = typeof product.mrp === "number" ? product.mrp : typeof product.baseMrp === "number" ? product.baseMrp : 0;
  const price = typeof product.price === "number" ? product.price : 0;
  const hasDiscount = mrp > 0 && price > 0 && mrp > price;
  const discountPercent = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const savings = hasDiscount ? mrp - price : 0;

  const productHref = `/product/${product.slug || product.id}`;

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(product);
    }, 320);
  };

  const handleMoveToBagClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    onMoveToBag(product);
  };

  return (
    <article
      data-item-id={product.id}
      data-stock={isOutOfStock ? "out" : isLowStock ? "low" : "in"}
      data-sale={hasDiscount ? "true" : "false"}
      className={`wishlist-card group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/30 ${
        isRemoving ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* 4:5 Product Imagery & Top Controls */}
      <div className="relative w-full aspect-[4/5] bg-surface-container overflow-hidden">
        <Link href={productHref} className="block h-full w-full">
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
            unoptimized={imgSrc.startsWith("data:") || imgSrc.startsWith("blob:")}
            onError={() => setImgSrc(DEFAULT_PRODUCT_IMAGE)}
            className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
              isOutOfStock ? "opacity-75 grayscale-20" : ""
            }`}
          />
        </Link>

        {/* Remove from Curated List Button */}
        <button
          type="button"
          aria-label={`Remove ${product.name} from wishlist`}
          onClick={handleRemoveClick}
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-surface/90 text-primary hover:bg-primary-container hover:text-white transition-all flex items-center justify-center shadow-sm backdrop-blur-md z-10 cursor-pointer"
        >
          <CloseIcon width={16} height={16} />
        </button>

        {/* Badges Floating Plate */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 items-start pointer-events-none z-10">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 rounded bg-surface-dim text-on-surface-variant font-sans text-[10px] font-bold uppercase tracking-wider shadow-sm">
              Out of Stock
            </span>
          ) : (
            <>
              {hasDiscount && (
                <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-fixed font-sans text-[11px] font-bold shadow-sm">
                  {discountPercent}% OFF
                </span>
              )}
              {isLowStock && (
                <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed-variant font-sans text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  Only {totalStock} left
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Card Metadata Tray */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="font-sans text-[10px] uppercase text-secondary tracking-widest font-medium">
            {product.category || "KamiraFit Atelier"}
          </span>
          <Link href={productHref} className="block group-hover:text-surface-tint transition-colors">
            <h3 className="font-serif text-lg text-primary group-hover:text-surface-tint transition-colors font-medium line-clamp-1">
              {product.name}
            </h3>
          </Link>
          {product.description && (
            <p className="font-sans text-xs text-on-surface-variant line-clamp-1 font-light leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 pt-2">
          {/* Pricing Row */}
          <div className="flex items-baseline gap-2.5">
            <span className="font-serif text-lg font-semibold text-primary">
              {formatPrice(price > 0 ? price : mrp)}
            </span>
            {hasDiscount && (
              <span className="font-sans text-xs text-outline line-through">
                {formatPrice(mrp)}
              </span>
            )}
            {hasDiscount && savings > 0 && (
              <span className="font-sans text-xs text-surface-tint font-medium">
                Save {formatPrice(savings)}
              </span>
            )}
          </div>

          {/* Full-Width Move to Bag CTA */}
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleMoveToBagClick}
            aria-label={
              isOutOfStock
                ? `${product.name} is out of stock`
                : inCart
                ? `${product.name} already in shopping bag`
                : `Move ${product.name} to shopping bag`
            }
            className={`w-full py-3 rounded-full font-sans text-xs uppercase tracking-[0.06em] font-medium transition-all flex items-center justify-center gap-2 shadow-sm ${
              isOutOfStock
                ? "bg-surface-container-high text-outline cursor-not-allowed opacity-80"
                : inCart
                ? "bg-surface-container-high text-primary hover:bg-surface-dim cursor-pointer"
                : "bg-primary-container text-white hover:bg-primary hover:shadow-md cursor-pointer"
            }`}
          >
            {isOutOfStock ? (
              <span>Out of Stock</span>
            ) : inCart ? (
              <>
                <CheckIcon width={16} height={16} />
                <span>In Bag</span>
              </>
            ) : (
              <>
                <ShoppingBagIcon width={16} height={16} />
                <span>Move to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
