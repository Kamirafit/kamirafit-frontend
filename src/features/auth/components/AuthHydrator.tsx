"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { setAuthHydrated, logoutSuccess } from "../store/authSlice";
import { clearWishlist } from "@/features/product/store/wishlistSlice";
import { AuthStorage, subscribeAuthSync, type AuthSyncEvent } from "../services/authStorage";
import type { UserRole } from "@/types/entities";

export default function AuthHydrator({
  children,
  storageKey = "kamira_auth_customer",
}: {
  children: React.ReactNode;
  storageKey?: string;
}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [hydrated, setHydrated] = useState(false);

  const targetType = storageKey === "kamira_auth_admin" ? "admin" : "customer";

  // 1. Hydrate Initial Auth State
  useEffect(() => {
    try {
      const authData =
        targetType === "admin"
          ? AuthStorage.getAdminAuth()
          : AuthStorage.getCustomerAuth();

      if (authData) {
        const normalizedRole: UserRole =
          String(authData.role || "").toLowerCase() === "admin" ? "admin" : "customer";
        authData.role = normalizedRole;
        if (authData.user) {
          authData.user.role = normalizedRole;
        }
        dispatch(setAuthHydrated(authData));
        if (authData.user) {
          queryClient.setQueryData(["currentUser"], authData.user);
        }
      }
    } catch (error) {
      console.error("Failed to parse auth state from local storage", error);
    } finally {
      setHydrated(true);
    }
  }, [dispatch, queryClient, targetType]);

  // 2. Real-time Cross-Tab Synchronization (BroadcastChannel + StorageEvent)
  useEffect(() => {
    const unsubscribe = subscribeAuthSync((event: AuthSyncEvent) => {
      if (event.target !== targetType) return;

      if (event.type === "LOGIN" && event.state) {
        const authData = event.state;
        const normalizedRole: UserRole =
          String(authData.role || "").toLowerCase() === "admin" ? "admin" : "customer";
        authData.role = normalizedRole;
        if (authData.user) {
          authData.user.role = normalizedRole;
        }

        dispatch(setAuthHydrated(authData));
        if (authData.user) {
          queryClient.setQueryData(["currentUser"], authData.user);
        }

        // Refetch user data across all active queries
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        queryClient.invalidateQueries({ queryKey: ["wishlist"] });
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        queryClient.invalidateQueries({ queryKey: ["reviewEligibility"] });

        // If on auth-only pages, redirect away
        if (targetType === "customer" && (pathname === "/login" || pathname === "/signup")) {
          router.replace("/account");
        } else if (targetType === "admin" && pathname === "/dedicated-admin/login") {
          router.replace("/dedicated-admin");
        }
      } else if (event.type === "LOGOUT") {
        // Cancel in-flight queries
        queryClient.cancelQueries();

        // Clear Redux state
        dispatch(logoutSuccess());
        if (targetType === "customer") {
          dispatch(clearWishlist());
          // Cart remains preserved across logout as requested
        }

        // Remove user data from React Query cache
        queryClient.removeQueries({ queryKey: ["currentUser"] });
        queryClient.removeQueries({ queryKey: ["cart"] });
        queryClient.removeQueries({ queryKey: ["wishlist"] });
        queryClient.removeQueries({ queryKey: ["orders"] });
        queryClient.removeQueries({ queryKey: ["profile"] });
        queryClient.removeQueries({ queryKey: ["reviewEligibility"] });

        // Redirect if on protected route
        if (targetType === "customer") {
          const isProtected =
            pathname?.startsWith("/account") ||
            pathname?.startsWith("/checkout") ||
            pathname?.startsWith("/orders");
          if (isProtected) {
            router.replace(`/login?redirect=${encodeURIComponent(pathname || "/")}`);
          }
        } else if (targetType === "admin") {
          const isProtected =
            pathname?.startsWith("/dedicated-admin") &&
            !pathname?.startsWith("/dedicated-admin/login");
          if (isProtected) {
            router.replace(
              `/dedicated-admin/login?redirect=${encodeURIComponent(pathname || "/dedicated-admin")}`
            );
          }
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch, pathname, queryClient, router, targetType]);

  if (!hydrated) return null;

  return <>{children}</>;
}

