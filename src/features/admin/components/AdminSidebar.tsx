"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLogoutAdmin } from "@/features/auth/hooks";

type Item = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

function DashboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="7" height="9" rx="1.2" />
      <rect x="14" y="3" width="7" height="5" rx="1.2" />
      <rect x="14" y="12" width="7" height="9" rx="1.2" />
      <rect x="3" y="16" width="7" height="5" rx="1.2" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m21 8-9-5-9 5v8l9 5 9-5V8Z" />
      <path d="m3.5 8 8.5 5 8.5-5" />
      <path d="M12 13v8" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.6" />
      <path d="M15 20c0-2.8 2-5 5-5" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h10" />
      <circle cx="19" cy="18" r="2" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

const ITEMS: Item[] = [
  { label: "Dashboard", href: "/dedicated-admin", icon: <DashboardIcon /> },
  { label: "Products", href: "/dedicated-admin/products", icon: <BoxIcon /> },
  { label: "Orders", href: "/dedicated-admin/orders", icon: <OrdersIcon /> },
  { label: "Queries", href: "/dedicated-admin/queries", icon: <ChatIcon /> },
  { label: "Users", href: "/dedicated-admin/users", icon: <UsersIcon /> },
  { label: "Categories", href: "/dedicated-admin/categories", icon: <FolderIcon /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logoutAdmin = useLogoutAdmin();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutAdmin.mutateAsync();
    } catch {
      // Ignore network errors on logout cleanup
    } finally {
      window.location.href = "/";
    }
  };

  return (
    <>
      {/* Mobile Top Header (lg:hidden) */}
      <div className="sticky top-0 z-40 border-b border-line bg-ink/95 px-4 py-3.5 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/dedicated-admin" className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gold text-[12px] font-semibold text-ink shadow-sm">
              K
            </span>
            <span className="font-display text-[15px] font-semibold text-paper">
              KamiraFit <span className="text-[10px] uppercase font-bold text-gold tracking-wider">Admin</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <LogoutIcon />
              {loggingOut ? "..." : "Logout"}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg border border-line bg-ink-2 p-2 text-paper-muted hover:text-paper transition-colors"
              aria-label="Toggle Navigation"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? "M18 6L6 18M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        <div
          className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
          }`}
        >
          <div className="min-h-0">
            <nav className="flex flex-col gap-1 border-t border-line pt-3 pb-1">
              {ITEMS.map((item) => {
                const active =
                  item.href === "/dedicated-admin"
                    ? pathname === item.href
                    : pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                      active
                        ? "bg-gold/15 text-gold"
                        : "text-paper-muted hover:bg-ink-2 hover:text-paper"
                    }`}
                  >
                    <span className={active ? "text-gold" : "text-paper-muted"}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar (lg:block) */}
      <aside className="hidden w-64 shrink-0 border-r border-line bg-ink lg:block">
        <div className="sticky top-0 flex h-screen flex-col justify-between px-5 py-6">
          <div className="flex flex-col gap-6">
            <Link
              href="/dedicated-admin"
              className="flex items-center gap-3 px-1"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gold text-[13px] font-semibold text-ink shadow-[0_8px_20px_-10px_rgba(139,30,45,0.5)]">
                K
              </span>
              <span className="flex flex-col leading-tight">
                <span className="font-display text-[16px] font-semibold tracking-tight text-paper">
                  KamiraFit
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
                  Admin
                </span>
              </span>
            </Link>

            <nav className="flex flex-col gap-1">
              <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-paper-muted">
                Workspace
              </p>
              {ITEMS.map((item) => {
                const active =
                  item.href === "/dedicated-admin"
                    ? pathname === item.href
                    : pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-full px-3 py-2 text-[12.5px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                      active
                        ? "bg-gold/10 text-gold"
                        : "text-paper-muted hover:bg-ink-2 hover:text-paper"
                    }`}
                  >
                    <span
                      className={active ? "text-gold" : "text-paper-muted"}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto pt-4">
            {/* Admin Logout Option - Bottom Left */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-[12.5px] font-semibold uppercase tracking-[0.12em] text-red-400 transition-colors hover:border-red-500/60 hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50 shadow-sm"
            >
              <span className="text-red-400">
                <LogoutIcon />
              </span>
              <span>{loggingOut ? "Logging out..." : "Logout"}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
