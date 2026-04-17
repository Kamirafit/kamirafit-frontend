"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { addToCart } from "../store/cartSlice";
import { toggleWishlist } from "../store/wishlistSlice";
import type { Color, Product, Size } from "../types";
import ColorSelector from "./ColorSelector";
import { HeartIcon } from "./icons";
import ImageGallery from "./ImageGallery";
import SizeSelector from "./SizeSelector";
import StarRating from "./StarRating";

type Props = {
  product: Product;
};

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProductDetailsClient({ product }: Props) {
  const dispatch = useAppDispatch();
  const isSaved = useAppSelector((s) =>
    s.wishlist.ids.includes(product.id),
  );

  const [selectedSize, setSelectedSize] = useState<Size | null>(
    product.size[0] ?? null,
  );
  const [selectedColor, setSelectedColor] = useState<Color | null>(
    product.color[0] ?? null,
  );
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    dispatch(
      addToCart({
        id: product.id,
        size: selectedSize,
        color: selectedColor ?? undefined,
      }),
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
      <div>
        <ImageGallery images={product.images} alt={product.name} />
      </div>

      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            {product.category}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            {product.name}
          </h1>
          <div className="flex items-center gap-3">
            <StarRating rating={product.rating} size={16} />
            <span className="text-sm text-neutral-500">
              ({product.reviews.length} reviews)
            </span>
          </div>
          <p className="text-2xl font-semibold text-neutral-900">
            {formatPrice(product.price)}
          </p>
          <p className="max-w-prose text-sm leading-relaxed text-neutral-600">
            {product.description}
          </p>
        </header>

        <div className="flex flex-col gap-6">
          <SizeSelector
            options={product.size}
            value={selectedSize}
            onChange={(s) => {
              setSelectedSize(s);
              setSizeError(false);
            }}
            error={sizeError}
          />
          <ColorSelector
            options={product.color}
            value={selectedColor}
            onChange={setSelectedColor}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <button
            type="button"
            onClick={handleAddToCart}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-neutral-900 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
          >
            {added ? "Added to cart" : "Add to Cart"}
          </button>
          <button
            type="button"
            aria-pressed={isSaved}
            onClick={() => dispatch(toggleWishlist(product.id))}
            className={`inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3.5 text-sm font-medium transition-colors ${
              isSaved
                ? "border-red-500 bg-white text-red-500 hover:bg-red-50"
                : "border-neutral-300 bg-white text-neutral-900 hover:border-neutral-900"
            }`}
          >
            <HeartIcon filled={isSaved} width={16} height={16} />
            {isSaved ? "Saved" : "Wishlist"}
          </button>
        </div>

        <dl className="mt-2 grid grid-cols-1 gap-3 border-t border-neutral-200 pt-6 text-sm text-neutral-600 sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="font-medium text-neutral-900">SKU</dt>
            <dd>{product.id.toUpperCase()}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-neutral-900">Category</dt>
            <dd>{product.category}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-neutral-900">Sizes</dt>
            <dd>{product.size.join(", ")}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-neutral-900">Colors</dt>
            <dd>{product.color.join(", ")}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
