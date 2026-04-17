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
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const cartCount = useAppSelector((s) =>
    s.cart.items.reduce((sum, it) => sum + it.quantity, 0),
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-ink/85 backdrop-blur-md supports-[backdrop-filter]:bg-ink/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-[0.08em] text-paper transition-colors hover:text-gold"
        >
          Kamira<span className="text-gold">Fit</span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="group relative text-[12px] font-medium uppercase tracking-[0.22em] text-paper-muted transition-colors hover:text-gold"
            >
              {link.label}
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full"
              />
            </Link>
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
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-ink shadow-[0_0_0_2px_var(--color-ink)]">
              {cartCount}
            </span>
          </Link>
          <button
            type="button"
            className="hidden rounded-full border border-gold/70 px-5 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gold transition-all duration-200 hover:bg-gold hover:text-ink hover:shadow-[0_10px_25px_-12px_rgba(139,30,45,0.55)] md:inline-flex"
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
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium uppercase tracking-[0.2em] text-paper-muted transition-colors hover:bg-ink-3 hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              className="mt-3 w-full rounded-full border border-gold/70 px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-ink"
            >
              Login
            </button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
