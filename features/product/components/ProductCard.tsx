"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { useAppDispatch } from "../hooks/redux";
import { addToCart } from "../store/cartSlice";
import type { Product } from "../types";
import { COLOR_SWATCH } from "../types";
import StarRating from "./StarRating";
import WishlistButton from "./WishlistButton";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const dispatch = useAppDispatch();

  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-line bg-ink-2 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-[1.02] group-hover:border-gold/50 group-hover:shadow-lg group-hover:shadow-[0_30px_60px_-30px_rgba(139,30,45,0.35)]">
        <Link
          href={`/product/${product.id}`}
          aria-label={`View ${product.name}`}
          className="absolute inset-0 z-0"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        </Link>
        <WishlistButton
          productId={product.id}
          className="absolute right-3 top-3 z-10"
        />
        <span className="absolute left-3 top-3 z-10 rounded-full border border-gold/50 bg-ink/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold backdrop-blur">
          {product.category}
        </span>

        {/* Add-to-Cart: always visible, invert colors on hover */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            dispatch(addToCart({ id: product.id }));
          }}
          className="absolute inset-x-3 bottom-3 z-10 inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink shadow-lg shadow-black/20 transition-colors duration-200 ease-out hover:bg-gold hover:text-white"
        >
          Add to Cart
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="truncate font-display text-[15px] font-medium text-paper">
            <Link
              href={`/product/${product.id}`}
              className="transition-colors hover:text-gold"
            >
              {product.name}
            </Link>
          </h3>
          <p className="shrink-0 font-display text-[15px] font-semibold tracking-wide text-gold">
            {formatPrice(product.price)}
          </p>
        </div>

        <StarRating rating={product.rating} />

        <div className="flex items-center gap-1.5">
          {product.color.map((c) => (
            <span
              key={c}
              aria-label={c}
              title={c}
              className="inline-block h-3 w-3 rounded-full border border-line"
              style={{ backgroundColor: COLOR_SWATCH[c] }}
            />
          ))}
        </div>
      </div>
    </article>
  );
}
