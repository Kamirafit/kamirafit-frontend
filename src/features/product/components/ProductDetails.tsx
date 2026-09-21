"use client";

import { useState, useEffect, useMemo, type ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { addToCart } from "../store/cartSlice";
import { useOptimisticWishlist } from "@/services/wishlist";
import { orderService, type DeliveryEstimateResult } from "@/services/order";
import { calculateDeliveryCharge } from "@/lib/delivery";
import type { Color, Product, Size } from "../types";
import ColorSelector from "./ColorSelector";
import { HeartIcon, StarIcon } from "./icons";
import ProductGallery from "./ProductGallery";
import SizeSelector from "./SizeSelector";

type Props = {
  product: Product;
};

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}


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

const POPULAR_COUNTRIES = [
  { name: "India", code: "IN", placeholder: "e.g. 560038" },
  { name: "United States", code: "US", placeholder: "e.g. 90210" },
  { name: "United Kingdom", code: "GB", placeholder: "e.g. SW1A 1AA" },
  { name: "United Arab Emirates", code: "AE", placeholder: "e.g. 00000" },
  { name: "Canada", code: "CA", placeholder: "e.g. M5V 2T6" },
  { name: "Australia", code: "AU", placeholder: "e.g. 2000" },
  { name: "Germany", code: "DE", placeholder: "e.g. 10115" },
  { name: "Singapore", code: "SG", placeholder: "e.g. 018956" },
  { name: "France", code: "FR", placeholder: "e.g. 75001" },
  { name: "Other Country", code: "OTHER", placeholder: "Postal / ZIP code" },
];

export default function ProductDetails({ product }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const { isSaved, toggle: toggleWishlistOptimistic } = useOptimisticWishlist();
  const saved = isSaved(product.id);

  // Initialize selected color from URL query param ?color= if valid, else first available
  const initialColor = useMemo(() => {
    const queryColor = searchParams?.get("color");
    if (queryColor && product.color.includes(queryColor as Color)) {
      return queryColor as Color;
    }
    return product.color[0] ?? null;
  }, [searchParams, product.color]);

  const [selectedColor, setSelectedColor] = useState<Color | null>(initialColor);
  const [selectedSize, setSelectedSize] = useState<Size | null>(product.size[0] ?? null);

  // Sync color state when URL ?color changes
  useEffect(() => {
    const queryColor = searchParams?.get("color");
    if (queryColor && product.color.includes(queryColor as Color)) {
      setSelectedColor(queryColor as Color);
    }
  }, [searchParams, product.color]);

  // Filter gallery images by currently selected color using product.imageColorMap
  const colorImages = useMemo(() => {
    if (!product.images || product.images.length === 0) return [];
    if (!selectedColor || !product.imageColorMap) return product.images;

    const filtered = product.images.filter((img) => {
      const mappedColor = product.imageColorMap?.[img];
      return mappedColor === selectedColor;
    });

    if (filtered.length > 0) return filtered;
    return product.images;
  }, [product.images, product.imageColorMap, selectedColor]);

  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);

  // ---------------- WORLDWIDE DELIVERY ESTIMATOR STATE ----------------
  const [selectedCountry, setSelectedCountry] = useState("India");
  const [postalCode, setPostalCode] = useState("");
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false);
  const [deliveryResult, setDeliveryResult] = useState<DeliveryEstimateResult | null>(null);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  const currentCountryConfig = useMemo(() => {
    return POPULAR_COUNTRIES.find((c) => c.name === selectedCountry) || POPULAR_COUNTRIES[0];
  }, [selectedCountry]);

  const handleFetchEstimate = async (codeToUse: string, countryToUse: string) => {
    const clean = codeToUse.trim();
    if (!clean || clean.length < 2) {
      setDeliveryError("Please enter a valid postal or PIN code.");
      setDeliveryResult(null);
      return;
    }

    setIsCheckingDelivery(true);
    setDeliveryError(null);
    try {
      const res = await orderService.getDeliveryEstimate({
        postalCode: clean,
        country: countryToUse,
      });
      setDeliveryResult(res);
      if (typeof window !== "undefined") {
        localStorage.setItem("kamirafit_postal_code", clean);
        localStorage.setItem("kamirafit_country", countryToUse);
      }
    } catch {
      // Resilient client-side fallback using tiered calculation
      const fallback = calculateDeliveryCharge(clean, countryToUse);
      const targetDate = new Date();
      let added = 0;
      while (added < fallback.estimatedDays) {
        targetDate.setDate(targetDate.getDate() + 1);
        if (targetDate.getDay() !== 0) added++;
      }
      const formattedDate = targetDate.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "short",
      });

      setDeliveryResult({
        postalCode: clean,
        country: countryToUse,
        isDomestic: fallback.isDomestic,
        standard: {
          type: "STANDARD",
          title: "Standard Delivery",
          courierName: fallback.courierName,
          estimatedDays: fallback.estimatedDays,
          estimatedDate: formattedDate,
          isoEstimatedDate: targetDate.toISOString(),
          rate: fallback.rate,
          currency: "INR",
          isFree: false,
          description: `${fallback.zoneLabel} • Delivered by ${formattedDate}`,
        },
        prime: {
          type: "PRIME",
          title: "Prime Delivery",
          courierName: "Blue Dart Priority Air",
          estimatedDays: Math.max(1, Math.floor(fallback.estimatedDays / 2)),
          estimatedDate: formattedDate,
          isoEstimatedDate: targetDate.toISOString(),
          rate: fallback.rate + 100,
          currency: "INR",
          isFree: false,
          description: `Express • Delivered by ${formattedDate}`,
        },
        cheapestMethod: "STANDARD",
        fastestMethod: "PRIME",
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("kamirafit_postal_code", clean);
        localStorage.setItem("kamirafit_country", countryToUse);
      }
    } finally {
      setIsCheckingDelivery(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPin =
        localStorage.getItem("kamirafit_postal_code") ||
        localStorage.getItem("kamirafit_pincode") ||
        "560038";
      const savedCountry = localStorage.getItem("kamirafit_country") || "India";

      setPostalCode(savedPin);
      setSelectedCountry(savedCountry);

      if (savedPin) {
        handleFetchEstimate(savedPin, savedCountry);
      }
    }
  }, []);

  const handleCheckDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    handleFetchEstimate(postalCode, selectedCountry);
  };

  const cartItems = useAppSelector((s) => s.cart.items);

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;
    const match = product.variants.find((v) => {
      const matchSize = selectedSize ? v.size === selectedSize : true;
      const matchColor = selectedColor ? v.color === selectedColor : true;
      return matchSize && matchColor;
    });
    return match || product.variants[0];
  }, [product.variants, selectedSize, selectedColor]);

  const availableStock = selectedVariant?.stock ?? (product.isAvailable ? 10 : 0);
  const isOutOfStock = availableStock <= 0 || !product.isAvailable;

  const inCartQty = useMemo(() => {
    const item = cartItems.find(
      (it) =>
        it.id === product.id &&
        (selectedSize ? it.size === selectedSize : true) &&
        (selectedColor ? it.color === selectedColor : true)
    );
    return item?.quantity || 0;
  }, [cartItems, product.id, selectedSize, selectedColor]);

  const isMaxInCart = availableStock > 0 && inCartQty >= availableStock;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      const current = pathname || `/product/${product.slug || product.id}`;
      router.push(`/login?redirect=${encodeURIComponent(current)}`);
      return;
    }

    if (isOutOfStock || isMaxInCart) {
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
        variantId: selectedVariant?.id,
        size: selectedSize,
        color: selectedColor ?? undefined,
        quantity: 1,
      }),
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const handleToggleWishlist = () => {
    toggleWishlistOptimistic(product.id);
  };

  const activeMrp = typeof selectedVariant?.mrp === "number" && selectedVariant.mrp > 0
    ? selectedVariant.mrp
    : typeof product.mrp === "number"
    ? product.mrp
    : typeof product.baseMrp === "number"
    ? product.baseMrp
    : 0;
  const activePrice = typeof selectedVariant?.price === "number" && selectedVariant.price > 0
    ? selectedVariant.price
    : typeof product.price === "number"
    ? product.price
    : 0;
  const hasDiscount = activeMrp > 0 && activePrice > 0 && activeMrp > activePrice;
  const discountPercent = hasDiscount ? Math.round(((activeMrp - activePrice) / activeMrp) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
      <div>
        <ProductGallery images={colorImages} alt={product.name} />
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
          <div className="mt-1 flex flex-wrap items-baseline gap-3">
            {hasDiscount ? (
              <>
                <span className="line-through text-paper-muted text-[20px] font-normal">
                  {formatPrice(activeMrp)}
                </span>
                <p className="font-display text-[28px] font-semibold tracking-tight text-paper">
                  {formatPrice(activePrice)}
                </p>
                <span className="inline-flex items-center rounded-full bg-[#8B1E2D]/15 border border-[#8B1E2D]/30 px-2.5 py-0.5 text-xs font-bold text-gold uppercase tracking-wider">
                  {discountPercent}% OFF
                </span>
              </>
            ) : (
              <p className="font-display text-[28px] font-semibold tracking-tight text-paper">
                {formatPrice(activePrice > 0 ? activePrice : activeMrp)}
              </p>
            )}
          </div>
        </header>

        <div className="flex items-center gap-3 rounded-xl border border-line bg-ink px-4 py-3 text-[13px]">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
            <TruckIcon />
          </span>
          <p className="text-paper">
            Express delivery across Kolkata, West Bengal & Worldwide.{" "}
            <span className="text-paper-muted">
              Order in the next few hours for dispatch today.
            </span>
          </p>
        </div>

        {/* ---------------- WORLDWIDE DELIVERY ESTIMATOR ---------------- */}
        <div className="rounded-2xl border border-line bg-ink p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-paper-muted flex items-center gap-1.5">
              <LocationPinIcon />
              Worldwide Delivery & Speed Estimator
            </span>
            <span className="text-[10px] font-semibold text-gold/90 bg-gold/10 px-2 py-0.5 rounded-full border border-gold/20 flex items-center gap-1">
              <GlobeIcon />
              Ships Worldwide
            </span>
          </div>

          <form onSubmit={handleCheckDelivery} noValidate className="space-y-2.5">

            <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr_auto] gap-2">
              {/* Country Selector */}
              <div className="relative">
                <select
                  value={selectedCountry}
                  onChange={(e) => {
                    const nextCountry = e.target.value;
                    setSelectedCountry(nextCountry);
                    if (postalCode.trim().length >= 2) {
                      handleFetchEstimate(postalCode, nextCountry);
                    }
                  }}
                  className="w-full appearance-none rounded-xl border border-line bg-ink-2 px-3 py-2.5 text-xs text-paper focus:border-gold focus:outline-none transition-colors cursor-pointer pr-7"
                >
                  {POPULAR_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name} className="bg-ink text-paper">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Postal Code Input */}
              <div className="relative">
                <input
                  type="text"
                  maxLength={12}
                  value={postalCode}
                  onChange={(e) => {
                    setPostalCode(e.target.value);
                    if (deliveryError) setDeliveryError(null);
                  }}
                  placeholder={currentCountryConfig.placeholder}
                  className="w-full rounded-xl border border-line bg-ink-2 px-3.5 py-2.5 text-xs text-paper placeholder-paper-muted/50 focus:border-gold focus:outline-none tracking-wider font-mono transition-colors"
                />
              </div>

              {/* Check Button */}
              <button
                type="submit"
                disabled={isCheckingDelivery || postalCode.trim().length < 2}
                className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl border border-gold bg-gold/15 text-gold hover:bg-gold hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center justify-center gap-1.5"
              >
                {isCheckingDelivery ? (
                  <div className="w-3.5 h-3.5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Estimate"
                )}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {deliveryError && (
            <p className="text-xs text-red-400 font-medium animate-fadeIn">
              {deliveryError}
            </p>
          )}

          {/* Standard Delivery Estimate */}
          {deliveryResult && (
            <div className="space-y-3 pt-1 animate-fadeIn">
              <div className="flex items-center justify-between text-[11px] text-paper-muted">
                <span className="flex items-center gap-1">
                  <span className="text-paper font-medium">Destination:</span> {deliveryResult.country} ({deliveryResult.postalCode})
                </span>
                <span className="text-[10px] uppercase font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {deliveryResult.isDomestic ? "Domestic Express" : "International Express"}
                </span>
              </div>

              {/* Single Standard Delivery Card */}
              <div className="rounded-xl border border-gold/40 bg-gold/5 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-paper">
                      Standard Delivery
                    </p>
                    <p className="text-[11px] text-paper-muted mt-0.5">
                      Via {deliveryResult.standard.courierName || "Express Courier"}
                    </p>
                  </div>
                  <div className="text-right">
                    {product.price > 999 ? (
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-[11px] text-paper-muted line-through">
                          ₹{deliveryResult.standard.rate.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-emerald-400">FREE</span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-gold">
                        {deliveryResult.standard.rate > 0
                          ? `₹${deliveryResult.standard.rate.toLocaleString()}`
                          : "FREE"}
                      </span>
                    )}
                    <p className="text-[10px] text-paper-muted">
                      {product.price > 999
                        ? "Free on orders over ₹999"
                        : deliveryResult.standard.rate === 99
                        ? "Kolkata Local"
                        : deliveryResult.standard.rate === 199
                        ? "West Bengal"
                        : deliveryResult.isDomestic
                        ? "Rest of India"
                        : "Worldwide"}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-line/50 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="text-paper font-medium flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Estimated arrival: <strong className="text-gold font-semibold">{deliveryResult.standard.estimatedDate}</strong>
                  </span>
                  <span className="text-[10px] text-paper-muted">
                    ({deliveryResult.standard.estimatedDays} days) • {deliveryResult.isDomestic ? "COD Available" : "Tracking Included"}
                  </span>
                </div>
              </div>
            </div>
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

        {isOutOfStock ? (
          <div className="flex items-center gap-2 rounded-xl border border-red-600 bg-red-600 px-3.5 py-2.5 text-xs font-medium text-white shadow-sm">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            This variant is currently out of stock. Please select another size or color.
          </div>
        ) : isMaxInCart ? (
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-medium text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            You have added all available stock ({availableStock} unit{availableStock > 1 ? "s" : ""}) to your bag.
          </div>
        ) : availableStock <= 5 ? (
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-medium text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Hurry! Only {availableStock} left in stock.
          </div>
        ) : null}

        <div className="flex items-stretch gap-3">
          {isOutOfStock ? (
            <button
              type="button"
              disabled
              className="flex-1 rounded-full border border-red-600 bg-red-600 px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.2em] text-white cursor-not-allowed shadow-md opacity-90"
            >
              Out of Stock
            </button>
          ) : isMaxInCart ? (
            <button
              type="button"
              disabled
              className="flex-1 rounded-full border border-line bg-ink-2 px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.2em] text-paper-muted cursor-not-allowed opacity-70"
            >
              Max Stock in Bag
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 rounded-full border-2 border-gold bg-gold px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_14px_30px_-14px_rgba(74,14,26,0.6)] transition-all duration-300 ease-in-out hover:bg-transparent hover:text-gold hover:shadow-[0_18px_40px_-18px_rgba(74,14,26,0.45)]"
            >
              {added ? "Added to cart" : "Add to Cart"}
            </button>
          )}
          <button
            type="button"
            aria-pressed={saved}
            aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
            onClick={handleToggleWishlist}
            className={`inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border transition-all ${
              saved
                ? "border-transparent bg-[#DC2626]/10 text-[#DC2626]"
                : "border-line-strong text-paper hover:border-[#DC2626] hover:text-[#DC2626]"
            }`}
          >
            <HeartIcon filled={saved} width={18} height={18} />
          </button>
        </div>

        <div>
          <Accordion title="Description & Fit" defaultOpen>
            <div className="max-w-prose whitespace-pre-line leading-relaxed text-paper">
              {product.description}
            </div>
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
