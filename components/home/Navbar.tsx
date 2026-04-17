"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppSelector } from "@/features/product/hooks/redux";
import {
  CartIcon,
  CloseIcon,
  MenuIcon,
  SearchIcon,
} from "./icons";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Contact", href: "/#contact" },
];

type CategoryColumn = {
  title: string;
  blurb: string;
  items: { label: string; href: string }[];
};

const CATEGORY_COLUMNS: CategoryColumn[] = [
  {
    title: "Oversized T-Shirts",
    blurb: "Relaxed silhouettes that drape effortlessly.",
    items: [
      { label: "Graphic", href: "/shop?category=oversized&style=graphic" },
      { label: "Plain", href: "/shop?category=oversized&style=plain" },
      { label: "Printed", href: "/shop?category=oversized&style=printed" },
    ],
  },
  {
    title: "Regular Fit T-Shirts",
    blurb: "Everyday essentials, cleanly cut.",
    items: [
      { label: "Solid", href: "/shop?category=regular&style=solid" },
      { label: "Minimal", href: "/shop?category=regular&style=minimal" },
      { label: "Casual", href: "/shop?category=regular&style=casual" },
    ],
  },
  {
    title: "Hoodies",
    blurb: "Heavyweight warmth for cooler days.",
    items: [
      { label: "Zip Hoodies", href: "/shop?category=hoodies&style=zip" },
      { label: "Pullover", href: "/shop?category=hoodies&style=pullover" },
      { label: "Winter Wear", href: "/shop?category=hoodies&style=winter" },
    ],
  },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const cartCount = useAppSelector((s) =>
    s.cart.items.reduce((sum, it) => sum + it.quantity, 0),
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-ink/85 backdrop-blur-md supports-[backdrop-filter]:bg-ink/70">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-[0.08em] text-paper transition-colors hover:text-gold"
        >
          Kamira<span className="text-gold">Fit</span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.slice(0, 2).map((link) => (
            <NavLink key={link.label} href={link.href} label={link.label} />
          ))}

          {/* Categories — hover-dropdown, pure CSS, fade + slide in */}
          <div className="group/cats relative">
            <button
              type="button"
              aria-haspopup="true"
              className="relative inline-flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.22em] text-paper transition-colors hover:text-gold group-hover/cats:text-gold"
            >
              Categories
              <svg
                aria-hidden
                width="10"
                height="10"
                viewBox="0 0 12 12"
                className="transition-transform duration-200 group-hover/cats:rotate-180"
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
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover/cats:w-full"
              />
            </button>

            <div
              role="menu"
              aria-label="Categories"
              className="invisible absolute left-1/2 top-full z-50 w-[min(880px,90vw)] -translate-x-1/2 translate-y-1 pt-4 opacity-0 transition-all duration-200 ease-out group-hover/cats:visible group-hover/cats:translate-y-0 group-hover/cats:opacity-100"
            >
              <div className="relative overflow-hidden rounded-2xl border border-line bg-white text-paper shadow-[0_30px_60px_-20px_rgba(74,14,26,0.25)]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
                />
                <div className="grid grid-cols-3 gap-8 p-8">
                  {CATEGORY_COLUMNS.map((col) => (
                    <div key={col.title} className="flex flex-col">
                      <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-gold">
                        {col.title}
                      </p>
                      <p className="mt-2 text-[13px] leading-snug text-neutral-500">
                        {col.blurb}
                      </p>
                      <ul className="mt-4 flex flex-col gap-1.5">
                        {col.items.map((item) => (
                          <li key={item.label}>
                            <Link
                              href={item.href}
                              className="group/it inline-flex items-center gap-2 text-[14px] font-medium text-paper transition-colors hover:text-gold"
                            >
                              <span className="h-px w-3 bg-neutral-300 transition-all duration-200 group-hover/it:w-5 group-hover/it:bg-gold" />
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
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-gold transition-colors hover:text-gold-bright"
                  >
                    Shop all
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {NAV_LINKS.slice(2).map((link) => (
            <NavLink key={link.label} href={link.href} label={link.label} />
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            aria-label="Search"
            className="rounded-full p-2 text-paper-muted transition-colors hover:bg-ink-3 hover:text-gold"
          >
            <SearchIcon />
          </button>
          <Link
            href="/cart"
            aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
            className="relative rounded-full p-2 text-paper-muted transition-colors hover:bg-ink-3 hover:text-gold"
          >
            <CartIcon />
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-xs font-bold text-white shadow-[0_0_0_2px_var(--color-ink)]">
              {cartCount}
            </span>
          </Link>
          <button
            type="button"
            className="hidden rounded-full border border-gold/70 px-5 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gold transition-all duration-200 hover:bg-gold hover:text-paper hover:shadow-[0_10px_25px_-12px_rgba(139,30,45,0.55)] md:inline-flex"
          >
            Login
          </button>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="rounded-full p-2 text-paper-muted transition-colors hover:bg-ink-3 hover:text-gold md:hidden"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <div
        aria-hidden
        className="h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent"
      />

      {open ? (
        <div className="border-t border-line bg-ink md:hidden">
          <nav className="flex w-full flex-col gap-1 px-4 py-4 sm:px-6">
            {NAV_LINKS.slice(0, 2).map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium uppercase tracking-[0.2em] text-paper transition-colors hover:bg-ink-3 hover:text-gold"
              >
                {link.label}
              </Link>
            ))}

            <button
              type="button"
              aria-expanded={mobileCatOpen}
              onClick={() => setMobileCatOpen((v) => !v)}
              className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium uppercase tracking-[0.2em] text-paper transition-colors hover:bg-ink-3 hover:text-gold"
            >
              Categories
              <svg
                aria-hidden
                width="12"
                height="12"
                viewBox="0 0 12 12"
                className={`transition-transform duration-200 ${
                  mobileCatOpen ? "rotate-180" : ""
                }`}
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
            </button>
            {mobileCatOpen ? (
              <div className="mb-2 space-y-4 rounded-md bg-ink-2 px-4 py-3">
                {CATEGORY_COLUMNS.map((col) => (
                  <div key={col.title}>
                    <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-gold">
                      {col.title}
                    </p>
                    <ul className="mt-2 flex flex-col gap-1">
                      {col.items.map((item) => (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className="block py-1 text-[14px] text-paper hover:text-gold"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : null}

            {NAV_LINKS.slice(2).map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium uppercase tracking-[0.2em] text-paper transition-colors hover:bg-ink-3 hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              className="mt-3 w-full rounded-full border border-gold/70 px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-paper"
            >
              Login
            </button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function NavLink({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="group relative text-[12px] font-medium uppercase tracking-[0.22em] text-paper transition-colors hover:text-gold"
    >
      {label}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full"
      />
    </Link>
  );
}
