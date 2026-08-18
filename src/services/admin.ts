/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, unwrapApiResponse } from "@/api/client";
import { adaptProduct, type AdminCategory, type AdminOrder as Order, type AdminUser, type Product } from "@/types/entities";
import type { AdminStatsDto } from "@/types/api/admin";

async function adminRequest<T>(method: "get" | "post" | "put" | "patch" | "delete", path: string, data?: any, config?: any): Promise<T> {
  try {
    if (method === "get") {
      return await unwrapApiResponse<T>(apiClient.get("/v1/admin" + path, config));
    }
    if (method === "post") {
      return await unwrapApiResponse<T>(apiClient.post("/v1/admin" + path, data, config));
    }
    if (method === "put") {
      return await unwrapApiResponse<T>(apiClient.put("/v1/admin" + path, data, config));
    }
    if (method === "patch") {
      return await unwrapApiResponse<T>(apiClient.patch("/v1/admin" + path, data, config));
    }
    if (method === "delete") {
      return await unwrapApiResponse<T>(apiClient.delete("/v1/admin" + path, config));
    }
  } catch (err: any) {
    if (err?.code === "404" || err?.message?.includes("404")) {
      if (method === "get") return unwrapApiResponse<T>(apiClient.get("/admin" + path, config));
      if (method === "post") return unwrapApiResponse<T>(apiClient.post("/admin" + path, data, config));
      if (method === "put") return unwrapApiResponse<T>(apiClient.put("/admin" + path, data, config));
      if (method === "patch") return unwrapApiResponse<T>(apiClient.patch("/admin" + path, data, config));
      if (method === "delete") return unwrapApiResponse<T>(apiClient.delete("/admin" + path, config));
    }
    throw err;
  }
  throw new Error("Invalid request method");
}

export const adminService = {
  getStats: () => adminRequest<AdminStatsDto>("get", "/stats"),
  getCategories: () => adminRequest<AdminCategory[]>("get", "/categories"),
  createCategory: (x: any) => adminRequest<AdminCategory>("post", "/categories", x),
  updateCategory: (id: string, x: any) => adminRequest<AdminCategory>("put", "/categories/" + id, x),
  deleteCategory: (id: string) => adminRequest<{ id: string }>("delete", "/categories/" + id).then((x) => x.id),
  getProducts: () => adminRequest<any>("get", "/products").then((r) => (Array.isArray(r) ? r : r.data || []).map(adaptProduct)),
  createProduct: (x: any) => adminRequest<any>("post", "/products", x).then(adaptProduct),
  updateProduct: (id: string, x: any) => adminRequest<any>("put", "/products/" + id, x).then(adaptProduct),
  toggleProductStatus: (id: string) => adminRequest<any>("patch", "/products/" + id + "/toggle").then(adaptProduct),
  deleteProduct: (id: string) => adminRequest<{ id: string }>("delete", "/products/" + id).then((x) => x.id),
  getUsers: () => adminRequest<AdminUser[]>("get", "/users"),
  updateUser: (id: string, x: any) => adminRequest<AdminUser>("put", "/users/" + id, x),
  getOrders: () => adminRequest<any>("get", "/orders").then((r) => (Array.isArray(r) ? r : r.data || [])),
  updateOrder: (id: string, x: any) => adminRequest<Order>("put", "/orders/" + id, x),
  deleteOrder: (id: string) => adminRequest<{ id: string }>("delete", "/orders/" + id).then((x) => x.id),
};

export function useAdminStats() {
  return useQuery({ queryKey: ["admin", "stats"], queryFn: adminService.getStats });
}
export function useAdminCategories() {
  return useQuery({ queryKey: ["admin", "categories"], queryFn: adminService.getCategories });
}
export function useCreateAdminCategory() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: adminService.createCategory,
    onSuccess: () => {
      q.invalidateQueries({ queryKey: ["admin", "categories"] });
      q.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
export function useUpdateAdminCategory() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: any }) => adminService.updateCategory(id, patch),
    onSuccess: () => {
      q.invalidateQueries({ queryKey: ["admin", "categories"] });
      q.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
export function useDeleteAdminCategory() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: adminService.deleteCategory,
    onSuccess: () => {
      q.invalidateQueries({ queryKey: ["admin", "categories"] });
      q.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
export function useAdminProducts() {
  return useQuery<Product[]>({ queryKey: ["admin", "products"], queryFn: adminService.getProducts });
}
export function useCreateAdminProduct() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: adminService.createProduct,
    onSuccess: () => q.invalidateQueries({ queryKey: ["admin", "products"] }),
  });
}
export function useUpdateAdminProduct() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: any }) => adminService.updateProduct(id, patch),
    onSuccess: () => q.invalidateQueries({ queryKey: ["admin", "products"] }),
  });
}
export function useToggleAdminProductStatus() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: adminService.toggleProductStatus,
    onSuccess: () => q.invalidateQueries({ queryKey: ["admin", "products"] }),
  });
}
export function useDeleteAdminProduct() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: adminService.deleteProduct,
    onSuccess: () => q.invalidateQueries({ queryKey: ["admin", "products"] }),
  });
}
export function useAdminUsers() {
  return useQuery({ queryKey: ["admin", "users"], queryFn: adminService.getUsers });
}
export function useUpdateAdminUser() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: any }) => adminService.updateUser(id, patch),
    onSuccess: () => q.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}
export function useAdminOrders() {
  return useQuery<Order[]>({ queryKey: ["admin", "orders"], queryFn: adminService.getOrders });
}
export function useUpdateAdminOrder() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: any }) => adminService.updateOrder(id, patch),
    onSuccess: () => q.invalidateQueries({ queryKey: ["admin", "orders"] }),
  });
}
export function useDeleteAdminOrder() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: adminService.deleteOrder,
    onSuccess: () => q.invalidateQueries({ queryKey: ["admin", "orders"] }),
  });
}
