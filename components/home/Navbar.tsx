"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useAppSelector } from "@/features/product/hooks/redux";
import { useSpotlight } from "@/components/search/SpotlightProvider";
import {
  DesktopCategoriesMenu,
  MobileCategoriesMenu,
} from "@/components/navbar/CategoriesMenu";
import {
  CartIcon,
  CloseIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
} from "./icons";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Contact", href: "/#contact" },
];

/**
 * Counter shown on cart / wishlist icons. Clamps display at 99+.
 * Keeps the visual width stable so the badge doesn't jitter when the
 * count crosses into triple digits.
 */
function formatBadgeCount(n: number): string {
  if (n <= 0) return "0";
  if (n > 99) return "99+";
  return String(n);
}

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gold px-1.5 text-[10px] font-bold leading-none text-white shadow-[0_0_0_2px_var(--color-ink)]">
      {formatBadgeCount(count)}
    </span>
  );
}

/**
 * Glass-surfaced icon button used for search / wishlist / cart triggers in
 * the navbar. Semi-transparent at rest, brighter + gold on hover.
 */
function IconTrigger({
  children,
  ...props
}: {
  children: ReactNode;
  "aria-label": string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      {...props}
      className="relative rounded-full border border-white/10 bg-white/5 p-2 text-paper-muted backdrop-blur-md transition-all duration-300 ease-in-out hover:border-white/20 hover:bg-white/10 hover:text-gold hover:shadow-[0_8px_20px_-10px_rgba(139,30,45,0.45)]"
    >
      {children}
    </button>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const cartCount = useAppSelector((s) =>
    s.cart.items.reduce((sum, it) => sum + it.quantity, 0),
  );
  const wishlistCount = useAppSelector((s) => s.wishlist.ids.length);
  const { setOpen: setSpotlightOpen } = useSpotlight();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-ink/60 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.35)] backdrop-blur-xl supports-[backdrop-filter]:bg-ink/45">
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

          <DesktopCategoriesMenu />

          {NAV_LINKS.slice(2).map((link) => (
            <NavLink key={link.label} href={link.href} label={link.label} />
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <IconTrigger
            aria-label="Search (press ⌘K or Ctrl+K)"
            onClick={() => setSpotlightOpen(true)}
          >
            <SearchIcon />
          </IconTrigger>

          <Link
            href="/wishlist"
            aria-label={`Wishlist${
              wishlistCount > 0 ? `, ${wishlistCount} items` : ""
            }`}
            className="relative rounded-full border border-white/10 bg-white/5 p-2 text-paper-muted backdrop-blur-md transition-all duration-300 ease-in-out hover:border-white/20 hover:bg-white/10 hover:text-gold hover:shadow-[0_8px_20px_-10px_rgba(139,30,45,0.45)]"
          >
            <HeartIcon />
            <CountBadge count={wishlistCount} />
          </Link>

          <Link
            href="/cart"
            aria-label={`Cart${
              cartCount > 0 ? `, ${cartCount} items` : ""
            }`}
            className="relative rounded-full border border-white/10 bg-white/5 p-2 text-paper-muted backdrop-blur-md transition-all duration-300 ease-in-out hover:border-white/20 hover:bg-white/10 hover:text-gold hover:shadow-[0_8px_20px_-10px_rgba(139,30,45,0.45)]"
          >
            <CartIcon />
            <CountBadge count={cartCount} />
          </Link>

          <button
            type="button"
            className="hidden rounded-full border border-gold/70 bg-white/5 px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold backdrop-blur-md transition-all duration-300 ease-in-out hover:border-gold hover:bg-gold hover:text-white hover:shadow-[0_10px_25px_-10px_rgba(139,30,45,0.6)] md:inline-flex"
          >
            Login
          </button>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-paper-muted backdrop-blur-md transition-all duration-300 ease-in-out hover:border-white/20 hover:bg-white/10 hover:text-gold md:hidden"
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
        <div className="border-t border-white/10 bg-ink/85 backdrop-blur-xl md:hidden">
          <nav className="flex w-full flex-col gap-1 px-4 py-4 sm:px-6">
            {NAV_LINKS.slice(0, 2).map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium uppercase tracking-[0.2em] text-paper transition-colors duration-300 hover:bg-white/5 hover:text-gold"
              >
                {link.label}
              </Link>
            ))}

            <MobileCategoriesMenu onItemClick={() => setOpen(false)} />

            {NAV_LINKS.slice(2).map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium uppercase tracking-[0.2em] text-paper transition-colors duration-300 hover:bg-white/5 hover:text-gold"
              >
                {link.label}
              </Link>
            ))}

            <button
              type="button"
              className="mt-3 w-full rounded-full border border-gold/70 bg-white/5 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold backdrop-blur-md transition-all duration-300 ease-in-out hover:border-gold hover:bg-gold hover:text-white"
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
      className="group relative text-[12px] font-medium uppercase tracking-[0.22em] text-paper transition-colors duration-300 hover:text-gold"
    >
      {label}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full"
      />
    </Link>
  );
}//