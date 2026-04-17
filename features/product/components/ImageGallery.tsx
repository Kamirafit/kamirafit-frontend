"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  images: string[];
  alt: string;
};

export default function ImageGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0);
  const activeSrc = images[active] ?? images[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-line bg-ink-2 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]">
        <Image
          key={activeSrc}
          src={activeSrc}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 560px, 100vw"
          priority
          className="object-cover"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-gold/10"
        />
      </div>

      {images.length > 1 ? (
        <div
          role="tablist"
          aria-label="Product images"
          className="flex gap-3 overflow-x-auto pb-1"
        >
          {images.map((src, i) => {
            const selected = i === active;
            return (
              <button
                key={src + i}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={`Show image ${i + 1}`}
                onClick={() => setActive(i)}
                className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg border transition-all duration-200 ${
                  selected
                    ? "border-gold shadow-[0_0_0_1px_rgba(212,175,55,0.5)]"
                    : "border-line hover:border-gold/60"
                }`}
              >
                <Image
                  src={src}
                  alt={`${alt} thumbnail ${i + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
