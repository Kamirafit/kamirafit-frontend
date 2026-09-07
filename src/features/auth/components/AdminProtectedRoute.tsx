"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { AdminRootState } from "../../admin/store";

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, role } = useSelector((state: AdminRootState) => state.auth);

  const roleStr = String(role || "").toLowerCase();
  const isAdmin = Boolean(isAuthenticated && roleStr === "admin");

  useEffect(() => {
    if (!isAdmin) {
      const redirectParam = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.replace(`/dedicated-admin/login${redirectParam}`);
    }
  }, [isAdmin, router, pathname]);

  if (!isAdmin) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}
