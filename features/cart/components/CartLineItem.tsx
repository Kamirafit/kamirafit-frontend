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
    <li className="flex flex-col gap-4 border-b border-neutral-200 py-6 sm:flex-row sm:gap-6">
      <Link
        href={`/product/${product.id}`}
        className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:h-32 sm:w-28"
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
              className="block truncate text-sm font-medium text-neutral-900 transition-colors hover:text-neutral-600 sm:text-base"
            >
              {product.name}
            </Link>
            <p className="text-xs text-neutral-500">{product.category}</p>
          </div>
          <p className="text-sm font-semibold text-neutral-900 sm:text-base">
            {formatPrice(product.price)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600">
          {item.size ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="text-neutral-500">Size:</span>
              <span className="font-medium text-neutral-900">{item.size}</span>
            </span>
          ) : null}
          {item.color ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="text-neutral-500">Color:</span>
              <span
                aria-hidden
                className="inline-block h-3 w-3 rounded-full border border-neutral-200"
                style={{ backgroundColor: COLOR_SWATCH[item.color] }}
              />
              <span className="font-medium text-neutral-900">{item.color}</span>
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
            <p className="text-sm font-semibold text-neutral-900">
              {formatPrice(lineTotal)}
            </p>
            <button
              type="button"
              onClick={() => dispatch(removeFromCart(key))}
              className="text-xs font-medium text-neutral-500 underline-offset-4 transition-colors hover:text-neutral-900 hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
