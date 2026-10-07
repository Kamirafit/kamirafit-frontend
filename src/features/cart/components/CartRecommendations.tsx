"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch } from "@/features/product/hooks/redux";
import { addToCart } from "@/features/product/store/cartSlice";
import type { Product } from "@/features/product/types";
import { DEFAULT_PRODUCT_IMAGE, getValidImageSrc } from "@/lib/format";
import { formatPrice } from "../utils";

type Props = {
  products: Product[];
  currentCartIds: string[];
};

export default function CartRecommendations({ products, currentCartIds }: Props) {
  const dispatch = useAppDispatch();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  // Filter out products already in the cart
  const cartSet = new Set(currentCartIds);
  const candidates = products.filter(
    (p) => !cartSet.has(p.id) && p.isAvailable && p.isActive
  );

  if (candidates.length === 0) return null;

  const displayList = candidates.slice(0, 8);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = direction === "left" ? -320 : 320;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  const handleAdd = (product: Product) => {
    const defaultVariant = product.variants?.[0];
    const defaultSize = product.sizes?.[0] || defaultVariant?.size || "M";
    const defaultColor = product.colors?.[0] || defaultVariant?.color || "Black";

    dispatch(
      addToCart({
        id: product.id,
        variantId: defaultVariant?.id,
        size: defaultSize as unknown as undefined,
        color: defaultColor as unknown as undefined,
        quantity: 1,
      })
    );

    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  return (
    <div className="mt-8 pt-8 border-t border-outline-variant/30">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="font-sans text-[11px] uppercase tracking-widest text-surface-tint font-semibold block">
            Pairs Seamlessly
          </span>
          <h3 className="font-serif text-lg sm:text-xl text-primary font-medium mt-0.5">
            Curated Studio Additions
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Previous recommended items"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-lowest text-primary transition-colors hover:bg-surface-container-high"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Next recommended items"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-lowest text-primary transition-colors hover:bg-surface-container-high"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none scroll-smooth snap-x"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {displayList.map((product) => {
          const imageSrc = getValidImageSrc(product.image, DEFAULT_PRODUCT_IMAGE);
          const isAdded = Boolean(addedIds[product.id]);

          return (
            <div
              key={product.id}
              className="flex w-72 sm:w-80 shrink-0 snap-start items-center gap-3.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-3.5 shadow-xs transition-all hover:shadow-sm group"
            >
              <Link
                href={`/product/${product.slug || product.id}`}
                className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-container"
              >
                <Image
                  src={imageSrc}
                  alt={product.name}
                  fill
                  sizes="64px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <Link
                    href={`/product/${product.slug || product.id}`}
                    className="block truncate font-serif text-sm font-medium text-primary hover:text-surface-tint transition-colors"
                  >
                    {product.name}
                  </Link>
                  <p className="truncate text-[11px] text-on-surface-variant mt-0.5">
                    {product.category || "Atelier Apparel"}
                  </p>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleAdd(product)}
                    disabled={isAdded}
                    aria-label={`Add ${product.name} to bag`}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                      isAdded
                        ? "bg-emerald-600 text-white"
                        : "bg-surface-container-high text-primary hover:bg-primary-container hover:text-white"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Added
                      </>
                    ) : (
                      <>
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Add
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
