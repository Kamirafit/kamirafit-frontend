"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { DEFAULT_PRODUCT_IMAGE, formatPrice, getValidImageSrc } from "@/lib/format";
import type { Product } from "@/features/product/types";

type Props = {
  query: string;
  results: Product[];
  selectedIndex: number;
  onHover: (index: number) => void;
  onSelect: () => void;
};

export default function SearchSuggestions({
  query,
  results,
  selectedIndex,
  onHover,
  onSelect,
}: Props) {
  const listRef = useRef<HTMLUListElement | null>(null);

  // Keep the selected item in view while arrowing through the list
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLElement>(
      `[data-index="${selectedIndex}"]`,
    );
    if (active) {
      active.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (query.trim() === "") {
    return (
      <div className="px-5 py-10 text-center text-sm text-paper-muted">
        Start typing to search the collection…
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="px-5 py-10 text-center text-sm text-paper-muted">
        No products match{" "}
        <span className="font-medium text-paper">&ldquo;{query}&rdquo;</span>.
        Try another term.
      </div>
    );
  }

  return (
    <ul ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
      {results.map((product, i) => {
        const active = i === selectedIndex;
        const imageSrc = getValidImageSrc(product.image, DEFAULT_PRODUCT_IMAGE);
        return (
          <li key={product.id} data-index={i}>
            <Link
              href={`/product/${product.slug || product.id}`}
              onMouseEnter={() => onHover(i)}
              onClick={onSelect}
              className={`flex items-center gap-4 px-4 py-3 transition-colors ${
                active ? "bg-ink-2" : "hover:bg-ink-2/70"
              }`}
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-line bg-ink-2">
                <Image
                  src={imageSrc}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-display text-[15px] font-medium text-paper">
                    {product.name}
                  </p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-[0.2em] text-paper-muted">
                    {product.category}
                  </p>
                </div>
                <p className="shrink-0 font-display text-[14px] font-semibold tracking-wide text-gold">
                  {formatPrice(product.price)}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
