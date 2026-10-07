"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { useCategories } from "@/services/category";
import { CATEGORY_COLUMNS, type MegaMenuColumn } from "./categories-data";

export { CATEGORY_COLUMNS };
export type { MegaMenuColumn };

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
  const { data: serverCategories, isLoading } = useCategories();

  return useMemo(() => {
    if (serverCategories && Array.isArray(serverCategories)) {
      const dynamicCols: MegaMenuColumn[] = serverCategories
        .filter((cat) => Boolean(cat && cat.name))
        .map((cat) => {
          const catSlug = cat.slug || cat.name.toLowerCase().replace(/[\s_]+/g, "-");
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

          // If no subcategories exist for this category, provide a direct link item to the category itself
          const items =
            subItems.length > 0
              ? subItems
              : [{ label: `All ${cat.name}`, href: `/shop?category=${encodeURIComponent(catSlug)}` }];

          return {
            title: cat.name,
            items,
          };
        })
        .filter((col) => col.items.length > 0);

      return dynamicCols;
    }

    if (isLoading) {
      return [];
    }

    return [];
  }, [serverCategories, isLoading]);
}

/**
 * Desktop-only mega menu: trigger + hover-opened multi-column panel.
 * Combines pure CSS group-hover for instant, flicker-free desktop hover
 * with React state for click/touch accessibility.
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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideAction);
    document.addEventListener("touchstart", handleOutsideAction);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleOutsideAction);
      document.removeEventListener("touchstart", handleOutsideAction);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (columns.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="group/cats relative py-2 -my-2"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative inline-flex items-center gap-1.5 text-[12px] uppercase font-semibold tracking-[0.16em] text-on-surface-variant transition-colors hover:text-primary group-hover/cats:text-primary cursor-pointer"
      >
        Categories
        <span className={`transition-transform duration-300 group-hover/cats:rotate-180 ${isOpen ? "rotate-180" : ""}`}>
          <Chevron open={isOpen} />
        </span>
        <span
          aria-hidden
          className={`pointer-events-none absolute -bottom-1 left-0 h-px bg-primary transition-all duration-300 group-hover/cats:w-full ${
            isOpen ? "w-full" : "w-0"
          }`}
        />
      </button>

      {/* Dropdown panel wrapper with top-full and pt-2 bridge */}
      <div
        role="menu"
        aria-label="Categories"
        className={`absolute left-1/2 top-full z-50 w-[min(960px,92vw)] -translate-x-1/2 pt-2 transition-all duration-300 ease-in-out pointer-events-none group-hover/cats:pointer-events-auto ${
          isOpen ? "!pointer-events-auto" : ""
        }`}
      >
        <div
          className={`relative overflow-hidden rounded-3xl border border-outline-variant/40 bg-surface/98 text-on-surface shadow-[0_24px_50px_-12px_rgba(47,2,11,0.2)] backdrop-blur-2xl transition-all duration-300 ease-in-out invisible opacity-0 translate-y-2 group-hover/cats:visible group-hover/cats:opacity-100 group-hover/cats:translate-y-0 ${
            isOpen ? "!visible !opacity-100 !translate-y-0" : ""
          }`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
          />
          <div className="grid grid-cols-1 gap-x-8 gap-y-7 p-8 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title} className="flex flex-col">
                <Link
                  href={`/shop?category=${encodeURIComponent(col.title.toLowerCase().replace(/[\s_]+/g, "-"))}`}
                  onClick={() => setIsOpen(false)}
                  className="font-serif text-[15px] font-semibold tracking-tight text-primary transition-colors hover:text-surface-tint"
                >
                  {col.title}
                </Link>
                <span
                  aria-hidden
                  className="mt-2 h-px w-8 bg-surface-tint/60"
                />
                {col.items.length > 0 && (
                  <ul className="mt-3.5 flex flex-col gap-2">
                    {col.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="group/it inline-flex items-center gap-2 text-[13px] text-on-surface-variant transition-all duration-200 hover:text-primary"
                        >
                          <span
                            aria-hidden
                            className="h-px w-2 bg-outline-variant transition-all duration-200 group-hover/it:w-3.5 group-hover/it:bg-primary"
                          />
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-outline-variant/30 bg-surface-container-low/70 px-8 py-4 backdrop-blur-xl">
            <p className="text-[12px] text-on-surface-variant font-light">
              Complimentary carbon-neutral courier on orders surpassing ₹999
            </p>
            <Link
              href="/shop"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary transition-colors duration-300 hover:text-surface-tint"
            >
              Shop All
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
    return null;
  }

  return (
    <div className="flex flex-col">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary cursor-pointer"
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
          <div className="mb-2 space-y-5 rounded-2xl border border-outline-variant/30 bg-surface-container-low/90 px-4 py-4 backdrop-blur-xl">
            {columns.map((col) => (
              <div key={col.title}>
                <Link
                  href={`/shop?category=${encodeURIComponent(col.title.toLowerCase().replace(/[\s_]+/g, "-"))}`}
                  onClick={onItemClick}
                  className="font-serif text-[13px] font-bold tracking-tight text-primary block transition-colors hover:text-surface-tint"
                >
                  {col.title}
                </Link>
                <span
                  aria-hidden
                  className="mt-1.5 block h-px w-6 bg-surface-tint/60"
                />
                {col.items.length > 0 && (
                  <ul className="mt-2.5 flex flex-col gap-1.5">
                    {col.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          onClick={onItemClick}
                          className="block py-1 text-[13px] text-on-surface-variant transition-colors duration-200 hover:text-primary"
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

