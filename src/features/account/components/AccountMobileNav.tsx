"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/features/product/store";
import { useLogout } from "@/features/auth/hooks";

const NAV_ITEMS = [
  {
    label: "Orders",
    fullLabel: "My Orders",
    href: "/account/orders",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    label: "Profile",
    fullLabel: "Profile Information",
    href: "/account/profile",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    label: "Addresses",
    fullLabel: "Manage Addresses",
    href: "/account/addresses",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function AccountMobileNav() {
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const logoutMutation = useLogout();
  const { user } = useSelector((state: RootState) => state.auth);

  const displayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User"
    : "Ayesha Sharma";

  return (
    <div className="mb-6 flex flex-col gap-3">
      {/* Top Welcome Bar */}
      <div className="flex items-center justify-between rounded-2xl border border-line bg-ink px-4 py-3 shadow-[0_4px_20px_-10px_rgba(74,14,26,0.06)]">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
            Account Settings
          </p>
          <h2 className="font-display text-sm font-bold text-paper">
            {displayName}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#DC2626]/20 bg-[#DC2626]/10 px-3 py-1.5 text-[11px] font-medium text-[#DC2626] transition-colors hover:bg-[#DC2626]/15"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>

      {/* Navigation Options Rounded Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-3.5 text-center transition-all duration-300 ${
                isActive
                  ? "border-gold/50 bg-gold/10 text-gold shadow-[0_4px_16px_-4px_rgba(74,14,26,0.15)] ring-1 ring-gold/30"
                  : "border-line bg-ink text-paper-muted shadow-sm hover:border-gold/30 hover:bg-ink-3 hover:text-paper"
              }`}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                  isActive
                    ? "bg-gold text-ink shadow-sm"
                    : "bg-ink-2 text-paper-muted"
                }`}
              >
                {item.icon}
              </div>
              <span className={`text-[12px] leading-tight ${isActive ? "font-semibold text-gold" : "font-medium text-paper"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={logoutMutation.isPending ? undefined : () => setShowLogoutModal(false)}
          />
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-ink p-6 shadow-2xl backdrop-blur-xl">
            <h3 className="font-display text-xl font-bold text-paper">
              Logout
            </h3>
            <p className="mt-2 text-sm text-paper-muted">
              Are you sure you want to logout from your account?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={logoutMutation.isPending}
                onClick={() => setShowLogoutModal(false)}
                className="rounded-full px-5 py-2 text-[12px] font-semibold uppercase tracking-wider text-paper-muted hover:bg-ink-3 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={logoutMutation.isPending}
                onClick={async () => {
                  try {
                    await logoutMutation.mutateAsync();
                    setShowLogoutModal(false);
                    window.location.href = "/";
                  } catch {
                    // Handled by mutation error
                  }
                }}
                className="rounded-full bg-[#DC2626] px-5 py-2 text-[12px] font-semibold uppercase tracking-wider text-white shadow-md transition-colors hover:bg-[#B91C1C] disabled:opacity-50 inline-flex items-center gap-2"
              >
                {logoutMutation.isPending ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Logging out...
                  </>
                ) : (
                  "Logout"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
