"use client";

import Image from "next/image";
import Link from "next/link";
import { useAppDispatch } from "@/features/product/hooks/redux";
import {
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
} from "@/features/product/store/cartSlice";
import { COLOR_SWATCH } from "@/features/product/types";
import { formatPrice, type ResolvedCartItem } from "../utils";
import QuantityStepper from "./QuantityStepper";

type Props = {
  resolved: ResolvedCartItem;
};

export default function CartLineItem({ resolved }: Props) {
  const dispatch = useAppDispatch();
  const { item, product, lineTotal } = resolved;
  const key = { id: item.id, size: item.size, color: item.color };

  return (
    <li className="flex flex-col gap-4 border-b border-line py-6 sm:flex-row sm:gap-6">
      <Link
        href={`/product/${product.id}`}
        className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl border border-line bg-ink-2 transition-all duration-300 hover:border-gold/60 hover:shadow-[0_20px_40px_-20px_rgba(139,30,45,0.25)] sm:h-32 sm:w-28"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="112px"
          className="object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/product/${product.id}`}
              className="block truncate font-display text-sm font-medium text-paper transition-colors hover:text-gold sm:text-base"
            >
              {product.name}
            </Link>
            <p className="text-[11px] uppercase tracking-[0.2em] text-paper-muted">
              {product.category}
            </p>
          </div>
          <p className="font-display text-sm font-semibold tracking-wide text-gold sm:text-base">
            {formatPrice(product.price)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-paper-muted">
          {item.size ? (
            <span className="inline-flex items-center gap-1.5">
              <span>Size:</span>
              <span className="font-medium text-paper">{item.size}</span>
            </span>
          ) : null}
          {item.color ? (
            <span className="inline-flex items-center gap-1.5">
              <span>Color:</span>
              <span
                aria-hidden
                className="inline-block h-3 w-3 rounded-full border border-line"
                style={{ backgroundColor: COLOR_SWATCH[item.color] }}
              />
              <span className="font-medium text-paper">{item.color}</span>
            </span>
          ) : null}
        </div>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <QuantityStepper
            value={item.quantity}
            onIncrement={() => dispatch(incrementQuantity(key))}
            onDecrement={() => dispatch(decrementQuantity(key))}
          />
          <div className="flex items-center gap-4">
            <p className="font-display text-sm font-semibold text-gold">
              {formatPrice(lineTotal)}
            </p>
            <button
              type="button"
              onClick={() => dispatch(removeFromCart(key))}
              className="text-xs font-medium text-paper-muted underline-offset-4 transition-colors hover:text-gold hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
