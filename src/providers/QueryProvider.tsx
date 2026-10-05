"use client";

import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { adminToast } from "@/features/admin/context/AdminToastContext";

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (error: unknown, _variables, _context, mutation) => {
            if (
              typeof window !== "undefined" &&
              window.location.pathname.startsWith("/dedicated-admin")
            ) {
              const meta = mutation.meta as
                | {
                    suppressToast?: boolean;
                    errorTitle?: string;
                    errorMessage?: string;
                  }
                | undefined;
              if (meta?.suppressToast) return;
              const errObj = error as {
                message?: string;
                response?: { data?: { message?: string } };
              };
              const message =
                meta?.errorMessage ||
                errObj.response?.data?.message ||
                errObj.message ||
                "An unexpected error occurred";
              adminToast.error(message, meta?.errorTitle || "Action Failed");
            }
          },
          onSuccess: (_data, _variables, _context, mutation) => {
            if (
              typeof window !== "undefined" &&
              window.location.pathname.startsWith("/dedicated-admin")
            ) {
              const meta = mutation.meta as
                | {
                    suppressToast?: boolean;
                    successTitle?: string;
                    successMessage?: string;
                  }
                | undefined;
              if (meta?.successMessage) {
                adminToast.success(meta.successMessage, meta.successTitle || "Success");
              }
            }
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes default fresh cache
            gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            retry: (failureCount, error: unknown) => {
              // Never retry on 429 (Rate limited) or client errors (400, 401, 403, 404)
              if (failureCount >= 2) return false;
              if (typeof error === "object" && error !== null) {
                const err = error as { code?: string | number; response?: { status?: number } };
                const status = err.response?.status || err.code;
                if (status === 429 || status === "429" || status === 401 || status === 403 || status === 404) {
                  return false;
                }
              }
              return true;
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
