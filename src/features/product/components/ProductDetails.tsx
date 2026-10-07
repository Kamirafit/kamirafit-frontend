"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { addToCart } from "../store/cartSlice";
import { useOptimisticWishlist } from "@/services/wishlist";
import { orderService, type DeliveryEstimateResult } from "@/services/order";
import { calculateDeliveryCharge, isIndiaDestination, validatePostalCode } from "@/lib/delivery";
import type { Color, Product, Size } from "../types";
import ColorSelector from "./ColorSelector";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  GlobeEarthIcon,
  HeartIcon,
  LocationDotIcon,
  PaymentTagIcon,
  RefreshReturnIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  StarIcon,
  TruckDeliveryIcon,
} from "./icons";
import ProductGallery from "./ProductGallery";
import SizeSelector from "./SizeSelector";

type Props = {
  product: Product;
};

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
  const searchParams = useSearchParams();
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
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1);

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
    const validation = validatePostalCode(clean, countryToUse);
    if (!validation.isValid) {
      setDeliveryError(validation.error || "Please enter a valid postal or PIN code.");
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
      const isDomestic = isIndiaDestination(countryToUse);
      if (!isDomestic) {
        setDeliveryResult({
          ...res,
          isDomestic: false,
          standard: {
            ...res.standard,
            rate: 2499,
            isFree: false,
            courierName: "DHL Express / Aramex Worldwide",
            description: "Worldwide International Express",
          },
        });
      } else {
        setDeliveryResult(res);
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("kamirafit_postal_code", clean);
        localStorage.setItem("kamirafit_country", countryToUse);
      }
    } catch {
      // Resilient client-side fallback using tiered calculation
      const fallback = calculateDeliveryCharge(clean, countryToUse);
      const targetDate = new Date();
      let addedDays = 0;
      while (addedDays < fallback.estimatedDays) {
        targetDate.setDate(targetDate.getDate() + 1);
        if (targetDate.getDay() !== 0) addedDays++;
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
      const savedCountry = localStorage.getItem("kamirafit_country") || "India";
      const savedPin =
        localStorage.getItem("kamirafit_postal_code") ||
        localStorage.getItem("kamirafit_pincode") ||
        (savedCountry === "India" ? "560038" : "");

      setSelectedCountry(savedCountry);

      if (savedPin) {
        const validation = validatePostalCode(savedPin, savedCountry);
        if (validation.isValid) {
          setPostalCode(savedPin);
          handleFetchEstimate(savedPin, savedCountry);
        } else {
          setPostalCode("");
        }
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

  // Size to stock map for variant availability
  const sizeStockMap = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return undefined;
    const map: Record<string, number> = {};
    for (const v of product.variants) {
      if (selectedColor && v.color !== selectedColor) continue;
      map[v.size] = (map[v.size] ?? 0) + (v.stock ?? 0);
    }
    return map;
  }, [product.variants, selectedColor]);

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
      })
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  const handleToggleWishlist = () => {
    toggleWishlistOptimistic(product.id);
  };

  const activeMrp =
    typeof selectedVariant?.mrp === "number" && selectedVariant.mrp > 0
      ? selectedVariant.mrp
      : typeof product.mrp === "number"
      ? product.mrp
      : typeof product.baseMrp === "number"
      ? product.baseMrp
      : 0;

  const activePrice =
    typeof selectedVariant?.price === "number" && selectedVariant.price > 0
      ? selectedVariant.price
      : typeof product.price === "number"
      ? product.price
      : 0;

  const hasDiscount = activeMrp > 0 && activePrice > 0 && activeMrp > activePrice;
  const discountPercent = hasDiscount ? Math.round(((activeMrp - activePrice) / activeMrp) * 100) : 0;

  const lowStockNote =
    !isOutOfStock && availableStock > 0 && availableStock <= 5 && selectedSize
      ? `Only ${availableStock} left in ${selectedSize}`
      : null;

  return (
    <div className="flex flex-col gap-12 lg:gap-16">
      {/* ---------------- MAIN PRODUCT DISPLAY (7/12 Gallery + 5/12 Info) ---------------- */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 relative items-start">
        {/* Left: Product Gallery (7 cols) - Remains fixed/sticky until tabs section is reached */}
        <div className="lg:col-span-7 xl:col-span-7 lg:sticky lg:top-24 self-start">
          <ProductGallery
            images={colorImages}
            alt={product.name}
          />
        </div>

        {/* Right: Product Purchase & Info Tray (5 cols) */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-6 lg:pl-2">
          {/* Title & Ratings */}
          <div className="flex flex-col gap-2">
            <span className="font-sans text-[11px] uppercase tracking-[0.18em] text-on-surface-variant font-semibold">
              {product.category || "KamiraFit Atelier"}
            </span>

            <h1 className="font-serif text-3xl sm:text-4xl text-primary tracking-tight font-medium leading-[1.15]">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 pt-0.5">
              <div className="flex items-center text-primary-container" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    width={18}
                    height={18}
                    filled={star <= Math.round(product.rating)}
                    className="text-primary-container"
                  />
                ))}
              </div>
              <span className="font-sans text-xs text-primary font-bold">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-on-surface-variant text-xs font-sans">
                ({product.reviews.length} verified review{product.reviews.length === 1 ? "" : "s"})
              </span>
            </div>
          </div>

          {/* Pricing Surface Card */}
          <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-1.5 shadow-sm">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-serif text-2xl sm:text-3xl text-primary font-semibold">
                {formatPrice(activePrice > 0 ? activePrice : activeMrp)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-sm sm:text-base font-sans text-outline line-through">
                    {formatPrice(activeMrp)}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-sans text-xs font-bold tracking-tight">
                    {discountPercent}% Discount
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs font-sans text-on-surface-variant">
              <span>Inclusive of all duties & GST</span>
              <span className="w-1 h-1 rounded-full bg-outline" />
              <span>Complimentary shipping above ₹999 in India</span>
            </div>
          </div>

          {/* Color Swatches */}
          <ColorSelector
            options={product.color}
            value={selectedColor}
            onChange={setSelectedColor}
          />

          {/* Size Selector with Fit Guide */}
          <SizeSelector
            options={product.size}
            value={selectedSize}
            onChange={(s) => {
              setSelectedSize(s);
              setSizeError(false);
            }}
            error={sizeError}
            lowStockNote={lowStockNote}
            sizeStockMap={sizeStockMap}
          />

          {/* Inventory Feedback Warnings */}
          {isOutOfStock ? (
            <div className="flex items-center gap-2 rounded-xl border border-red-600/30 bg-red-600/10 px-3.5 py-2.5 text-xs font-medium text-red-600">
              <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
              This variant is currently out of stock. Please select another size or color.
            </div>
          ) : isMaxInCart ? (
            <div className="flex items-center gap-2 rounded-xl border border-secondary/30 bg-secondary-fixed/50 px-3.5 py-2 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              You have added all available stock ({availableStock} unit{availableStock > 1 ? "s" : ""}) to your bag.
            </div>
          ) : null}

          {/* CTA & Wishlist Buttons */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              disabled={isOutOfStock || isMaxInCart}
              onClick={handleAddToCart}
              className={`flex-1 py-4 px-6 rounded-full text-white font-sans text-xs uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.99] cursor-pointer ${
                isOutOfStock
                  ? "bg-surface-container text-outline cursor-not-allowed shadow-none"
                  : isMaxInCart
                  ? "bg-surface-container text-outline cursor-not-allowed shadow-none"
                  : added
                  ? "bg-primary shadow-lg"
                  : "bg-primary-container hover:bg-primary hover:shadow-lg"
              }`}
            >
              {added ? (
                <>
                  <CheckCircleIcon width={18} height={18} />
                  <span>Added to Shopping Bag</span>
                </>
              ) : isOutOfStock ? (
                <span>Sold Out</span>
              ) : isMaxInCart ? (
                <span>Max Stock In Bag</span>
              ) : (
                <>
                  <ShoppingBagIcon width={18} height={18} />
                  <span>
                    Add to Shopping Bag • {formatPrice(activePrice > 0 ? activePrice : activeMrp)}
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              aria-label={saved ? "Remove from Wishlist" : "Save to Wishlist"}
              aria-pressed={saved}
              onClick={handleToggleWishlist}
              className={`w-[52px] h-[52px] shrink-0 rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-sm ${
                saved
                  ? "bg-primary-container text-white"
                  : "bg-surface-container hover:bg-surface-container-high text-primary"
              }`}
            >
              <HeartIcon filled={saved} width={22} height={22} />
            </button>
          </div>

          {/* Stitch Delivery Estimator Card */}
          <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-low/70 p-5 flex flex-col gap-4 text-on-surface shadow-sm mt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-primary font-sans text-xs uppercase tracking-wider font-semibold">
                <LocationDotIcon width={16} height={16} className="text-outline" />
                <span>Delivery Estimator</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-outline-variant/40 bg-surface-container/60 text-on-surface-variant font-sans text-[11px]">
                <GlobeEarthIcon width={14} height={14} />
                <span>Ships Worldwide</span>
              </div>
            </div>

            <form onSubmit={handleCheckDelivery} noValidate className="grid grid-cols-12 gap-2.5 items-center">
              {/* Country Select */}
              <div className="col-span-5 relative flex items-center bg-surface-container-lowest/80 border border-outline-variant/30 rounded-xl px-3 py-2.5">
                <select
                  value={selectedCountry}
                  onChange={(e) => {
                    const nextCountry = e.target.value;
                    setSelectedCountry(nextCountry);
                    setDeliveryError(null);
                    setDeliveryResult(null);
                    if (postalCode.trim().length > 0) {
                      const validation = validatePostalCode(postalCode, nextCountry);
                      if (validation.isValid) {
                        handleFetchEstimate(postalCode, nextCountry);
                      } else {
                        setPostalCode("");
                      }
                    }
                  }}
                  className="w-full bg-transparent no-custom-chevron !bg-none text-xs font-medium text-primary focus:outline-none appearance-none [-webkit-appearance:none] [-moz-appearance:none] cursor-pointer pr-8"
                  style={{ backgroundImage: "none", WebkitAppearance: "none", MozAppearance: "none", appearance: "none" }}
                >
                  {POPULAR_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name} className="bg-surface text-primary">
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-outline flex items-center">
                  <ChevronDownIcon width={14} height={14} />
                </div>
              </div>

              {/* Pincode Input */}
              <div className="col-span-4 bg-surface-container-lowest/80 border border-outline-variant/30 rounded-xl px-3 py-2.5 flex items-center">
                <input
                  type="text"
                  maxLength={12}
                  value={postalCode}
                  onChange={(e) => {
                    setPostalCode(e.target.value);
                    if (deliveryError) setDeliveryError(null);
                  }}
                  placeholder={currentCountryConfig.placeholder}
                  className="w-full bg-transparent text-xs font-medium text-primary focus:outline-none placeholder:text-outline font-mono tracking-wider"
                />
              </div>

              {/* Estimate Button */}
              <button
                type="submit"
                disabled={isCheckingDelivery || !postalCode.trim()}
                className="col-span-3 h-full py-2.5 px-2 bg-secondary-fixed/50 hover:bg-secondary-fixed text-primary font-sans uppercase tracking-wider text-[11px] font-bold rounded-xl border border-outline-variant/50 transition-colors text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isCheckingDelivery ? (
                  <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Estimate"
                )}
              </button>
            </form>

            {deliveryError && (
              <p className="text-xs text-error font-medium">{deliveryError}</p>
            )}

            {deliveryResult && (
              <div className="space-y-3 pt-0.5">
                <div className="text-xs text-on-surface-variant">
                  Destination:{" "}
                  <span className="text-primary font-medium">
                    {deliveryResult.country} ({deliveryResult.postalCode})
                  </span>
                </div>

                <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4 flex flex-col gap-3 shadow-sm">
                  <div className="flex items-start justify-between">
                    <span className="font-serif text-sm sm:text-base text-primary font-medium">
                      Standard Delivery
                    </span>
                    <div className="flex flex-col items-end">
                      {!deliveryResult.isDomestic ? (
                        <>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-primary uppercase tracking-wider">
                              ₹2,499
                            </span>
                          </div>
                          <span className="text-[11px] text-on-surface-variant">
                            Flat international delivery
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5">
                            {activePrice >= 999 && (
                              <span className="text-xs text-outline line-through">
                                ₹{deliveryResult.standard.rate > 0 ? deliveryResult.standard.rate : 299}
                              </span>
                            )}
                            <span className="font-bold text-xs text-[#0f6b4d] uppercase tracking-wider">
                              {activePrice >= 999 ? "Free" : `₹${deliveryResult.standard.rate}`}
                            </span>
                          </div>
                          <span className="text-[11px] text-on-surface-variant">
                            {activePrice >= 999
                              ? "Free on orders over ₹999"
                              : "Standard domestic delivery"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-outline-variant/20 pt-2.5 flex items-center justify-between text-xs flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#10b981] inline-block" />
                      <span className="text-on-surface-variant">
                        Estimated arrival:{" "}
                        <strong className="text-primary font-semibold">
                          {deliveryResult.standard.estimatedDate}
                        </strong>
                      </span>
                    </div>
                    <span className="text-[11px] text-outline">
                      ({deliveryResult.standard.estimatedDays} days) •{" "}
                      {deliveryResult.isDomestic ? "COD Available" : "Air Tracked"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------------- EDITORIAL PRODUCT INFORMATION TABS ---------------- */}
      <section className="w-full border-t border-outline-variant/30 pt-8 pb-4">
        {/* Full-width 3 Tab Switchers (No dead spaces on left/right, taking entire width equally) */}
        <div className="w-full border-b border-outline-variant/40 mb-8">
          <div className="grid grid-cols-3 w-full font-sans text-xs sm:text-sm uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setActiveTab(1)}
              className={`w-full text-center py-4 transition-all cursor-pointer ${
                activeTab === 1
                  ? "font-bold text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-primary border-b-2 border-transparent"
              }`}
            >
              Description & Fit
            </button>
            <button
              type="button"
              onClick={() => setActiveTab(2)}
              className={`w-full text-center py-4 transition-all cursor-pointer ${
                activeTab === 2
                  ? "font-bold text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-primary border-b-2 border-transparent"
              }`}
            >
              Shipping & Returns
            </button>
            <button
              type="button"
              onClick={() => setActiveTab(3)}
              className={`w-full text-center py-4 transition-all cursor-pointer ${
                activeTab === 3
                  ? "font-bold text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-primary border-b-2 border-transparent"
              }`}
            >
              Product Details
            </button>
          </div>
        </div>

        {/* Tab 1: Description & Fit - Full width, Left aligned */}
        {activeTab === 1 && (
          <div className="w-full flex flex-col gap-6 animate-fadeIn text-left">
            <div className="w-full text-left text-xs sm:text-sm font-sans text-on-surface-variant leading-relaxed whitespace-pre-line">
              {product.description || (
                "Handcrafted with precision tailoring and architectural silhouettes. Loomed from premium fibers that soften with every wear while maintaining crisp structured drape."
              )}
            </div>
            <div className="flex flex-wrap items-center gap-6 pt-3 text-[11px] font-sans text-on-surface-variant uppercase tracking-widest border-t border-outline-variant/20">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                Tailored Fit
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                Breathable Comfort
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                Artisanal Finish
              </span>
            </div>
          </div>
        )}

        {/* Tab 2: Shipping & Returns (4 Editorial Cards - Full Width) */}
        {activeTab === 2 && (
          <div className="w-full animate-fadeIn">
            <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                <span className="font-serif text-lg sm:text-xl text-primary font-medium">
                  Shipping & Returns Policy
                </span>
                <TruckDeliveryIcon width={20} height={20} className="text-primary" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {/* 1. Free Shipping */}
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-surface-container-low">
                  <div className="w-10 h-10 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-primary shrink-0 mb-1">
                    <TruckDeliveryIcon width={20} height={20} />
                  </div>
                  <span className="font-serif text-sm sm:text-base font-medium text-primary">
                    Free Shipping
                  </span>
                  <span className="font-sans text-xs text-on-surface-variant leading-relaxed">
                    Complimentary express delivery on all orders over ₹999 across India.
                  </span>
                </div>

                {/* 2. Easy Returns */}
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-surface-container-low">
                  <div className="w-10 h-10 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-primary shrink-0 mb-1">
                    <RefreshReturnIcon width={20} height={20} />
                  </div>
                  <span className="font-serif text-sm sm:text-base font-medium text-primary">
                    Easy Returns
                  </span>
                  <span className="font-sans text-xs text-on-surface-variant leading-relaxed">
                    Hassle-free 7-day pickup and size exchange window from delivery.
                  </span>
                </div>

                {/* 3. Secure Payment */}
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-surface-container-low">
                  <div className="w-10 h-10 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-primary shrink-0 mb-1">
                    <PaymentTagIcon width={20} height={20} />
                  </div>
                  <span className="font-serif text-sm sm:text-base font-medium text-primary">
                    Secure Payment
                  </span>
                  <span className="font-sans text-xs text-on-surface-variant leading-relaxed">
                    All major credit cards, UPI, net banking, and COD options supported.
                  </span>
                </div>

                {/* 4. Quality Guarantee */}
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-surface-container-low">
                  <div className="w-10 h-10 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-primary shrink-0 mb-1">
                    <ShieldCheckIcon width={20} height={20} />
                  </div>
                  <span className="font-serif text-sm sm:text-base font-medium text-primary">
                    Quality Guarantee
                  </span>
                  <span className="font-sans text-xs text-on-surface-variant leading-relaxed">
                    Individually inspected and pre-conditioned before dispatch.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Product Specifications (Full Width) */}
        {activeTab === 3 && (
          <div className="w-full animate-fadeIn">
            <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                <span className="font-serif text-lg sm:text-xl text-primary font-medium">
                  Product Specifications
                </span>
                <span className="font-sans text-xs uppercase tracking-wider text-outline">
                  Authentic Edition
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-sans">
                <div className="flex flex-col gap-1 p-4 rounded-xl bg-surface-container-low">
                  <span className="font-bold text-primary uppercase tracking-wider text-[11px]">
                    SKU
                  </span>
                  <span className="text-on-surface-variant font-mono text-xs break-all">
                    {selectedVariant?.sku || `KF-${product.id.slice(0, 8).toUpperCase()}`}
                  </span>
                </div>

                <div className="flex flex-col gap-1 p-4 rounded-xl bg-surface-container-low">
                  <span className="font-bold text-primary uppercase tracking-wider text-[11px]">
                    Category
                  </span>
                  <span className="text-on-surface-variant text-xs">
                    {product.category || "Apparel"}
                  </span>
                </div>

                <div className="flex flex-col gap-1 p-4 rounded-xl bg-surface-container-low">
                  <span className="font-bold text-primary uppercase tracking-wider text-[11px]">
                    Available Sizes
                  </span>
                  <span className="text-on-surface-variant text-xs">
                    {product.size.join(", ")}
                  </span>
                </div>

                <div className="flex flex-col gap-1 p-4 rounded-xl bg-surface-container-low">
                  <span className="font-bold text-primary uppercase tracking-wider text-[11px]">
                    Care Instructions
                  </span>
                  <span className="text-on-surface-variant text-xs">
                    Gentle wash cold; line dry in shade
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
