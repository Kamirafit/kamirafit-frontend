"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { DEFAULT_PRODUCT_IMAGE, formatPrice, getValidImageSrc } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { addToCart } from "../store/cartSlice";
import { useOptimisticWishlist } from "@/services/wishlist";
import { useColorSwatchMap } from "@/services/product";
import { COLOR_SWATCH, type Product, type Size, type Color } from "../types";
import { HeartIcon, ShoppingBagIcon } from "./icons";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const swatchMap = useColorSwatchMap();
  const router = useRouter();
  const dispatch = useAppDispatch();
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

  const availableColors = useMemo(() => {
    if (Array.isArray(product.color) && product.color.length > 0) {
      return product.color;
    }
    const fromVariants = (product.variants || [])
      .map((v) => v.color)
      .filter((c): c is string => Boolean(c && c.trim()));
    return Array.from(new Set(fromVariants));
  }, [product.color, product.variants]);

  const availableSizes = useMemo(() => {
    if (Array.isArray(product.size) && product.size.length > 0) {
      return product.size;
    }
    const fromVariants = (product.variants || [])
      .map((v) => v.size)
      .filter((s): s is string => Boolean(s && s.trim()));
    return Array.from(new Set(fromVariants));
  }, [product.size, product.variants]);

  const hasMultipleColors = availableColors.length > 1;
  const hasMultipleSizes = availableSizes.length > 1;
  const requiresVariantPrompt = hasMultipleColors || hasMultipleSizes;

  const executeAddToCart = (chosenSize: string, chosenColor?: string | null) => {
    const matchingVariant =
      product.variants?.find(
        (v) =>
          (!chosenColor || v.color?.toLowerCase() === chosenColor.toLowerCase()) &&
          (!chosenSize || v.size?.toLowerCase() === chosenSize.toLowerCase())
      ) ||
      product.variants?.find(
        (v) => !chosenSize || v.size?.toLowerCase() === chosenSize.toLowerCase()
      ) ||
      product.variants?.[0];

    dispatch(
      addToCart({
        id: product.id,
        variantId: matchingVariant?.id,
        size: chosenSize as Size,
        color: (chosenColor || matchingVariant?.color) as Color,
        quantity: 1,
      })
    );
  };

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCardOutOfStock) return;

    if (requiresVariantPrompt) {
      if (e.metaKey || e.ctrlKey) {
        window.open(productHref, "_blank");
      } else {
        router.push(productHref);
      }
      return;
    }

    const defaultColor = selectedColor || availableColors[0];
    const defaultSize = availableSizes[0] || "M";
    executeAddToCart(defaultSize, defaultColor);
  };

  return (
    <article
      onClick={handleCardClick}
      className="group rounded-2xl bg-surface-container-lowest overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between border border-outline-variant/30 hover:border-primary-container/30 cursor-pointer relative"
    >
      {/* Product Imagery & Floating Actions */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-surface-container">
        <Link href={productHref} className="block h-full w-full">
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            unoptimized={imgSrc.startsWith("data:") || imgSrc.startsWith("blob:")}
            onError={() => setImgSrc(DEFAULT_PRODUCT_IMAGE)}
            sizes="(min-width: 1280px) 24vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start pointer-events-none">
          {isCardOutOfStock ? (
            <span className="px-2 py-0.5 rounded bg-surface-dim text-on-surface-variant font-sans text-[10px] font-bold tracking-wider uppercase shadow-sm">
              OUT OF STOCK
            </span>
          ) : hasDiscount ? (
            <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-sans text-[11px] font-bold shadow-sm">
              {discountPercent}% OFF
            </span>
          ) : null}
        </div>

        {/* Circular Wishlist Button */}
        <button
          type="button"
          aria-label={saved ? "Remove from curated wishlist" : "Add to curated wishlist"}
          aria-pressed={saved}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(product.id);
          }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur flex items-center justify-center transition-colors shadow-sm z-10 cursor-pointer ${
            saved
              ? "bg-primary-container text-white"
              : "bg-surface-container-lowest/90 text-primary hover:bg-primary-container hover:text-white"
          }`}
        >
          <HeartIcon filled={saved} width={16} height={16} />
        </button>
      </div>

      {/* Product Info Tray */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3 sm:gap-4">
        <div className="space-y-1.5">
          {/* Metadata / Hues Indicator */}
          <div className="flex items-center gap-2 flex-wrap">
            {product.color && product.color.length > 0 ? (
              <div className="flex items-center gap-1.5">
                {product.color.slice(0, 3).map((c) => {
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
                      className={`w-2.5 h-2.5 rounded-full transition-transform cursor-pointer ${
                        isSelected
                          ? "ring-2 ring-primary ring-offset-1 scale-125"
                          : "hover:scale-125"
                      }`}
                      style={{ backgroundColor: swatchMap[c] || COLOR_SWATCH[c] || "#888888" }}
                    />
                  );
                })}
                <span className="font-sans text-[10px] text-outline uppercase ml-0.5 tracking-wider">
                  {product.color.length > 1 ? `${product.color.length} Hues` : product.color[0]}
                </span>
              </div>
            ) : (
              <span className="font-sans text-[10px] text-outline uppercase tracking-wider">
                {product.category || "KamiraFit Edit"}
              </span>
            )}
          </div>

          <h3 className="font-serif text-base sm:text-lg text-primary group-hover:text-surface-tint transition-colors font-medium line-clamp-1">
            {product.name}
          </h3>
          {product.description && (
            <p className="font-sans text-xs text-secondary font-light line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Pricing & Circular Quick Add */}
        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-base sm:text-lg text-primary font-semibold">
              {formatPrice(price > 0 ? price : mrp)}
            </span>
            {hasDiscount && (
              <span className="font-sans text-xs text-outline line-through">
                {formatPrice(mrp)}
              </span>
            )}
          </div>

          <button
            type="button"
            aria-label={
              isCardOutOfStock
                ? "Out of stock"
                : inCart
                ? "In shopping bag"
                : requiresVariantPrompt
                ? "Select options"
                : "Quick add to shopping bag"
            }
            title={
              isCardOutOfStock
                ? "Out of stock"
                : inCart
                ? "In shopping bag"
                : requiresVariantPrompt
                ? "Select options"
                : "Quick add to shopping bag"
            }
            disabled={isCardOutOfStock}
            onClick={handleQuickAddClick}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer ${
              isCardOutOfStock
                ? "bg-surface-container text-outline cursor-not-allowed"
                : inCart
                ? "bg-primary text-white ring-2 ring-primary-container"
                : "bg-primary-container text-white hover:bg-primary hover:scale-105"
            }`}
          >
            <ShoppingBagIcon width={18} height={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
