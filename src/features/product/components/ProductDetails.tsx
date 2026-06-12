"use client";

import { useState, type ReactNode } from "react";
import { formatPrice } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { addToCart } from "../store/cartSlice";
import { toggleWishlist } from "../store/wishlistSlice";
import type { Color, Product, Size } from "../types";
import ColorSelector from "./ColorSelector";
import { HeartIcon, StarIcon } from "./icons";
import ProductGallery from "./ProductGallery";
import SizeSelector from "./SizeSelector";

type Props = {
  product: Product;
};

function TruckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="7" width="13" height="10" rx="1" />
      <path d="M15 10h4l2 3v4h-6" />
      <circle cx="6" cy="18" r="1.6" />
      <circle cx="17.5" cy="18" r="1.6" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9Z" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3 4 6v6c0 4.5 3.3 8.3 8 9 4.7-.7 8-4.5 8-9V6l-8-3Z" />
      <path d="m9.5 12 2 2 3.5-4" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

type AccordionProps = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

function Accordion({ title, defaultOpen = false, children }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-line">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="font-display text-[15px] font-semibold text-paper">
          {title}
        </span>
        <ChevronIcon open={open} />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-5 text-[13.5px] leading-relaxed text-paper-muted">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetails({ product }: Props) {
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
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
      <div>
        <ProductGallery images={product.images} alt={product.name} />
      </div>

      <div className="flex flex-col gap-7">
        <header className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center rounded-full border border-line bg-ink px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-paper-muted">
            {product.category}
          </span>
          <h1 className="font-display text-3xl font-semibold leading-[1.1] tracking-tight text-paper sm:text-[40px]">
            {product.name}
          </h1>
          <div className="flex items-center gap-2 text-[13px]">
            <span
              className="inline-flex items-center gap-1 text-gold"
              aria-label={`Rated ${product.rating.toFixed(1)} out of 5`}
            >
              <StarIcon width={14} height={14} filled />
              <span className="font-semibold text-paper">
                {product.rating.toFixed(1)}
              </span>
            </span>
            <span className="text-paper-muted">·</span>
            <span className="text-paper-muted">
              {product.reviews.length} reviews
            </span>
          </div>
          <p className="mt-1 font-display text-[28px] font-semibold tracking-tight text-paper">
            {formatPrice(product.price)}
          </p>
        </header>

        <div className="flex items-center gap-3 rounded-xl border border-line bg-ink px-4 py-3 text-[13px]">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
            <TruckIcon />
          </span>
          <p className="text-paper">
            Free delivery on orders over ₹999.{" "}
            <span className="text-paper-muted">
              Order in the next few hours for dispatch today.
            </span>
          </p>
        </div>

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

        <div className="flex items-stretch gap-3">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 rounded-full border-2 border-gold bg-gold px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_14px_30px_-14px_rgba(74,14,26,0.6)] transition-all duration-300 ease-in-out hover:bg-transparent hover:text-gold hover:shadow-[0_18px_40px_-18px_rgba(74,14,26,0.45)]"
          >
            {added ? "Added to cart" : "Add to Cart"}
          </button>
          <button
            type="button"
            aria-pressed={isSaved}
            aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
            onClick={() => dispatch(toggleWishlist(product.id))}
            className={`inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border transition-all ${
              isSaved
                ? "border-transparent bg-[#DC2626]/10 text-[#DC2626]"
                : "border-line-strong text-paper hover:border-[#DC2626] hover:text-[#DC2626]"
            }`}
          >
            <HeartIcon filled={isSaved} width={18} height={18} />
          </button>
        </div>

        <div>
          <Accordion title="Description & Fit" defaultOpen>
            <p className="max-w-prose">{product.description}</p>
            <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              <li>· Premium combed cotton blend</li>
              <li>· Reinforced shoulder seams</li>
              <li>· Pre-washed for minimal shrinkage</li>
              <li>· Relaxed, true-to-size fit</li>
            </ul>
          </Accordion>

          <Accordion title="Shipping & Returns">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <TruckIcon />
                </span>
                <div>
                  <p className="font-medium text-paper">Free shipping</p>
                  <p className="text-paper-muted">On orders over ₹999</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <ReturnIcon />
                </span>
                <div>
                  <p className="font-medium text-paper">Easy returns</p>
                  <p className="text-paper-muted">7-day exchange window</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <TagIcon />
                </span>
                <div>
                  <p className="font-medium text-paper">Secure checkout</p>
                  <p className="text-paper-muted">UPI, cards & COD</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <ShieldIcon />
                </span>
                <div>
                  <p className="font-medium text-paper">Quality promise</p>
                  <p className="text-paper-muted">Inspected before ship</p>
                </div>
              </div>
            </div>
          </Accordion>

          <Accordion title="Product details">
            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="flex gap-2">
                <dt className="font-medium text-paper">SKU</dt>
                <dd>{product.id.toUpperCase()}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium text-paper">Category</dt>
                <dd>{product.category}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium text-paper">Sizes</dt>
                <dd>{product.size.join(", ")}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium text-paper">Colors</dt>
                <dd>{product.color.join(", ")}</dd>
              </div>
            </dl>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
