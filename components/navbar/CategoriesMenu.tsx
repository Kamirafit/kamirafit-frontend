"use client";

import Link from "next/link";
import { useState } from "react";

export type MegaMenuColumn = {
  title: string;
  items: { label: string; href: string }[];
};

/**
 * Categories mega menu data — structured exactly per brand spec.
 * Each subcategory routes to /shop?category=<slug>.
 */
export const CATEGORY_COLUMNS: MegaMenuColumn[] = [
  {
    title: "Indian",
    items: [{ label: "Kurti", href: "/shop?category=kurti" }],
  },
  {
    title: "Indo-western",
    items: [{ label: "Co-ords sets", href: "/shop?category=co-ords-sets" }],
  },
  {
    title: "Western",
    items: [{ label: "Dresses", href: "/shop?category=dresses" }],
  },
  {
    title: "Unisex T-shirts",
    items: [
      { label: "T-shirts", href: "/shop?category=tshirts" },
      { label: "Oversized T-shirts", href: "/shop?category=oversized-tshirts" },
      { label: "Hoodies", href: "/shop?category=hoodies" },
    ],
  },
];

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

/**
 * Desktop-only mega menu: trigger + hover-opened multi-column panel.
 * Hover logic is pure CSS (group-hover) — no JS, no external libs.
 * Fade + slide animation via opacity/translate-y transitions.
 */
export function DesktopCategoriesMenu() {
  return (
    <div className="group/cats relative">
      <button
        type="button"
        aria-haspopup="true"
        className="relative inline-flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.22em] text-paper transition-colors hover:text-gold group-hover/cats:text-gold"
      >
        Categories
        <span className="transition-transform duration-300 group-hover/cats:rotate-180">
          <Chevron open={false} />
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover/cats:w-full"
        />
      </button>

      {/*
        Hover bridge: pt-4 absorbs the cursor gap between trigger and panel so
        the dropdown doesn't close when moving toward it.
      */}
      <div
        role="menu"
        aria-label="Categories"
        className="invisible absolute left-1/2 top-full z-50 w-[min(960px,92vw)] -translate-x-1/2 translate-y-2 pt-4 opacity-0 transition-all duration-300 ease-out group-hover/cats:visible group-hover/cats:translate-y-0 group-hover/cats:opacity-100"
      >
        <div className="relative overflow-hidden rounded-2xl border border-line bg-white text-[#1A1A1A] shadow-[0_30px_60px_-20px_rgba(74,14,26,0.3)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
          />
          <div className="grid grid-cols-1 gap-8 p-8 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORY_COLUMNS.map((col) => (
              <div key={col.title} className="flex flex-col">
                <p className="font-display text-[15px] font-bold tracking-tight text-[#1A1A1A]">
                  {col.title}
                </p>
                <span
                  aria-hidden
                  className="mt-2 h-px w-8 bg-gold/70"
                />
                <ul className="mt-4 flex flex-col gap-2.5">
                  {col.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="group/it inline-flex items-center gap-2 text-[13.5px] text-neutral-700 transition-all duration-300 ease-in-out hover:text-gold"
                      >
                        <span
                          aria-hidden
                          className="h-px w-3 bg-neutral-300 transition-all duration-300 group-hover/it:w-5 group-hover/it:bg-gold"
                        />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-8 py-4">
            <p className="text-[12px] text-neutral-600">
              Free shipping on orders over ₹2,000
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold transition-colors hover:text-gold-bright"
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
 * Mobile-only expandable categories block. Replaces desktop hover with a
 * click-to-expand pattern; intended for use inside the Navbar's mobile drawer.
 */
export function MobileCategoriesMenu({
  onItemClick,
}: {
  onItemClick?: () => void;
}) {
  const [open, setOpen] = useState(false);

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
          <div className="mb-2 space-y-5 rounded-xl border border-line bg-ink-2 px-4 py-4">
            {CATEGORY_COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="font-display text-[13px] font-bold tracking-tight text-paper">
                  {col.title}
                </p>
                <span
                  aria-hidden
                  className="mt-1.5 block h-px w-6 bg-gold/70"
                />
                <ul className="mt-3 flex flex-col gap-1.5">
                  {col.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        onClick={onItemClick}
                        className="block py-1 text-[13.5px] text-paper-muted transition-colors duration-300 hover:text-gold"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
