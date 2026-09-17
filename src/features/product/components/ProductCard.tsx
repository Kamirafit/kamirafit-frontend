"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { DEFAULT_PRODUCT_IMAGE, formatPrice, getValidImageSrc } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { addToCart } from "../store/cartSlice";
import { useOptimisticWishlist } from "@/services/wishlist";
import { COLOR_SWATCH, type Product } from "../types";
import { HeartIcon } from "./icons";

type Props = {
  product: Product;
};

function ProductCartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="9" cy="20" r="1.5" fill={filled ? "currentColor" : "none"} />
      <circle cx="17" cy="20" r="1.5" fill={filled ? "currentColor" : "none"} />
      <path d="M3 3h2l.4 2" />
      <path
        d="M5.4 5L7 13h10l3-8H5.4z"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
}

export default function ProductCard({ product }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { isSaved, toggle } = useOptimisticWishlist();
  const saved = isSaved(product.id);
  const inCart = useAppSelector((s) =>
    s.cart.items.some((it) => it.id === product.id),
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [imgSrc, setImgSrc] = useState(() => getValidImageSrc(product.image, DEFAULT_PRODUCT_IMAGE));

  useEffect(() => {
    if (selectedColor && product.imageColorMap && product.images) {
      const match = product.images.find(
        (src) => product.imageColorMap?.[src]?.trim().toLowerCase() === selectedColor.trim().toLowerCase()
      );
      if (match) {
        setImgSrc(getValidImageSrc(match, DEFAULT_PRODUCT_IMAGE));
        return;
      }
    }
    setImgSrc(getValidImageSrc(product.image, DEFAULT_PRODUCT_IMAGE));
  }, [selectedColor, product.image, product.imageColorMap, product.images]);

  const handleActionWithAuth = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      const current = pathname || "/shop";
      router.push(`/login?redirect=${encodeURIComponent(current)}`);
      return;
    }
    action();
  };

  const productHref = selectedColor
    ? `/product/${product.slug || product.id}?color=${encodeURIComponent(selectedColor)}`
    : `/product/${product.slug || product.id}`;

  const handleCardClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("button")) {
      return;
    }
    if (e.metaKey || e.ctrlKey) {
      window.open(productHref, "_blank");
    } else {
      router.push(productHref);
    }
  };

  const totalStock = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return product.isAvailable ? 10 : 0;
    return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  }, [product.variants, product.isAvailable]);

  const isCardOutOfStock = totalStock <= 0 || !product.isAvailable;

  const mrp = typeof product.mrp === "number" ? product.mrp : typeof product.baseMrp === "number" ? product.baseMrp : 0;
  const price = typeof product.price === "number" ? product.price : 0;
  const hasDiscount = mrp > 0 && price > 0 && mrp > price;
  const discountPercent = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <article
      onClick={handleCardClick}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-[0_30px_60px_-30px_rgba(74,14,26,0.25)] cursor-pointer"
    >
      <Link
        href={productHref}
        aria-label={`View ${product.name}`}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-ink-2"
      >
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          unoptimized={imgSrc.startsWith("data:") || imgSrc.startsWith("blob:")}
          onError={() => setImgSrc(DEFAULT_PRODUCT_IMAGE)}
          sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        {isCardOutOfStock ? (
          <div className="absolute top-3 left-3 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
            Out of Stock
          </div>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4 sm:p-5">
        <Link
          href={productHref}
          className="font-display text-[17px] font-semibold leading-tight text-paper transition-colors hover:text-gold"
        >
          {product.name}
        </Link>
        <p className="line-clamp-2 text-[13px] leading-snug text-paper-muted">
          {product.description}
        </p>

        {product.color && product.color.length > 1 ? (
          <div className="flex items-center gap-1.5 pt-0.5">
            {product.color.slice(0, 5).map((c) => {
              const isSelected = selectedColor === c;
              return (
                <button
                  key={c}
                  type="button"
                  aria-label={`Select ${c}`}
                  title={c}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedColor(isSelected ? null : c);
                  }}
                  onMouseEnter={() => setSelectedColor(c)}
                  className={`h-3 w-3 rounded-full border transition-all ${
                    isSelected ? "ring-2 ring-gold scale-125" : "border-line/70 hover:scale-115"
                  }`}
                  style={{ backgroundColor: COLOR_SWATCH[c] || "#888888" }}
                />
              );
            })}
            {product.color.length > 5 ? (
              <span className="text-[9.5px] text-paper-muted">+{product.color.length - 5}</span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <div className="flex items-baseline gap-2 flex-wrap">
            {hasDiscount ? (
              <>
                <span className="line-through text-paper-muted text-[13px] font-normal">
                  {formatPrice(mrp)}
                </span>
                <span className="font-display text-[17px] font-semibold tracking-wide text-paper">
                  {formatPrice(price)}
                </span>
                <span className="rounded bg-[#8B1E2D]/15 px-1.5 py-0.5 text-[11px] font-bold text-[#8B1E2D] dark:text-gold border border-[#8B1E2D]/25">
                  {discountPercent}% OFF
                </span>
              </>
            ) : (
              <span className="font-display text-[17px] font-semibold tracking-wide text-paper">
                {formatPrice(price > 0 ? price : mrp)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={saved}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggle(product.id);
              }}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
                saved
                  ? "border-transparent bg-[#DC2626]/10 text-[#DC2626]"
                  : "border-line text-paper-muted hover:border-[#DC2626]/40 hover:text-[#DC2626]"
              }`}
            >
              <HeartIcon filled={saved} width={15} height={15} />
            </button>
            <button
              type="button"
              aria-label={isCardOutOfStock ? "Out of stock" : inCart ? "Added to cart" : "Add to cart"}
              aria-pressed={inCart}
              disabled={isCardOutOfStock}
              onClick={(e) => {
                if (isCardOutOfStock) return;
                // If product has multiple sizes or colors, route to detail page for selection
                if ((product.size && product.size.length > 1) || (product.color && product.color.length > 1)) {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(productHref);
                  return;
                }
                const firstVar = product.variants?.[0];
                handleActionWithAuth(e, () =>
                  dispatch(
                    addToCart({
                      id: product.id,
                      variantId: firstVar?.id,
                      size: firstVar?.size || product.size?.[0],
                      color: firstVar?.color || product.color?.[0],
                    })
                  )
                );
              }}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 ease-in-out ${
                isCardOutOfStock
                  ? "border-line bg-ink-2 text-paper-muted/40 cursor-not-allowed"
                  : inCart
                  ? "border-gold bg-gold text-white shadow-[0_8px_20px_-8px_rgba(74,14,26,0.55)]"
                  : "border-gold bg-transparent text-gold hover:bg-gold hover:text-white hover:shadow-[0_8px_20px_-8px_rgba(74,14,26,0.55)]"
              }`}
            >
              <ProductCartIcon filled={inCart} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
