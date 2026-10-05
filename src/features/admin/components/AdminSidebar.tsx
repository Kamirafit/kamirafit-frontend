"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogoutAdmin } from "@/features/auth/hooks";

type SubItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

type NavGroup = {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: SubItem[];
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

function QuoteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 21c3 0 7-1 7-8V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v6c0 4.5 2.5 8 3 10Z" />
      <path d="M17 21c3 0 7-1 7-8V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v6c0 4.5 2.5 8 3 10Z" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <path d="M4 20h16" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  );
}

function WarehouseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 21h18" />
      <path d="M19 21v-4" />
      <path d="M19 17a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4" />
      <path d="M3 7l9-4 9 4v14" />
      <path d="M9 21v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
    </svg>
  );
}

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ----------------------------------------------------
// Navigation Groups requested by user:
// 1. Dashboard
// 2. Catalog & Inventory -> Analytics, Inventory, Products, Categories
// 3. Orders & Sales      -> Orders, Coupons
// 4. Customers & Support -> Users, Queries, Testimonials
// ----------------------------------------------------
const NAV_GROUPS: NavGroup[] = [
  {
    id: "catalog",
    label: "Catalog & Inventory",
    icon: <BoxIcon />,
    items: [
      { label: "Analytics", href: "/dedicated-admin/analytics", icon: <AnalyticsIcon /> },
      { label: "Inventory", href: "/dedicated-admin/inventory", icon: <WarehouseIcon /> },
      { label: "Products", href: "/dedicated-admin/products", icon: <BoxIcon /> },
      { label: "Categories", href: "/dedicated-admin/categories", icon: <FolderIcon /> },
    ],
  },
  {
    id: "sales",
    label: "Orders & Sales",
    icon: <OrdersIcon />,
    items: [
      { label: "Orders", href: "/dedicated-admin/orders", icon: <OrdersIcon /> },
      { label: "Coupons", href: "/dedicated-admin/coupons", icon: <TagIcon /> },
    ],
  },
  {
    id: "customers",
    label: "Customers & Support",
    icon: <UsersIcon />,
    items: [
      { label: "Users", href: "/dedicated-admin/users", icon: <UsersIcon /> },
      { label: "Queries", href: "/dedicated-admin/queries", icon: <ChatIcon /> },
      { label: "Testimonials", href: "/dedicated-admin/testimonials", icon: <QuoteIcon /> },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const logoutAdmin = useLogoutAdmin();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Group open state: track toggled state for groups
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Auto-open group whenever user lands on or navigates to a route inside that group
  useEffect(() => {
    if (!pathname) return;
    NAV_GROUPS.forEach((group) => {
      const isInside = group.items.some(
        (item) => pathname === item.href || pathname.startsWith(item.href + "/")
      );
      if (isInside) {
        setOpenGroups((prev) => ({ ...prev, [group.id]: true }));
      }
    });
  }, [pathname]);

  const isGroupOpen = (group: NavGroup) => {
    if (openGroups[group.id] !== undefined) {
      return openGroups[group.id];
    }
    // Default open if active page belongs to this group
    return group.items.some(
      (item) => pathname === item.href || (pathname?.startsWith(item.href + "/") ?? false)
    );
  };

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => {
      const current = prev[groupId] !== undefined
        ? prev[groupId]
        : (NAV_GROUPS.find((g) => g.id === groupId)?.items.some(
            (item) => pathname === item.href || (pathname?.startsWith(item.href + "/") ?? false)
          ) ?? false);
      return {
        ...prev,
        [groupId]: !current,
      };
    });
  };

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

  const isDashboardActive = pathname === "/dedicated-admin";

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
              className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#B3261E] hover:bg-red-500/20 transition-colors"
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
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? "mt-3 block" : "hidden"
          }`}
        >
          <nav className="flex flex-col gap-1 border-t border-line pt-3 pb-2">
            {/* 1. Dashboard (Direct Link) */}
            <Link
              href="/dedicated-admin"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-colors ${
                isDashboardActive
                  ? "bg-gold text-ink shadow-sm"
                  : "text-paper hover:bg-ink-2"
              }`}
            >
              <span className={`shrink-0 ${isDashboardActive ? "text-ink" : "text-paper-muted"}`}>
                <DashboardIcon />
              </span>
              <span className="whitespace-nowrap">Dashboard</span>
            </Link>

            {/* 2, 3, 4. Accordion Navigation Groups */}
            {NAV_GROUPS.map((group) => {
              const isOpen = isGroupOpen(group);
              const isGroupActive = group.items.some(
                (item) => pathname === item.href || (pathname?.startsWith(item.href + "/") ?? false)
              );

              return (
                <div key={group.id} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-colors ${
                      isGroupActive
                        ? "bg-gold/10 text-gold"
                        : "text-paper hover:bg-ink-2"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`shrink-0 ${isGroupActive ? "text-gold" : "text-paper-muted"}`}>
                        {group.icon}
                      </span>
                      <span className="whitespace-nowrap truncate">{group.label}</span>
                    </div>
                    <ChevronDownIcon
                      className={`shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-gold" : "text-paper-muted/60"
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="ml-5 flex flex-col gap-1 border-l-2 border-line/80 py-1.5 pl-3.5">
                      {group.items.map((subItem) => {
                        const isSubActive =
                          pathname === subItem.href || (pathname?.startsWith(subItem.href + "/") ?? false);
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium transition-colors ${
                              isSubActive
                                ? "bg-gold text-ink font-semibold shadow-sm"
                                : "text-paper-muted hover:bg-ink-2 hover:text-paper"
                            }`}
                          >
                            <span className={`shrink-0 ${isSubActive ? "text-ink" : "text-paper-muted"}`}>
                              {subItem.icon}
                            </span>
                            <span className="whitespace-nowrap">{subItem.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop Sidebar (lg:block) */}
      <aside className="hidden w-72 shrink-0 border-r border-line bg-ink lg:block">
        <div className="sticky top-0 flex h-screen flex-col justify-between px-5 py-6">
          <div className="flex flex-col gap-5">
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

            <nav className="flex flex-col gap-1 overflow-y-auto pr-1">
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-paper-muted">
                Workspace
              </p>

              {/* 1. Dashboard (Direct Link) */}
              <Link
                href="/dedicated-admin"
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors ${
                  isDashboardActive
                    ? "bg-gold text-ink shadow-sm"
                    : "text-paper hover:bg-ink-2"
                }`}
              >
                <span className={`shrink-0 ${isDashboardActive ? "text-ink" : "text-paper-muted"}`}>
                  <DashboardIcon />
                </span>
                <span className="whitespace-nowrap">Dashboard</span>
              </Link>

              {/* 2, 3, 4. Expandable Navigation Groups */}
              {NAV_GROUPS.map((group) => {
                const isOpen = isGroupOpen(group);
                const isGroupActive = group.items.some(
                  (item) => pathname === item.href || (pathname?.startsWith(item.href + "/") ?? false)
                );

                return (
                  <div key={group.id} className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors ${
                        isGroupActive
                          ? "bg-gold/10 text-gold"
                          : "text-paper hover:bg-ink-2"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`shrink-0 ${isGroupActive ? "text-gold" : "text-paper-muted"}`}>
                          {group.icon}
                        </span>
                        <span className="whitespace-nowrap truncate">{group.label}</span>
                      </div>
                      <ChevronDownIcon
                        className={`shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-gold" : "text-paper-muted/60"
                        }`}
                      />
                    </button>

                    {/* Sub-menu Items */}
                    {isOpen && (
                      <div className="ml-5 flex flex-col gap-1 border-l-2 border-line/80 py-1.5 pl-3.5 transition-all">
                        {group.items.map((subItem) => {
                          const isSubActive =
                            pathname === subItem.href || (pathname?.startsWith(subItem.href + "/") ?? false);
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium transition-colors ${
                                isSubActive
                                  ? "bg-gold text-ink font-semibold shadow-sm"
                                  : "text-paper-muted hover:bg-ink-2 hover:text-paper"
                              }`}
                            >
                              <span className={`shrink-0 ${isSubActive ? "text-ink" : "text-paper-muted"}`}>
                                {subItem.icon}
                              </span>
                              <span className="whitespace-nowrap">{subItem.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto pt-4 pb-1">
            {/* Admin Logout Option - Bottom Left */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-[12.5px] font-semibold text-[#B3261E] transition-colors hover:border-red-500/40 hover:bg-red-500/20 disabled:opacity-50 shadow-sm"
            >
              <span className="text-[#B3261E]">
                <LogoutIcon />
              </span>
              <span className="whitespace-nowrap">{loggingOut ? "Logging out..." : "Logout"}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
