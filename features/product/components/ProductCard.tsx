"use client";

import Image from "next/image";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
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
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-neutral-100">
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
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </Link>
        <WishlistButton
          productId={product.id}
          className="absolute right-3 top-3 z-10"
        />
        <span className="absolute left-3 top-3 z-10 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-900 shadow-sm">
          {product.category}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="truncate text-sm font-medium text-neutral-900">
            <Link
              href={`/product/${product.id}`}
              className="transition-colors hover:text-neutral-600"
            >
              {product.name}
            </Link>
          </h3>
          <p className="shrink-0 text-sm font-semibold text-neutral-900">
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
              className="inline-block h-3 w-3 rounded-full border border-neutral-200"
              style={{ backgroundColor: COLOR_SWATCH[c] }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => dispatch(addToCart({ id: product.id }))}
          className={`${buttonClasses("secondary", "sm")} mt-2 w-full border-neutral-900 hover:bg-neutral-900 hover:text-white`}
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}
