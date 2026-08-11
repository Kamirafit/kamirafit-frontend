"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { useAppSelector } from "@/features/product/hooks/redux";
import { useSpotlight } from "@/components/search/SpotlightProvider";
import { DesktopCategoriesMenu } from "@/components/navbar/CategoriesMenu";
import { CartIcon, HeartIcon, SearchIcon, UserIcon } from "./icons";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Contact", href: "/#contact" },
];

function formatBadgeCount(n: number): string {
  if (n <= 0) return "0";
  if (n > 99) return "99+";
  return String(n);
}

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gold px-1.5 text-[10px] font-bold leading-none text-white shadow-[0_0_0_2px_var(--color-ink)]">{formatBadgeCount(count)}</span>;
}

function IconTrigger({ children, ...props }: { children: ReactNode; "aria-label": string; onClick?: () => void }) {
  return <button type="button" {...props} className="relative rounded-full border border-white/10 bg-white/5 p-2 text-paper-muted backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-gold">{children}</button>;
}

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const cartCount = useAppSelector((s) => s.cart.items.reduce((sum, it) => sum + it.quantity, 0));
  const wishlistCount = useAppSelector((s) => s.wishlist.ids.length);
  const { setOpen: setSpotlightOpen } = useSpotlight();

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-14 -z-10 border-b border-white/10 bg-ink/75 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.35)] backdrop-blur-xl supports-[backdrop-filter]:bg-ink/55 sm:h-16" />
      <div className="flex h-14 w-full items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-10">
        <Link href="/" className="font-display text-xl font-semibold tracking-[0.08em] text-paper transition-colors hover:text-gold">Kamira<span className="text-gold">Fit</span></Link>
        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.slice(0, 2).map((link) => <NavLink key={link.label} href={link.href} label={link.label} />)}
          <DesktopCategoriesMenu />
          <NavLink href={NAV_LINKS[2].href} label={NAV_LINKS[2].label} />
        </nav>
        <div className="hidden items-center gap-1 sm:gap-2 md:flex">
          <IconTrigger aria-label="Search (press ⌘K or Ctrl+K)" onClick={() => setSpotlightOpen(true)}><SearchIcon /></IconTrigger>
          <HeaderLink href="/wishlist" label="Wishlist" count={wishlistCount}><HeartIcon /></HeaderLink>
          <HeaderLink href="/cart" label="Cart" count={cartCount}><CartIcon /></HeaderLink>
          {isAuthenticated ? <HeaderLink href="/account" label="Account"><UserIcon /></HeaderLink> : <Link href="/login" className="ml-1 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[12px] font-medium uppercase tracking-[0.22em] text-paper transition-all hover:border-white/20 hover:bg-white/10 hover:text-gold">Login</Link>}
        </div>
        <div className="md:hidden" aria-hidden="true" />
      </div>
      <div aria-hidden className="h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <MobileBottomNav pathname={pathname} cartCount={cartCount} wishlistCount={wishlistCount} isAuthenticated={isAuthenticated} onSearch={() => setSpotlightOpen(true)} />
    </header>
  );
}

function HeaderLink({ href, label, count, children }: { href: string; label: string; count?: number; children: ReactNode }) {
  return <Link href={href} aria-label={label} className="relative rounded-full border border-white/10 bg-white/5 p-2 text-paper-muted backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/10 hover:text-gold">{children}{count ? <CountBadge count={count} /> : null}</Link>;
}

function MobileBottomNav({ pathname, cartCount, wishlistCount, isAuthenticated, onSearch }: { pathname: string; cartCount: number; wishlistCount: number; isAuthenticated: boolean; onSearch: () => void }) {
  const items = [
    { label: "Home", href: "/", Icon: HomeIcon, active: pathname === "/" },
    { label: "Shop", href: "/shop", Icon: ShopIcon, active: pathname.startsWith("/shop") || pathname.startsWith("/product") },
    { label: "Search", href: "#search", Icon: SearchIcon, active: false, onClick: onSearch },
    { label: "Saved", href: "/wishlist", Icon: HeartIcon, active: pathname.startsWith("/wishlist"), count: wishlistCount },
    { label: "Bag", href: "/cart", Icon: CartIcon, active: pathname.startsWith("/cart") || pathname.startsWith("/checkout"), count: cartCount },
    { label: isAuthenticated ? "Account" : "Login", href: isAuthenticated ? "/account" : "/login", Icon: UserIcon, active: pathname.startsWith("/account") || pathname.startsWith("/login") },
  ];

  return <nav className="fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-ink/90 px-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-2 shadow-[0_-12px_30px_-20px_rgba(26,26,26,0.5)] backdrop-blur-xl md:hidden" aria-label="Mobile navigation"><div className="mx-auto grid max-w-md grid-cols-6 gap-1">{items.map(({ label, href, Icon, active, count, onClick }) => onClick ? <button key={label} type="button" onClick={onClick} className="relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-medium tracking-wide text-paper-muted transition-colors"><span className="relative"><Icon width={21} height={21} strokeWidth={1.6} /></span><span>{label}</span></button> : <Link key={label} href={href} aria-current={active ? "page" : undefined} className={active ? "relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl bg-gold/10 text-[10px] font-medium tracking-wide text-gold transition-colors" : "relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-medium tracking-wide text-paper-muted transition-colors"}><span className="relative"><Icon width={21} height={21} strokeWidth={active ? 2 : 1.6} />{count ? <CountBadge count={count} /> : null}</span><span>{label}</span></Link>)}</div></nav>;
}

function HomeIcon(props: React.ComponentProps<"svg">) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></svg>;
}

function ShopIcon(props: React.ComponentProps<"svg">) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h16l-1 12H5L4 8Z" /><path d="M8 8a4 4 0 0 1 8 0" /></svg>;
}

function NavLink({ label, href }: { label: string; href: string }) {
  return <Link href={href} className="group relative text-[12px] font-medium uppercase tracking-[0.22em] text-paper transition-colors duration-300 hover:text-gold">{label}<span aria-hidden className="pointer-events-none absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" /></Link>;
}
