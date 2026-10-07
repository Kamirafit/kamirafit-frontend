"use client";

import { useState } from "react";
import Image from "next/image";
import { formatPrice, DEFAULT_PRODUCT_IMAGE, getValidImageSrc } from "@/lib/format";
import type { OrderItem } from "@/types/entities";

type OrderItemRowProps = {
  item: OrderItem & {
    mrp?: number;
    category?: string;
  };
};

export default function OrderItemRow({ item }: OrderItemRowProps) {
  const [imgSrc, setImgSrc] = useState<string>(() =>
    getValidImageSrc(item.productImage || DEFAULT_PRODUCT_IMAGE)
  );

  const price = Number(item.price) || 0;
  const mrp = item.mrp ? Number(item.mrp) : undefined;
  const hasDiscount = mrp && mrp > price;

  return (
    <article className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-5 p-4 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low/50 transition-colors border border-outline-variant/20">
      <div className="flex items-center gap-4 sm:gap-5 min-w-0">
        <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-lg overflow-hidden bg-surface-container shrink-0 border border-outline-variant/30">
          <Image
            src={imgSrc}
            alt={item.productName || "Product item"}
            fill
            sizes="(max-width: 640px) 80px, 96px"
            className="object-cover"
            onError={() => setImgSrc(DEFAULT_PRODUCT_IMAGE)}
          />
        </div>

        <div className="min-w-0">
          {item.category && (
            <span className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase text-surface-tint tracking-widest block truncate">
              {item.category}
            </span>
          )}
          <h4 className="font-display text-base sm:text-lg text-primary font-medium truncate mt-0.5 leading-snug">
            {item.productName || "Garment Ensemble"}
          </h4>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs font-sans text-on-surface-variant">
            {item.size && (
              <span className="bg-surface-container px-2.5 py-0.5 rounded text-on-surface font-medium text-[11px]">
                Size: {item.size}
              </span>
            )}
            {item.color && (
              <span className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-surface-tint/40 border border-surface-tint/60" />
                {item.color}
              </span>
            )}
            <span className="text-[11px] font-medium text-on-surface-variant">
              Qty: {item.quantity || 1}
            </span>
          </div>
        </div>
      </div>

      <div className="text-right sm:self-center shrink-0 w-full sm:w-auto flex sm:flex-col justify-between items-baseline sm:items-end border-t sm:border-t-0 pt-2 sm:pt-0 border-outline-variant/10">
        {hasDiscount && (
          <span className="font-sans text-xs text-on-surface-variant line-through sm:block">
            {formatPrice(mrp)}
          </span>
        )}
        <span className="font-display text-lg sm:text-xl text-primary font-bold">
          {formatPrice(price * (item.quantity || 1))}
        </span>
      </div>
    </article>
  );
}
