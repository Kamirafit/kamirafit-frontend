"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../../product/store"; // We'll just read from AppStore for this component

export default function CustomerProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, role } = useSelector((state: RootState) => state.auth);

  const roleStr = String(role || "").toLowerCase();
  const isCustomer = Boolean(isAuthenticated && (roleStr === "customer" || roleStr === "admin"));

  useEffect(() => {
    if (!isCustomer) {
      const redirectParam = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${redirectParam}`);
    }
  }, [isCustomer, router, pathname]);

  if (!isCustomer) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}
