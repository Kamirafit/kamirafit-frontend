"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
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

function LocationPinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

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
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
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

  // ---------------- PINCODE DELIVERY ESTIMATOR STATE ----------------
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState<{
    status: "valid" | "invalid";
    estimatedDate?: string;
    message?: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPin = localStorage.getItem("kamirafit_pincode");
      if (savedPin && savedPin.length === 6) {
        setPincode(savedPin);
        calculateDelivery();
      }
    }
  }, []);

  const calculateDelivery = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    const options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "short" };
    const formattedDate = deliveryDate.toLocaleDateString("en-IN", options);

    setPincodeResult({
      status: "valid",
      estimatedDate: formattedDate,
    });
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pincode.trim().replace(/\D/g, "");
    if (clean.length !== 6) {
      setPincodeResult({
        status: "invalid",
        message: "Please enter a valid 6-digit postal pincode.",
      });
      return;
    }

    calculateDelivery();
    if (typeof window !== "undefined") {
      localStorage.setItem("kamirafit_pincode", clean);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      const current = pathname || `/product/${product.id}`;
      router.push(`/login?redirect=${encodeURIComponent(current)}`);
      return;
    }

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

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      const current = pathname || `/product/${product.id}`;
      router.push(`/login?redirect=${encodeURIComponent(current)}`);
      return;
    }
    dispatch(toggleWishlist(product.id));
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

        {/* ---------------- PINCODE DELIVERY ESTIMATOR ---------------- */}
        <div className="rounded-2xl border border-line bg-ink p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-paper-muted flex items-center gap-1.5">
              <LocationPinIcon />
              Delivery & Pincode Check
            </span>
            {pincodeResult?.status === "valid" && (
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                Serviceable Area
              </span>
            )}
          </div>

          <form onSubmit={handleCheckPincode} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value.replace(/\D/g, ""));
                  if (pincodeResult) setPincodeResult(null);
                }}
                placeholder="Enter 6-digit Pincode"
                className="w-full rounded-xl border border-line bg-ink-2 px-3.5 py-2.5 text-xs text-paper placeholder-paper-muted/50 focus:border-gold focus:outline-none tracking-widest font-mono transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={!pincode || pincode.length < 6}
              className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl border border-gold bg-gold/15 text-gold hover:bg-gold hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              Check
            </button>
          </form>

          {/* Green Response Banner on Successful Check */}
          {pincodeResult?.status === "valid" && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 space-y-1 animate-fadeIn">
              <p className="font-semibold flex items-center gap-1.5 text-emerald-300">
                <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                Estimated Delivery by {pincodeResult.estimatedDate} (3–4 business days)
              </p>
              <p className="text-[11px] text-emerald-400/90 pl-5">
                ✓ Free Express Delivery • Cash on Delivery (COD) Available
              </p>
            </div>
          )}

          {pincodeResult?.status === "invalid" && (
            <p className="text-xs text-red-400 font-medium">
              {pincodeResult.message}
            </p>
          )}
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
            onClick={handleToggleWishlist}
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
