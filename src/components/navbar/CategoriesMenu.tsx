"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { useCategories } from "@/services/category";

export type MegaMenuColumn = {
  title: string;
  items: { label: string; href: string }[];
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      width="10"
      height="10"
      viewBox="0 0 12 12"
      className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M2 4l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function useDynamicCategoryColumns(): MegaMenuColumn[] {
  const { data: serverCategories } = useCategories();

  return useMemo(() => {
    if (serverCategories && Array.isArray(serverCategories)) {
      return serverCategories
        .filter((cat) => Boolean(cat && cat.name))
        .map((cat) => {
          const subItems = (cat.subcategories || [])
            .map((sub) => {
              const label = typeof sub === "string" ? sub : sub.name || sub.title || "";
              const slug =
                typeof sub === "string"
                  ? sub.toLowerCase().replace(/[\s_]+/g, "-")
                  : sub.slug || (sub.name || "").toLowerCase().replace(/[\s_]+/g, "-");
              return {
                label,
                href: `/shop?category=${encodeURIComponent(slug)}`,
              };
            })
            .filter((item) => Boolean(item.label));

          return {
            title: cat.name,
            items: subItems,
          };
        });
    }
    return [];
  }, [serverCategories]);
}

/**
 * Desktop-only mega menu: trigger + hover-opened multi-column panel.
 * Dynamically populated strictly from backend categories & subcategories.
 */
export function DesktopCategoriesMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const columns = useDynamicCategoryColumns();

  useEffect(() => {
    const handleOutsideAction = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideAction);
    document.addEventListener("touchstart", handleOutsideAction);
    return () => {
      document.removeEventListener("click", handleOutsideAction);
      document.removeEventListener("touchstart", handleOutsideAction);
    };
  }, []);

  if (columns.length === 0) {
    return (
      <Link
        href="/shop"
        className="relative inline-flex items-center text-[12px] font-medium uppercase tracking-[0.22em] text-paper transition-colors hover:text-gold"
      >
        Categories
      </Link>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative inline-flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.22em] text-paper transition-colors hover:text-gold"
      >
        Categories
        <span className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
          <Chevron open={isOpen} />
        </span>
        <span
          aria-hidden
          className={`pointer-events-none absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300 ${
            isOpen ? "w-full" : "w-0"
          }`}
        />
      </button>

      <div
        role="menu"
        aria-label="Categories"
        className={`absolute left-1/2 top-full z-50 w-[min(960px,92vw)] -translate-x-1/2 pt-2 transition-all duration-300 ease-in-out ${
          isOpen ? "pointer-events-auto opacity-100 visible translate-y-0" : "pointer-events-none opacity-0 invisible translate-y-2"
        }`}
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink/60 text-paper shadow-[0_8px_32px_-12px_rgba(0,0,0,0.35)] backdrop-blur-xl supports-[backdrop-filter]:bg-ink/45">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
          />
          <div className="grid grid-cols-1 gap-x-8 gap-y-7 p-8 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title} className="flex flex-col">
                <Link
                  href={`/shop?category=${encodeURIComponent(col.title.toLowerCase().replace(/[\s_]+/g, "-"))}`}
                  onClick={() => setIsOpen(false)}
                  className="font-display text-[15px] font-bold tracking-tight text-paper transition-colors hover:text-gold"
                >
                  {col.title}
                </Link>
                <span
                  aria-hidden
                  className="mt-2 h-px w-8 bg-gold/70"
                />
                {col.items.length > 0 && (
                  <ul className="mt-3.5 flex flex-col gap-2">
                    {col.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="block text-[13.5px] text-paper-muted transition-colors duration-200 hover:text-gold"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-white/10 bg-white/5 px-8 py-4 backdrop-blur-xl">
            <p className="text-[12px] text-paper-muted">
              Free shipping on orders over ₹2,000
            </p>
            <Link
              href="/shop"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold transition-colors duration-300 hover:text-gold-bright"
            >
              Shop all
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Mobile-only expandable categories block.
 */
export function MobileCategoriesMenu({
  onItemClick,
}: {
  onItemClick?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const columns = useDynamicCategoryColumns();

  if (columns.length === 0) {
    return (
      <Link
        href="/shop"
        onClick={onItemClick}
        className="block px-3 py-2.5 text-sm font-medium uppercase tracking-[0.2em] text-paper transition-colors hover:bg-ink-3 hover:text-gold"
      >
        Categories
      </Link>
    );
  }

  return (
    <div className="flex flex-col">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium uppercase tracking-[0.2em] text-paper transition-colors hover:bg-ink-3 hover:text-gold"
      >
        Categories
        <Chevron open={open} />
      </button>

      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          open
            ? "mt-1 grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0">
          <div className="mb-2 space-y-5 rounded-xl border border-white/10 bg-ink/60 px-4 py-4 backdrop-blur-xl supports-[backdrop-filter]:bg-ink/45">
            {columns.map((col) => (
              <div key={col.title}>
                <Link
                  href={`/shop?category=${encodeURIComponent(col.title.toLowerCase().replace(/[\s_]+/g, "-"))}`}
                  onClick={onItemClick}
                  className="font-display text-[13px] font-bold tracking-tight text-paper block transition-colors hover:text-gold"
                >
                  {col.title}
                </Link>
                <span
                  aria-hidden
                  className="mt-1.5 block h-px w-6 bg-gold/70"
                />
                {col.items.length > 0 && (
                  <ul className="mt-2.5 flex flex-col gap-1.5">
                    {col.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          onClick={onItemClick}
                          className="block py-1 text-[13.5px] text-paper-muted transition-colors duration-200 hover:text-gold"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
