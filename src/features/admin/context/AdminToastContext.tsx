"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface AdminToast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface AdminToastContextType {
  toasts: AdminToast[];
  showToast: (toast: Omit<AdminToast, "id">) => string;
  showSuccess: (message: string, title?: string) => string;
  showError: (message: string, title?: string) => string;
  showInfo: (message: string, title?: string) => string;
  showWarning: (message: string, title?: string) => string;
  dismissToast: (id: string) => void;
}

const AdminToastContext = createContext<AdminToastContextType | undefined>(
  undefined
);

// Event emitter pattern to allow triggering toasts from non-React contexts
// (e.g. TanStack Query MutationCache, API interceptors, helper functions).
type ToastListener = (toast: Omit<AdminToast, "id">) => void;
const toastListeners = new Set<ToastListener>();

export const adminToast = {
  success: (message: string, title = "Success") => {
    toastListeners.forEach((fn) => fn({ type: "success", title, message }));
  },
  error: (message: string, title = "Action Failed") => {
    toastListeners.forEach((fn) => fn({ type: "error", title, message }));
  },
  info: (message: string, title = "Notice") => {
    toastListeners.forEach((fn) => fn({ type: "info", title, message }));
  },
  warning: (message: string, title = "Warning") => {
    toastListeners.forEach((fn) => fn({ type: "warning", title, message }));
  },
};

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<AdminToast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<AdminToast, "id">): string => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: AdminToast = { ...toast, id };
      const duration = toast.duration ?? 4500;

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // Keep at most 5 toasts visible

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const showSuccess = useCallback(
    (message: string, title = "Success") => {
      return showToast({ type: "success", title, message });
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, title = "Action Failed") => {
      return showToast({ type: "error", title, message });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, title = "Notice") => {
      return showToast({ type: "info", title, message });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, title = "Warning") => {
      return showToast({ type: "warning", title, message });
    },
    [showToast]
  );

  useEffect(() => {
    const listener: ToastListener = (t) => {
      showToast(t);
    };
    toastListeners.add(listener);
    return () => {
      toastListeners.delete(listener);
    };
  }, [showToast]);

  return (
    <AdminToastContext.Provider
      value={{
        toasts,
        showToast,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        dismissToast,
      }}
    >
      {children}

      {/* Floating Toast Notification Container */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed top-6 right-6 z-[9999] flex w-full max-w-md flex-col gap-2.5 px-4 sm:px-0"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex w-full items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-top-4 ${
              t.type === "success"
                ? "border-emerald-600/30 bg-ink/95 text-paper"
                : t.type === "error"
                ? "border-[#B3261E]/30 bg-ink/95 text-paper"
                : t.type === "warning"
                ? "border-amber-600/30 bg-ink/95 text-paper"
                : "border-blue-600/30 bg-ink/95 text-paper"
            }`}
          >
            {/* Status Icon */}
            <div
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                t.type === "success"
                  ? "border border-emerald-600/20 bg-emerald-600/10 text-emerald-700"
                  : t.type === "error"
                  ? "border border-[#B3261E]/20 bg-[#B3261E]/10 text-[#B3261E]"
                  : t.type === "warning"
                  ? "border border-amber-600/20 bg-amber-600/10 text-amber-800"
                  : "border border-blue-600/20 bg-blue-600/10 text-blue-700"
              }`}
            >
              {t.type === "success" ? (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : t.type === "error" ? (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              ) : t.type === "warning" ? (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>

            {/* Message Body */}
            <div className="flex-1 pr-2">
              {t.title && (
                <h4 className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-paper">
                  {t.title}
                </h4>
              )}
              <p className="text-xs font-medium leading-relaxed text-paper">
                {t.message}
              </p>
            </div>

            {/* Close / Dismiss Button */}
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="rounded-lg p-1 text-paper-muted transition-colors hover:text-paper"
              aria-label="Dismiss notification"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </AdminToastContext.Provider>
  );
}

export function useAdminToast() {
  const context = useContext(AdminToastContext);
  if (!context) {
    // If used outside provider, fallback to the singleton dispatchers
    return {
      toasts: [],
      showToast: (toast: Omit<AdminToast, "id">) => {
        toastListeners.forEach((fn) => fn(toast));
        return "";
      },
      showSuccess: adminToast.success,
      showError: adminToast.error,
      showInfo: adminToast.info,
      showWarning: adminToast.warning,
      dismissToast: () => {},
    };
  }
  return context;
}
