"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DEFAULT_PRODUCT_IMAGE, formatPrice, getValidImageSrc } from "@/lib/format";
import { useAppDispatch } from "@/features/product/hooks/redux";
import { addToCart } from "@/features/product/store/cartSlice";

export type Product = {
  id: string;
  slug?: string;
  name: string;
  price: number;
  mrp?: number;
  image: string;
  tag?: "New" | "Bestseller" | string;
};

type Props = {
  product: Product;
};

const BADGE_CLASS: Record<string, string> = {
  New: "bg-[#22C55E]",
  Bestseller: "bg-[#F97316]",
};

export default function ProductCard({ product }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [added, setAdded] = useState(false);
  const badgeBg = product.tag
    ? BADGE_CLASS[product.tag] ?? "bg-gold"
    : undefined;
  const imageSrc = getValidImageSrc(product.image, DEFAULT_PRODUCT_IMAGE);
  const productHref = `/product/${product.slug || product.id}`;

  const mrp = typeof product.mrp === "number" ? product.mrp : 0;
  const price = typeof product.price === "number" ? product.price : 0;
  const hasDiscount = mrp > 0 && price > 0 && mrp > price;
  const discountPercent = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const handleCardClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    if (e.metaKey || e.ctrlKey) {
      window.open(productHref, "_blank");
    } else {
      router.push(productHref);
    }
  };

  return (
    <article
      onClick={handleCardClick}
      className="group flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/30 hover:border-primary-container/40 transition-all duration-500 shadow-sm hover:shadow-2xl cursor-pointer"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-container">
        <Link href={productHref} className="block h-full w-full">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            unoptimized={imageSrc.startsWith("data:") || imageSrc.startsWith("blob:")}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>
        {product.tag ? (
          <span
            className={`absolute left-3.5 top-3.5 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-md ${badgeBg}`}
          >
            {product.tag}
          </span>
        ) : hasDiscount ? (
          <span className="absolute left-3.5 top-3.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-sans font-bold tracking-wider shadow-sm">
            {discountPercent}% OFF
          </span>
        ) : null}

        {/* Slide-Up Atelier Quick Buy Bar */}
        <div className="absolute inset-x-3.5 bottom-3.5 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              dispatch(
                addToCart({
                  id: product.id,
                  quantity: 1,
                })
              );
              setAdded(true);
              window.setTimeout(() => setAdded(false), 1800);
            }}
            className={`flex-1 py-3 px-3.5 rounded-2xl backdrop-blur-md text-white text-xs font-sans font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              added ? "bg-primary" : "bg-primary-container/95 hover:bg-primary"
            }`}
          >
            <span>{added ? "Added to Bag" : `Quick Add • ${formatPrice(price > 0 ? price : mrp)}`}</span>
          </button>
        </div>
      </div>
      <div className="p-5 sm:p-6 flex flex-col justify-between flex-grow">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-surface-tint">
            Signature Edit
          </span>
          <Link
            href={productHref}
            className="font-serif text-base sm:text-lg font-medium text-primary group-hover:text-surface-tint transition-colors line-clamp-1 block mt-1"
          >
            {product.name}
          </Link>
        </div>
        <div className="mt-4 pt-3.5 border-t border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-base font-bold text-primary">
              {formatPrice(price > 0 ? price : mrp)}
            </span>
            {hasDiscount ? (
              <span className="font-sans text-xs text-outline line-through">
                {formatPrice(mrp)}
              </span>
            ) : null}
          </div>
          {hasDiscount ? (
            <span className="font-sans text-[10px] font-bold text-on-secondary-container bg-secondary-container px-2 py-0.5 rounded-full">
              {discountPercent}% OFF
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
