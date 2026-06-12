"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/features/admin/components/AdminSidebar";
import AdminProtectedRoute from "@/features/auth/components/AdminProtectedRoute";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/dedicated-admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-ink text-paper">
        <div className="flex min-h-screen">
          <AdminSidebar />
          <main className="min-w-0 flex-1">
            <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-14">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}
