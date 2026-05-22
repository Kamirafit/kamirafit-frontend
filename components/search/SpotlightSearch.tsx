"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { PRODUCTS } from "@/features/product/data/products";
import type { Product } from "@/features/product/types";
import { useSpotlight } from "./SpotlightProvider";
import SearchInput from "./SearchInput";
import SearchSuggestions from "./SearchSuggestions";

const MAX_RESULTS = 8;

function searchProducts(catalog: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (q === "") return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  return catalog
    .filter((p) => p.status === "active")
    .filter((p) => {
      const haystack = [p.name, p.category, ...p.color, ...p.size]
        .join(" ")
        .toLowerCase();
      return tokens.every((t) => haystack.includes(t));
    })
    .slice(0, MAX_RESULTS);
}

export default function SpotlightSearch() {
  const { open, setOpen } = useSpotlight();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Mount/active pattern so we get both enter and exit animations
  const [shouldRender, setShouldRender] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const results = useMemo(() => searchProducts(PRODUCTS, query), [query]);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      const id = requestAnimationFrame(() => setIsActive(true));
      return () => cancelAnimationFrame(id);
    }
    setIsActive(false);
    const id = setTimeout(() => setShouldRender(false), 200);
    return () => clearTimeout(id);
  }, [open]);

  // Reset query + selection each time spotlight opens, and focus the input
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setSelectedIndex(0);
    const id = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(id);
  }, [open]);

  // Clamp selected index whenever results change
  useEffect(() => {
    if (selectedIndex > results.length - 1) {
      setSelectedIndex(results.length === 0 ? 0 : results.length - 1);
    }
  }, [results.length, selectedIndex]);

  // Lock body scroll while spotlight is open
  useEffect(() => {
    if (!shouldRender) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [shouldRender]);

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((i) => (i + 1) % results.length);
      }
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((i) => (i - 1 + results.length) % results.length);
      }
      return;
    }
    if (e.key === "Enter") {
      const product = results[selectedIndex];
      if (product) {
        e.preventDefault();
        setOpen(false);
        router.push(`/product/${product.id}`);
      }
    }
  }

  if (!shouldRender) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      className={`fixed inset-0 z-[100] transition-opacity duration-200 ease-out ${
        isActive ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop — click to close */}
      <button
        type="button"
        aria-label="Close search"
        onClick={() => setOpen(false)}
        className="absolute inset-0 h-full w-full bg-black/45 backdrop-blur-md"
      />

      {/* Panel */}
      <div className="pointer-events-none absolute inset-0 flex items-start justify-center px-4 pt-[12vh] sm:pt-[18vh]">
        <div
          className={`pointer-events-auto w-full max-w-[640px] origin-top overflow-hidden rounded-2xl border border-line bg-ink shadow-[0_40px_120px_-40px_rgba(0,0,0,0.55)] transition-all duration-200 ease-out ${
            isActive ? "scale-100 opacity-100" : "scale-[0.97] opacity-0"
          }`}
        >
          <div className="p-3 sm:p-4">
            <SearchInput
              ref={inputRef}
              value={query}
              onChange={setQuery}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="border-t border-line">
            <SearchSuggestions
              query={query}
              results={results}
              selectedIndex={selectedIndex}
              onHover={setSelectedIndex}
              onSelect={() => setOpen(false)}
            />
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-line bg-ink-2/60 px-4 py-2.5 text-[11px] text-paper-muted">
            <div className="flex items-center gap-3">
              <KbdHint label="↑↓" text="navigate" />
              <KbdHint label="↵" text="select" />
              <KbdHint label="Esc" text="close" />
            </div>
            <span className="hidden uppercase tracking-[0.22em] text-gold sm:inline">
              KamiraFit
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function KbdHint({ label, text }: { label: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <kbd className="inline-flex min-w-[22px] items-center justify-center rounded border border-line bg-ink px-1.5 py-0.5 text-[10px] font-medium text-paper">
        {label}
      </kbd>
      <span>{text}</span>
    </span>
  );
}
