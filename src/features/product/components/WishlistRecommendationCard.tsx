"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { DEFAULT_PRODUCT_IMAGE, formatPrice, getValidImageSrc } from "@/lib/format";
import type { Product } from "../types";
import { HeartIcon, CheckIcon } from "./icons";

type Props = {
  product: Product;
  onQuickSave: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isSaved: boolean;
  inCart?: boolean;
};

export default function WishlistRecommendationCard({
  product,
  onQuickSave,
  onAddToCart,
  isSaved,
  inCart = false,
}: Props) {
  const [imgSrc, setImgSrc] = useState(() => getValidImageSrc(product.image, DEFAULT_PRODUCT_IMAGE));

  const mrp = typeof product.mrp === "number" ? product.mrp : typeof product.baseMrp === "number" ? product.baseMrp : 0;
  const price = typeof product.price === "number" ? product.price : 0;
  const productHref = `/product/${product.slug || product.id}`;

  return (
    <article className="group flex flex-col bg-surface-container-low rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-outline-variant/20">
      <div className="relative w-full aspect-[4/5] bg-surface-container overflow-hidden">
        <Link href={productHref} className="block h-full w-full">
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 50vw, 100vw"
            unoptimized={imgSrc.startsWith("data:") || imgSrc.startsWith("blob:")}
            onError={() => setImgSrc(DEFAULT_PRODUCT_IMAGE)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Curated Capsule Pill Tag */}
        <div className="absolute top-3.5 left-3.5 pointer-events-none z-10">
          <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-primary font-sans text-[10px] uppercase tracking-wider shadow-sm font-semibold">
            {product.category || "Curated Capsule"}
          </span>
        </div>

        {/* Quick Save Heart Button */}
        <button
          type="button"
          aria-label={isSaved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={isSaved}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onQuickSave(product);
          }}
          className={`absolute top-3.5 right-3.5 w-8 h-8 rounded-full transition-all flex items-center justify-center shadow-sm backdrop-blur-md z-10 cursor-pointer ${
            isSaved
              ? "bg-primary-container text-white"
              : "bg-surface/90 text-primary hover:bg-primary-container hover:text-white"
          }`}
        >
          <HeartIcon filled={isSaved} width={16} height={16} />
        </button>
      </div>

      <div className="p-5 flex flex-col justify-between flex-1 gap-4">
        <div>
          <span className="font-sans text-[10px] uppercase text-secondary font-medium tracking-wider">
            {product.category || "KamiraFit Edition"}
          </span>
          <Link href={productHref} className="block group-hover:text-surface-tint transition-colors">
            <h4 className="font-serif text-lg text-primary group-hover:text-surface-tint transition-colors mt-1 font-medium line-clamp-1">
              {product.name}
            </h4>
          </Link>
          {product.description && (
            <p className="font-sans text-xs text-on-surface-variant mt-1 line-clamp-1 font-light leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
          <span className="font-serif text-lg font-semibold text-primary">
            {formatPrice(price > 0 ? price : mrp)}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart(product);
            }}
            aria-label={inCart ? `${product.name} added to bag` : `Add ${product.name} to bag`}
            className={`px-4 py-2 rounded-full font-sans text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 font-medium cursor-pointer ${
              inCart
                ? "bg-primary text-white"
                : "bg-surface-container-high hover:bg-primary-container hover:text-white text-primary"
            }`}
          >
            {inCart ? (
              <>
                <CheckIcon width={14} height={14} /> Added
              </>
            ) : (
              <>+ Add</>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
