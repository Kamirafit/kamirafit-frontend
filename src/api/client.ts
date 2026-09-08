import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { ApiErrorDto } from "@/types/api/common";
import { AuthStorage } from "@/features/auth/services/authStorage";

export type ApiErrorResponse = ApiErrorDto;

export async function unwrapApiResponse<T>(
  request: Promise<{ data: { success: boolean; data?: T; message?: string } & Record<string, unknown> }>
): Promise<T> {
  const response = await request;
  if (!response.data.success) throw new Error(response.data.message || "API request failed");
  if (response.data.data !== undefined) {
    return response.data.data as T;
  }
  return response.data as unknown as T;
}

function isErrorPayload(value: unknown): value is { message?: string; code?: string } {
  return typeof value === "object" && value !== null;
}

function getBaseUrl(): string {
  let url = process.env.NEXT_PUBLIC_API_URL || process.env.INTERNAL_API_URL || "";
  if (!url && typeof window !== "undefined") {
    url = "/api/v1";
  }
  if (!url) {
    url = "http://localhost:10000/api/v1";
  }
  url = url.replace(/\/+$/, "");
  if (url.endsWith("/api")) {
    url = `${url}/v1`;
  } else if (!url.endsWith("/api/v1") && !url.includes("/api/")) {
    url = `${url}/api/v1`;
  }
  return url;
}

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const url = config.url || "";
      const isAdminRequest =
        url.includes("/admin") ||
        url.includes("/dedicated-admin") ||
        window.location.pathname.startsWith("/dedicated-admin");

      const authData = isAdminRequest ? AuthStorage.getAdminAuth() : AuthStorage.getCustomerAuth();
      if (authData && authData.isAuthenticated && authData.user) {
        if (authData.accessToken) {
          config.headers.Authorization = `Bearer ${authData.accessToken}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<unknown>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const payload = isErrorPayload(error.response?.data) ? error.response.data : undefined;
    const formattedError: ApiErrorResponse = {
      success: false,
      message: payload?.message || error.message || "An unexpected error occurred",
      code: payload?.code || error.response?.status?.toString() || "UNKNOWN_ERROR",
    };

    if (error.response?.status === 401 && !originalRequest._retry && typeof window !== "undefined") {
      const url = originalRequest.url || "";
      if (url.includes("/auth/refresh") || url.includes("/auth/login")) {
        return Promise.reject(formattedError);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await apiClient.post("/auth/refresh");
        const newAccessToken = refreshResponse.data?.data?.accessToken;

        if (newAccessToken) {
          const pathname = window.location.pathname;
          if (pathname.startsWith("/dedicated-admin")) {
            const adminState = AuthStorage.getAdminAuth();
            if (adminState) {
              AuthStorage.setAdminAuth({ ...adminState, accessToken: newAccessToken });
            }
          } else {
            const customerState = AuthStorage.getCustomerAuth();
            if (customerState) {
              AuthStorage.setCustomerAuth({ ...customerState, accessToken: newAccessToken });
            }
          }
          processQueue(null);
          return apiClient(originalRequest);
        }
      } catch (refreshErr: unknown) {
        processQueue(refreshErr instanceof Error ? refreshErr : new Error("Token refresh failed"));
        const pathname = window.location.pathname;
        const isAdminRequest = pathname.startsWith("/dedicated-admin");
        if (isAdminRequest) {
          AuthStorage.clearAdminAuth();
          if (!pathname.startsWith("/dedicated-admin/login")) {
            window.location.href = `/dedicated-admin/login?redirect=${encodeURIComponent(pathname)}`;
          }
        } else {
          AuthStorage.clearCustomerAuth();
          if (!pathname.startsWith("/login")) {
            window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
          }
        }
        return Promise.reject(formattedError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(formattedError);
  }
);
