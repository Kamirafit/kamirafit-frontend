"use client";

import { useState, useEffect, useCallback } from "react";
import type { Size } from "../types";
import { CloseIcon, StraightenIcon } from "./icons";

type Props = {
  options: Size[];
  value: Size | null;
  onChange: (size: Size) => void;
  error?: boolean;
  lowStockNote?: string | null;
  sizeStockMap?: Record<string, number>;
};

// Authoritative measurement references from KamiraFit's size standards
const SIZE_MEASUREMENTS = [
  { size: "XS", bust: "34 - 36", waist: "25 - 27", hip: "36 - 38" },
  { size: "S", bust: "36 - 38", waist: "27 - 29", hip: "38 - 40" },
  { size: "M", bust: "38 - 40", waist: "29 - 31", hip: "40 - 42" },
  { size: "L", bust: "40 - 42", waist: "31 - 33", hip: "42 - 44" },
  { size: "XL", bust: "42 - 45", waist: "33 - 36", hip: "44 - 47" },
  { size: "XXL", bust: "46 - 48", waist: "37 - 40", hip: "48 - 51" },
];

export default function SizeSelector({
  options,
  value,
  onChange,
  error,
  lowStockNote,
  sizeStockMap,
}: Props) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsGuideOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isGuideOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isGuideOpen, handleKeyDown]);

  if (!options || options.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Header Line */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <span className="font-sans text-xs uppercase tracking-wider text-primary font-bold">
            Sizing
          </span>
          {lowStockNote && (
            <span className="text-[11px] font-mono uppercase text-error font-medium px-2 py-0.5 rounded bg-error-container/40">
              {lowStockNote}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsGuideOpen(true)}
          className="text-xs font-sans uppercase tracking-wider text-primary-container hover:text-primary underline flex items-center gap-1 cursor-pointer transition-colors"
        >
          <StraightenIcon width={14} height={14} />
          Fit guide
        </button>
      </div>

      {/* Sizing Grid */}
      <div
        role="radiogroup"
        aria-label="Size selection"
        className="grid grid-cols-5 sm:grid-cols-6 gap-2"
      >
        {options.map((opt) => {
          const selected = value === opt;
          const stock = sizeStockMap ? sizeStockMap[opt] : undefined;
          const isSizeOut = typeof stock === "number" && stock <= 0;

          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={isSizeOut}
              onClick={() => onChange(opt)}
              className={`py-2.5 rounded-lg font-sans text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center font-medium ${
                isSizeOut
                  ? "bg-surface-container/50 text-outline line-through cursor-not-allowed opacity-50"
                  : selected
                  ? "bg-primary-container text-white font-bold shadow-sm"
                  : "bg-surface-container text-on-surface hover:bg-surface-container-high"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-xs text-error font-medium" role="alert">
          Please select a size to proceed.
        </p>
      )}

      {/* Stitch Fit Guide Modal */}
      {isGuideOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="fit-guide-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsGuideOpen(false)}
        >
          <div
            className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-6 shadow-xl flex flex-col gap-4 border border-outline-variant/30 text-on-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h3
                id="fit-guide-title"
                className="font-serif text-xl sm:text-2xl text-primary font-medium"
              >
                Fit Guide
              </h3>
              <button
                type="button"
                aria-label="Close fit guide"
                onClick={() => setIsGuideOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <CloseIcon width={16} height={16} />
              </button>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Measurements reflect garment dimensions in inches. Designed for an intentional, comfortable drape.
            </p>

            <div className="overflow-x-auto rounded-lg border border-outline-variant/30">
              <table className="w-full text-left font-sans text-xs sm:text-sm">
                <thead>
                  <tr className="bg-surface-container font-sans text-[11px] uppercase tracking-wider text-primary">
                    <th className="p-2.5 rounded-l">Size</th>
                    <th className="p-2.5">Bust / Chest (In)</th>
                    <th className="p-2.5">Waist / Torso (In)</th>
                    <th className="p-2.5 rounded-r">Hip (In)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {SIZE_MEASUREMENTS.map((row) => {
                    const isRowSelected = value === row.size;
                    return (
                      <tr
                        key={row.size}
                        className={
                          isRowSelected
                            ? "bg-surface-container-low font-semibold text-primary"
                            : "text-on-surface"
                        }
                      >
                        <td className="p-2.5 font-bold text-primary">
                          {row.size}
                          {isRowSelected && (
                            <span className="ml-1 text-[10px] text-primary-container font-normal">
                              (Selected)
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-on-surface-variant">{row.bust}</td>
                        <td className="p-2.5 text-on-surface-variant">{row.waist}</td>
                        <td className="p-2.5 text-on-surface-variant">{row.hip}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={() => setIsGuideOpen(false)}
              className="mt-2 py-3 w-full rounded-full bg-primary-container text-white font-sans text-xs uppercase tracking-wider hover:bg-primary transition-colors cursor-pointer shadow-sm"
            >
              Dismiss Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
