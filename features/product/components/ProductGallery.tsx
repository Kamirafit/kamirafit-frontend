"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  images: string[];
  alt: string;
};

export default function ProductGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0);
  const activeSrc = images[active] ?? images[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-ink-2">
        <Image
          key={activeSrc}
          src={activeSrc}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 600px, 100vw"
          priority
          className="object-cover"
        />
      </div>

      {images.length > 1 ? (
        <div
          role="tablist"
          aria-label="Product images"
          className="grid grid-cols-4 gap-3"
        >
          {images.slice(0, 4).map((src, i) => {
            const selected = i === active;
            return (
              <button
                key={src + i}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={`Show image ${i + 1}`}
                onClick={() => setActive(i)}
                className={`relative aspect-square w-full overflow-hidden rounded-xl border transition-all duration-200 ${
                  selected
                    ? "border-paper shadow-[0_0_0_1px_rgba(26,26,26,0.25)]"
                    : "border-line hover:border-line-strong"
                }`}
              >
                <Image
                  src={src}
                  alt={`${alt} thumbnail ${i + 1}`}
                  fill
                  sizes="120px"
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
