"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutSuccess } from "@/features/auth/store/authSlice";
import { RootState } from "@/features/product/store";
import { useLogout } from "@/services/auth";

const NAV_ITEMS = [
  { label: "My Orders", href: "/account/orders" },
  { label: "Profile Information", href: "/account/profile" },
  { label: "Manage Addresses", href: "/account/addresses" },
  { label: "PAN Card Information", href: "/account/pan" },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dispatch = useDispatch();
  const logoutMutation = useLogout();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const displayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User"
    : "Ayesha Sharma";

  return (
    <>
      <aside className="flex flex-col overflow-hidden rounded-2xl border border-line bg-ink shadow-[0_20px_40px_-20px_rgba(74,14,26,0.1)] md:sticky md:top-24">
        <div className="border-b border-line bg-ink-2 px-6 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
            Account Settings
          </p>
          <h2 className="mt-1 font-display text-lg font-bold text-paper">
            {displayName}
          </h2>
        </div>
        <nav className="flex flex-col p-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-4 py-3 text-[13px] font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-gold/10 text-gold"
                    : "text-paper-muted hover:bg-ink-3 hover:text-paper"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="my-2 border-t border-line/60" />

          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="rounded-xl px-4 py-3 text-left text-[13px] font-medium text-[#DC2626] transition-all duration-300 hover:bg-[#DC2626]/10"
          >
            Logout
          </button>
        </nav>
      </aside>

      {showLogoutModal ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
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
                onClick={() => setShowLogoutModal(false)}
                className="rounded-full px-5 py-2 text-[12px] font-semibold uppercase tracking-wider text-paper-muted hover:bg-ink-3"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowLogoutModal(false);
                  await logoutMutation.mutateAsync();
                  dispatch(logoutSuccess());
                  localStorage.removeItem("kamira_auth_customer");
                  window.location.href = "/";
                }}
                className="rounded-full bg-[#DC2626] px-5 py-2 text-[12px] font-semibold uppercase tracking-wider text-white shadow-md transition-colors hover:bg-[#B91C1C]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
