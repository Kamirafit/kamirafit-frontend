"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/features/product/hooks/redux";
import { useSpotlight } from "@/components/search/SpotlightProvider";
import { useContactModal } from "@/components/contact/ContactModalProvider";
import { DesktopCategoriesMenu } from "@/components/navbar/CategoriesMenu";
import { CartIcon, HeartIcon, SearchIcon, UserIcon } from "./icons";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop All", href: "/shop" },
  { label: "Curated", href: "/wishlist" },
];

function formatBadgeCount(n: number): string {
  if (n <= 0) return "0";
  if (n > 99) return "99+";
  return n < 10 ? `0${n}` : String(n);
}

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const cartCount = useAppSelector((s) => s.cart.items.reduce((sum, it) => sum + it.quantity, 0));
  const wishlistCount = useAppSelector((s) => s.wishlist.ids.length);
  const { setOpen: setSpotlightOpen } = useSpotlight();
  const { openContactModal } = useContactModal();

  return (
    <header className="sticky top-0 left-0 w-full z-50 backdrop-blur-xl bg-surface/85 border-b border-outline-variant/30 transition-all duration-300">
      <div className="w-full max-w-[1400px] mx-auto h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">
        {/* Brand Logo & Monogram */}
        <div className="flex items-center gap-8 lg:gap-10">
          <Link href="/" scroll={true} className="flex items-baseline gap-1 group">
            <span className="font-serif text-2xl sm:text-3xl tracking-tight text-primary font-medium italic group-hover:text-surface-tint transition-colors">
              Kamira<span className="font-sans font-semibold tracking-tighter not-italic text-primary">Fit</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-surface-tint mb-1 transition-transform group-hover:scale-125" />
          </Link>

          {/* High-Fashion Editorial Nav */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-8 text-[12px] uppercase font-semibold tracking-[0.16em] text-on-surface-variant">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  scroll={true}
                  className={`transition-colors pb-0.5 relative group ${
                    isActive ? "text-primary border-b border-primary" : "hover:text-primary"
                  }`}
                >
                  {link.label}
                  {!isActive && (
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
                  )}
                </Link>
              );
            })}
            <DesktopCategoriesMenu />
            <button
              type="button"
              onClick={openContactModal}
              className="text-[12px] uppercase font-semibold tracking-[0.16em] text-on-surface-variant hover:text-primary transition-colors pb-0.5 relative group cursor-pointer"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
            </button>
          </nav>
        </div>

        {/* Action Utilities */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          {/* Minimalist Integrated Search Trigger */}
          <button
            type="button"
            onClick={() => setSpotlightOpen(true)}
            aria-label="Search archive (press ⌘K or Ctrl+K)"
            className="relative hidden sm:flex items-center pl-9 pr-3 py-2 text-xs font-sans rounded-full bg-surface-container/70 border border-outline-variant/50 hover:border-primary hover:bg-surface-container-lowest focus:outline-none w-40 lg:w-56 transition-all text-left text-primary group cursor-pointer"
          >
            <span className="absolute left-3 text-outline group-hover:text-primary transition-colors">
              <SearchIcon width={16} height={16} />
            </span>
            <span className="text-outline text-xs truncate">Search archive...</span>
            <kbd className="hidden lg:inline-block ml-auto text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant/70 border border-outline-variant/30">
              ⌘K
            </kbd>
          </button>

          {/* Search Trigger for Mobile Top */}
          <button
            type="button"
            onClick={() => setSpotlightOpen(true)}
            aria-label="Search"
            className="sm:hidden relative w-10 h-10 rounded-full border border-outline-variant/40 hover:border-primary bg-surface/90 text-primary flex items-center justify-center transition-all hover:bg-surface-container-lowest"
          >
            <SearchIcon width={18} height={18} />
          </button>

          {/* Wishlist Button */}
          <Link
            href="/wishlist"
            aria-label={`Wishlist (${wishlistCount} items)`}
            className="relative w-10 h-10 rounded-full border border-outline-variant/40 hover:border-primary bg-surface/90 text-primary flex items-center justify-center transition-all hover:bg-surface-container-lowest"
          >
            <HeartIcon width={18} height={18} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary-container text-white text-[9px] font-bold flex items-center justify-center shadow-sm animate-pulse-subtle">
                {formatBadgeCount(wishlistCount)}
              </span>
            )}
          </Link>

          {/* Shopping Bag Button */}
          <Link
            href="/cart"
            aria-label={`Shopping Bag (${cartCount} items)`}
            className="relative group flex items-center gap-2 pl-3.5 pr-4 py-2 rounded-full bg-primary-container text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary transition-all shadow-sm"
          >
            <CartIcon width={17} height={17} />
            <span className="font-sans font-medium text-[11px] hidden sm:inline">Bag</span>
            <span className="w-4 h-4 rounded-full bg-surface-tint/90 text-white text-[9px] flex items-center justify-center font-bold">
              {cartCount}
            </span>
          </Link>

          {/* Account / Login */}
          {isAuthenticated ? (
            <Link
              href="/account"
              aria-label="Account"
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors"
            >
              <UserIcon width={18} height={18} />
            </Link>
          ) : (
            <Link
              href="/login"
              aria-label="Account Login"
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors"
            >
              <UserIcon width={18} height={18} />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        pathname={pathname}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        isAuthenticated={isAuthenticated}
        onSearch={() => setSpotlightOpen(true)}
      />
    </header>
  );
}

function MobileBottomNav({
  pathname,
  cartCount,
  wishlistCount,
  isAuthenticated,
  onSearch,
}: {
  pathname: string;
  cartCount: number;
  wishlistCount: number;
  isAuthenticated: boolean;
  onSearch: () => void;
}) {
  const items = [
    { label: "Home", href: "/", Icon: HomeIcon, active: pathname === "/" },
    {
      label: "Shop",
      href: "/shop",
      Icon: ShopIcon,
      active: pathname.startsWith("/shop") || pathname.startsWith("/product"),
    },
    { label: "Search", href: "#search", Icon: SearchIcon, active: false, onClick: onSearch },
    {
      label: "Saved",
      href: "/wishlist",
      Icon: HeartIcon,
      active: pathname.startsWith("/wishlist"),
      count: wishlistCount,
    },
    {
      label: "Bag",
      href: "/cart",
      Icon: CartIcon,
      active: pathname.startsWith("/cart") || pathname.startsWith("/checkout"),
      count: cartCount,
    },
    {
      label: isAuthenticated ? "Account" : "Login",
      href: isAuthenticated ? "/account" : "/login",
      Icon: UserIcon,
      active: pathname.startsWith("/account") || pathname.startsWith("/login"),
    },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-outline-variant/30 bg-surface/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-2 shadow-[0_-12px_30px_-20px_rgba(47,2,11,0.25)] backdrop-blur-xl md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto grid max-w-md grid-cols-6 gap-1">
        {items.map(({ label, href, Icon, active, count, onClick }) =>
          onClick ? (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className="relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-medium tracking-wide text-on-surface-variant transition-colors hover:text-primary cursor-pointer"
            >
              <span className="relative">
                <Icon width={20} height={20} strokeWidth={1.6} />
              </span>
              <span>{label}</span>
            </button>
          ) : (
            <Link
              key={label}
              href={href}
              scroll={true}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl bg-primary-container/10 text-[10px] font-semibold tracking-wide text-primary transition-colors"
                  : "relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-medium tracking-wide text-on-surface-variant transition-colors hover:text-primary"
              }
            >
              <span className="relative">
                <Icon width={20} height={20} strokeWidth={active ? 2 : 1.6} />
                {count && count > 0 ? (
                  <span className="absolute -right-2.5 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary-container px-1 text-[9px] font-bold text-white">
                    {formatBadgeCount(count)}
                  </span>
                ) : null}
              </span>
              <span>{label}</span>
            </Link>
          )
        )}
      </div>
    </nav>
  );
}

function HomeIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v11h14V9M9 20v-6h6v6" />
    </svg>
  );
}

function ShopIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 8h16l-1 12H5L4 8Z" />
      <path d="M8 8a4 4 0 0 1 8 0" />
    </svg>
  );
}
