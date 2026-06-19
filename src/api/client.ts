import axios, { AxiosError } from "axios";
import type { ApiErrorDto } from "@/types/api/common";

export type ApiErrorResponse = ApiErrorDto;

function isErrorPayload(value: unknown): value is { message?: string; code?: string } {
  return typeof value === "object" && value !== null;
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const url = config.url || "";
      const isAdminRequest = url.includes("/admin") || url.includes("/dedicated-admin") || window.location.pathname.startsWith("/dedicated-admin");
      const storageKey = isAdminRequest ? "kamira_auth_admin" : "kamira_auth_customer";
      
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const authData = JSON.parse(stored);
          if (authData.isAuthenticated && authData.user) {
            config.headers.Authorization = `Bearer mock-jwt-token-for-${authData.user.email}`;
          }
        } catch (e) {
          console.error("Failed to parse token from local storage", e);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<unknown>) => {
    const payload = isErrorPayload(error.response?.data) ? error.response.data : undefined;
    const formattedError: ApiErrorResponse = {
      success: false,
      message: payload?.message || error.message || "An unexpected error occurred",
      code: payload?.code || error.response?.status?.toString() || "UNKNOWN_ERROR",
    };

    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const isAdminRequest = window.location.pathname.startsWith("/dedicated-admin");
        if (isAdminRequest) {
          localStorage.removeItem("kamira_auth_admin");
          window.location.href = `/dedicated-admin/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        } else {
          localStorage.removeItem("kamira_auth_customer");
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
      }
    }

    return Promise.reject(formattedError);
  }
);
