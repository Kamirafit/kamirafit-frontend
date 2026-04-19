"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { addToCart } from "../store/cartSlice";
import { toggleWishlist } from "../store/wishlistSlice";
import type { Product } from "../types";
import { HeartIcon } from "./icons";

type Props = {
  product: Product;
};

function BagIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 7h12l-1.2 12.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 7Z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </svg>
  );
}

export default function ProductCard({ product }: Props) {
  const dispatch = useAppDispatch();
  const isSaved = useAppSelector((s) => s.wishlist.ids.includes(product.id));
  const inCart = useAppSelector((s) =>
    s.cart.items.some((it) => it.id === product.id),
  );

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-[0_30px_60px_-30px_rgba(74,14,26,0.25)]">
      <Link
        href={`/product/${product.id}`}
        aria-label={`View ${product.name}`}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-ink-2"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4 sm:p-5">
        <Link
          href={`/product/${product.id}`}
          className="font-display text-[17px] font-semibold leading-tight text-paper transition-colors hover:text-gold"
        >
          {product.name}
        </Link>
        <p className="line-clamp-2 text-[13px] leading-snug text-paper-muted">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <p className="font-display text-[17px] font-semibold tracking-wide text-paper">
            {formatPrice(product.price)}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={isSaved}
              onClick={(e) => {
                e.preventDefault();
                dispatch(toggleWishlist(product.id));
              }}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
                isSaved
                  ? "border-transparent bg-[#DC2626]/10 text-[#DC2626]"
                  : "border-line text-paper-muted hover:border-[#DC2626]/40 hover:text-[#DC2626]"
              }`}
            >
              <HeartIcon filled={isSaved} width={15} height={15} />
            </button>
            <button
              type="button"
              aria-label={inCart ? "Added to cart" : "Add to cart"}
              aria-pressed={inCart}
              onClick={(e) => {
                e.preventDefault();
                dispatch(addToCart({ id: product.id }));
              }}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all ${
                inCart
                  ? "border-transparent bg-paper text-ink"
                  : "border-line text-paper-muted hover:border-paper hover:bg-paper hover:text-ink"
              }`}
            >
              <BagIcon filled={inCart} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
