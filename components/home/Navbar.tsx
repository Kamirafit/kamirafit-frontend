"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CartIcon,
  CloseIcon,
  MenuIcon,
  SearchIcon,
} from "./icons";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "#shop" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-neutral-900"
        >
          Kamira<span className="text-neutral-500">Fit</span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-3">
          <button
            type="button"
            aria-label="Search"
            className="rounded-full p-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            <SearchIcon />
          </button>
          <button
            type="button"
            aria-label="Cart"
            className="relative rounded-full p-2 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            <CartIcon />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-semibold text-white">
              0
            </span>
          </button>
          <button
            type="button"
            className="hidden rounded-full border border-neutral-900 px-4 py-1.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white md:inline-flex"
          >
            Login
          </button>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="rounded-full p-2 text-neutral-700 transition-colors hover:bg-neutral-100 md:hidden"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-neutral-200 bg-white md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-base font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              className="mt-2 w-full rounded-full border border-neutral-900 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
            >
              Login
            </button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
