"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

const ITEMS: Item[] = [
  { label: "Dashboard", href: "/dedicated-admin", icon: <DashboardIcon /> },
  { label: "Products", href: "/dedicated-admin/products", icon: <BoxIcon /> },
  { label: "Users", href: "/dedicated-admin/users", icon: <UsersIcon /> },
  { label: "Categories", href: "/dedicated-admin/categories", icon: <FolderIcon /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-line bg-ink lg:block">
      <div className="sticky top-0 flex h-screen flex-col gap-6 px-4 py-6">
        <Link
          href="/dedicated-admin"
          className="flex items-center gap-2 px-2 py-1"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gold text-[13px] font-semibold text-white">
            K
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-[15px] font-semibold text-paper">
              KamiraFit
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-paper-muted">
              Admin
            </span>
          </span>
        </Link>

        <nav className="flex flex-col gap-1">
          {ITEMS.map((item) => {
            const active =
              item.href === "/dedicated-admin"
                ? pathname === item.href
                : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-gold/10 text-gold"
                    : "text-paper-muted hover:bg-ink-2 hover:text-paper"
                }`}
              >
                <span
                  className={
                    active ? "text-gold" : "text-paper-muted"
                  }
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl border border-line bg-ink-2 p-3 text-[11.5px] leading-relaxed text-paper-muted">
          <p className="font-medium text-paper">Dedicated admin</p>
          <p className="mt-1">
            Not linked from the storefront. Bookmark this URL to return.
          </p>
        </div>
      </div>
    </aside>
  );
}
