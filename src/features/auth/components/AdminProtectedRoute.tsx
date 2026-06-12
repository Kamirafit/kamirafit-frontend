"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { AdminRootState } from "../../admin/store";

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, role } = useSelector((state: AdminRootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || role !== "admin") {
      const redirectParam = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.replace(`/dedicated-admin/login${redirectParam}`);
    }
  }, [isAuthenticated, role, router, pathname]);

  if (!isAuthenticated || role !== "admin") {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}
