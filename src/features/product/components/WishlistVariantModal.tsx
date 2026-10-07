"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { DEFAULT_PRODUCT_IMAGE, formatPrice, getValidImageSrc } from "@/lib/format";
import { useColorSwatchMap } from "@/services/product";
import { COLOR_SWATCH, type Product, type Size, type Color } from "../types";
import { CloseIcon, ShoppingBagIcon, CheckIcon } from "./icons";

type Props = {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (product: Product, size: Size, color: Color) => void;
};

export default function WishlistVariantModal({
  product,
  isOpen,
  onClose,
  onConfirm,
}: Props) {
  const swatchMap = useColorSwatchMap();

  const availableColors = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.color) && product.color.length > 0) {
      return product.color;
    }
    const fromVariants = (product.variants || [])
      .map((v) => v.color)
      .filter((c): c is string => Boolean(c && c.trim()));
    return Array.from(new Set(fromVariants));
  }, [product]);

  const availableSizes = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.size) && product.size.length > 0) {
      return product.size;
    }
    const fromVariants = (product.variants || [])
      .map((v) => v.size)
      .filter((s): s is string => Boolean(s && s.trim()));
    return Array.from(new Set(fromVariants));
  }, [product]);

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  useEffect(() => {
    if (product) {
      setSelectedColor(availableColors[0] || "");
      setSelectedSize(availableSizes[0] || "M");
    }
  }, [product, availableColors, availableSizes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const mrp = typeof product.mrp === "number" ? product.mrp : typeof product.baseMrp === "number" ? product.baseMrp : 0;
  const price = typeof product.price === "number" ? product.price : 0;
  const hasDiscount = mrp > 0 && price > 0 && mrp > price;

  const displayImage = (() => {
    if (selectedColor && product.imageColorMap && product.images) {
      const match = product.images.find(
        (src) => product.imageColorMap?.[src]?.trim().toLowerCase() === selectedColor.trim().toLowerCase()
      );
      if (match) return getValidImageSrc(match, DEFAULT_PRODUCT_IMAGE);
    }
    return getValidImageSrc(product.image, DEFAULT_PRODUCT_IMAGE);
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSize) return;
    onConfirm(product, selectedSize as Size, (selectedColor || availableColors[0] || "Default") as Color);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="variant-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={onClose}
        className="fixed inset-0"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 pb-4 border-b border-outline-variant/20 flex items-center justify-between">
          <div>
            <span className="font-sans text-[11px] uppercase tracking-widest text-surface-tint font-semibold block">
              Curated Selection
            </span>
            <h2 id="variant-modal-title" className="font-serif text-lg text-primary font-medium mt-0.5 line-clamp-1">
              Select Size &amp; Hue
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-primary flex items-center justify-center transition-colors cursor-pointer"
          >
            <CloseIcon width={14} height={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Product Snippet */}
          <div className="flex gap-4 items-center">
            <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
              <Image
                src={displayImage}
                alt={product.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-serif text-sm font-medium text-primary truncate">
                {product.name}
              </h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-serif text-base font-semibold text-primary">
                  {formatPrice(price > 0 ? price : mrp)}
                </span>
                {hasDiscount && (
                  <span className="font-sans text-xs text-outline line-through">
                    {formatPrice(mrp)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Color Selection if available */}
          {availableColors.length > 0 && (
            <div>
              <label className="block font-sans text-xs uppercase tracking-wider text-secondary font-semibold mb-2">
                Hue: <span className="text-primary font-normal">{selectedColor || "Select"}</span>
              </label>
              <div className="flex items-center gap-2.5 flex-wrap">
                {availableColors.map((c) => {
                  const isSelected = selectedColor.toLowerCase() === c.toLowerCase();
                  return (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Select color ${c}`}
                      onClick={() => setSelectedColor(c)}
                      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary-container bg-secondary-container/20 text-primary font-medium shadow-xs"
                          : "border-outline-variant/50 bg-surface-container-lowest text-on-surface-variant hover:border-primary"
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/10 inline-block"
                        style={{ backgroundColor: swatchMap[c] || COLOR_SWATCH[c] || "#888888" }}
                      />
                      <span>{c}</span>
                      {isSelected && <CheckIcon width={12} height={12} className="text-primary-container" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {availableSizes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-sans text-xs uppercase tracking-wider text-secondary font-semibold">
                  Size: <span className="text-primary font-normal">{selectedSize}</span>
                </label>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {availableSizes.map((sz) => {
                  const isSelected = selectedSize.toLowerCase() === sz.toLowerCase();
                  return (
                    <button
                      key={sz}
                      type="button"
                      aria-label={`Select size ${sz}`}
                      onClick={() => setSelectedSize(sz)}
                      className={`py-2 rounded-xl text-xs font-sans font-medium transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary-container text-white shadow-sm"
                          : "bg-surface-container text-primary hover:bg-surface-container-high"
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-full bg-primary-container text-white hover:bg-primary font-sans text-xs uppercase tracking-[0.06em] font-medium transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
            >
              <ShoppingBagIcon width={16} height={16} />
              <span>Confirm &amp; Move to Bag</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
