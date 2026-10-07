"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch } from "@/features/product/hooks/redux";
import {
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
} from "@/features/product/store/cartSlice";
import { COLOR_SWATCH } from "@/features/product/types";
import { useColorSwatchMap } from "@/services/product";
import { useOptimisticWishlist } from "@/services/wishlist";
import { DEFAULT_PRODUCT_IMAGE, getValidImageSrc } from "@/lib/format";
import { formatPrice, type ResolvedCartItem } from "../utils";
import QuantityStepper from "./QuantityStepper";

type Props = {
  resolved: ResolvedCartItem;
};

export default function CartLineItem({ resolved }: Props) {
  const swatchMap = useColorSwatchMap();
  const dispatch = useAppDispatch();
  const { isSaved, toggle: toggleWishlist } = useOptimisticWishlist();
  const { item, product, lineTotal } = resolved;
  const key = { id: item.id, size: item.size, color: item.color };

  const isItemSaved = isSaved(product.id);

  const imageSrc = useMemo(() => {
    if (item.color && product.imageColorMap && product.images) {
      const match = product.images.find(
        (src) =>
          product.imageColorMap?.[src]?.trim().toLowerCase() ===
          item.color?.trim().toLowerCase()
      );
      if (match) return getValidImageSrc(match, DEFAULT_PRODUCT_IMAGE);
    }
    return getValidImageSrc(product.image, DEFAULT_PRODUCT_IMAGE);
  }, [item.color, product.image, product.imageColorMap, product.images]);

  const variant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;
    return (
      product.variants.find(
        (v) =>
          (!item.size || v.size === item.size) &&
          (!item.color || v.color === item.color)
      ) || product.variants[0]
    );
  }, [product.variants, item.size, item.color]);

  const maxStock = variant?.stock ?? 20;

  // Real authoritative MRP from variant or product if available
  const effectiveMrp = variant?.mrp || product.mrp || 0;
  const unitPrice = product.price;
  const hasDiscount = effectiveMrp > unitPrice;
  const discountPercent = hasDiscount
    ? Math.round(((effectiveMrp - unitPrice) / effectiveMrp) * 100)
    : 0;

  return (
    <article className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 sm:p-5 md:p-6 shadow-xs transition-all hover:shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center">
        {/* Visual & Details (Col 6 on desktop) */}
        <div className="md:col-span-6 flex gap-4 min-w-0">
          <Link
            href={`/product/${product.slug || product.id}`}
            className="group relative h-32 w-24 sm:h-36 sm:w-28 shrink-0 overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container transition-all"
          >
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              sizes="112px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {product.isFeatured ? (
              <span className="absolute top-2 left-2 rounded bg-primary-container px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-white shadow-xs">
                Signature
              </span>
            ) : null}
          </Link>

          <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
            <div>
              <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-wider text-surface-tint font-semibold block">
                {product.category || "Atelier"}
              </span>

              <h3 className="font-serif text-base sm:text-lg text-primary font-medium truncate mt-0.5">
                <Link
                  href={`/product/${product.slug || product.id}`}
                  className="hover:text-surface-tint transition-colors"
                >
                  {product.name}
                </Link>
              </h3>

              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1.5 text-xs text-on-surface-variant font-sans">
                {item.color ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className="inline-block h-3 w-3 rounded-full border border-outline-variant/50"
                      style={{
                        backgroundColor:
                          swatchMap[item.color] ||
                          COLOR_SWATCH[item.color] ||
                          "#888888",
                      }}
                    />
                    <span>{item.color}</span>
                  </span>
                ) : null}

                {item.color && item.size ? (
                  <span className="text-outline-variant">•</span>
                ) : null}

                {item.size ? (
                  <span>
                    Size:{" "}
                    <strong className="font-semibold text-primary">
                      {item.size}
                    </strong>
                  </span>
                ) : null}
              </div>

              {maxStock <= 5 ? (
                <p className="mt-1.5 text-[11px] font-medium text-amber-700">
                  Only {maxStock} left in stock
                </p>
              ) : null}
            </div>

            {/* Actions: Save for Later & Remove */}
            <div className="flex items-center gap-4 pt-3 text-xs">
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                aria-label={
                  isItemSaved
                    ? `Remove ${product.name} from saved items`
                    : `Save ${product.name} for later`
                }
              >
                <svg
                  className={`h-3.5 w-3.5 ${
                    isItemSaved ? "fill-surface-tint text-surface-tint" : "text-current"
                  }`}
                  fill={isItemSaved ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                <span>{isItemSaved ? "Saved" : "Save for Later"}</span>
              </button>

              <button
                type="button"
                onClick={() => dispatch(removeFromCart(key))}
                className="flex items-center gap-1 text-red-700/80 hover:text-red-700 transition-colors cursor-pointer"
                aria-label={`Remove ${product.name} from cart`}
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stepper (Col 3 on desktop, centered) */}
        <div className="md:col-span-3 flex md:justify-center items-center">
          <QuantityStepper
            value={item.quantity}
            max={Math.max(1, maxStock)}
            ariaLabel={`Quantity for ${product.name}`}
            onIncrement={() => {
              if (item.quantity < maxStock) {
                dispatch(incrementQuantity(key));
              }
            }}
            onDecrement={() => dispatch(decrementQuantity(key))}
          />
        </div>

        {/* Price (Col 3 on desktop, right aligned) */}
        <div className="md:col-span-3 flex md:flex-col md:items-end justify-between items-center">
          <div className="text-right">
            <div className="flex items-baseline md:justify-end gap-2">
              <span className="font-serif text-base sm:text-lg font-semibold text-primary">
                {formatPrice(lineTotal)}
              </span>
            </div>

            {hasDiscount ? (
              <div className="flex items-center md:justify-end gap-1.5 mt-0.5">
                <span className="line-through text-outline font-mono text-xs">
                  {formatPrice(effectiveMrp * item.quantity)}
                </span>
                <span className="rounded bg-secondary-container px-1.5 py-0.5 text-[10px] font-bold text-on-secondary-fixed">
                  {discountPercent}% OFF
                </span>
              </div>
            ) : null}
          </div>

          <p className="text-[11px] text-outline font-mono mt-1 hidden md:block">
            Incl. all taxes
          </p>
        </div>
      </div>
    </article>
  );
}
