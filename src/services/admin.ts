/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, unwrapApiResponse } from "@/api/client";
import {
  adaptProduct,
  type AdminCategory,
  type AdminOrder as Order,
  type AdminUser,
  type ContactQuery,
  type Product,
} from "@/types/entities";
import type { AdminStatsDto } from "@/types/api/admin";

export function adaptCategory(raw: any): AdminCategory {
  const c = raw?.data || raw || {};
  return {
    id: c.id || c._id || "",
    name: c.name || "",
    slug: c.slug || (c.name ? c.name.toLowerCase().replace(/[\s_]+/g, "-") : ""),
    description: c.description || "",
    image: c.image || "",
    subcategories: Array.isArray(c.subcategories)
      ? c.subcategories.map((s: any) =>
          typeof s === "string" ? s : s.name || s.title || ""
        )
      : [],
    parentId: c.parentId || null,
  };
}

export function adaptUser(raw: any): AdminUser {
  const u = raw?.data || raw || {};
  const fullName =
    u.firstName || u.lastName
      ? `${u.firstName || ""} ${u.lastName || ""}`.trim()
      : u.name || "Customer";

  return {
    id: u.id || u._id || "",
    name: fullName,
    email: u.email || "",
    phone: u.phoneNumber || u.phone || "",
    address:
      u.address ||
      (u.addresses?.[0]?.street
        ? `${u.addresses[0].street}, ${u.addresses[0].city || ""}`
        : ""),
    isActive: typeof u.isActive === "boolean" ? u.isActive : true,
  };
}

export function adaptOrder(raw: any): Order {
  const o = raw?.data || raw || {};
  const rawCustomer = o.customer || o.shippingAddress || {};
  const customerName =
    rawCustomer.name ||
    (rawCustomer.firstName || rawCustomer.lastName
      ? `${rawCustomer.firstName || ""} ${rawCustomer.lastName || ""}`.trim()
      : "Customer");

  const rawItems = Array.isArray(o.items) ? o.items : [];
  const items = rawItems.map((it: any, index: number) => ({
    productId: it.productId || it.id || `p-${index}`,
    name: it.name || it.productName || it.title || "Product",
    price: typeof it.price === "number" ? it.price : it.unitPrice || 0,
    quantity: typeof it.quantity === "number" ? it.quantity : 1,
    size: it.size || "M",
    color: it.color || "Black",
    image: it.image || it.productImage || "",
  }));

  const subtotal = items.reduce((sum: number, it: any) => sum + it.price * it.quantity, 0);
  const deliveryFee = typeof o.deliveryFee === "number" ? o.deliveryFee : 0;
  const total =
    typeof o.total === "number"
      ? o.total
      : typeof o.totalAmount === "number"
      ? o.totalAmount
      : subtotal + deliveryFee;

  return {
    id: o.id || o._id || o.orderNumber || "",
    createdAt: o.createdAt || new Date().toISOString(),
    customer: {
      name: customerName,
      phone: rawCustomer.phone || rawCustomer.phoneNumber || "",
      address:
        typeof rawCustomer.address === "string"
          ? rawCustomer.address
          : rawCustomer.street
          ? `${rawCustomer.street}, ${rawCustomer.city || ""}`
          : "",
    },
    items,
    subtotal,
    deliveryFee,
    total,
    totalAmount: total,
    paymentStatus: o.paymentStatus || (o.isPaid ? "Paid" : "Pending"),
    orderStatus: o.orderStatus || o.status || "CONFIRMED",
    trackingCode: o.trackingCode || o.trackingNumber,
    courierName: o.courierName || o.carrier,
    trackingUrl: o.trackingUrl,
    notes: o.notes,
  };
}

async function adminRequest<T>(
  method: "get" | "post" | "put" | "patch" | "delete",
  path: string,
  data?: any,
  config?: any
): Promise<T> {
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
  getCategories: () =>
    adminRequest<any>("get", "/categories").then((r) =>
      (Array.isArray(r) ? r : r?.data || []).map(adaptCategory)
    ),
  createCategory: (x: any) => {
    const slug = x.slug || (x.name ? x.name.toLowerCase().replace(/[\s_]+/g, "-") : "");
    return adminRequest<AdminCategory>("post", "/categories", { ...x, slug }).then(adaptCategory);
  },
  updateCategory: (id: string, x: any) =>
    adminRequest<AdminCategory>("put", "/categories/" + id, x).then(adaptCategory),
  deleteCategory: (id: string) =>
    adminRequest<{ id: string }>("delete", "/categories/" + id).then((x) => x.id),
  getProducts: (params?: { page?: number; limit?: number; search?: string; category?: string }) =>
    adminRequest<any>("get", "/products", undefined, { params }).then((r) =>
      (Array.isArray(r) ? r : r?.data || []).map(adaptProduct)
    ),
  createProduct: (x: any) => {
    const payload = {
      name: x.name,
      description: x.description || "",
      brand: x.brand || "KamiraFit",
      categoryId: x.categoryId || x.category,
      baseMrp: x.mrp || x.baseMrp || x.price || 0,
      basePrice: x.price || x.basePrice || 0,
      images: x.images || (x.image ? [x.image] : []),
      variants:
        Array.isArray(x.variants) && x.variants.length > 0
          ? x.variants
          : (x.size || ["M"]).map((size: string, index: number) => ({
              size,
              color: x.color?.[0] || "Black",
              sku: `KF-${(x.name || "PRD").slice(0, 3).toUpperCase()}-${size}-${index + 1}`,
              mrp: x.mrp || x.price || 0,
              offerPrice: x.price || 0,
              stock: 50,
              hsnCode: "61091000",
              gstPercentage: 12.0,
            })),
    };
    return adminRequest<any>("post", "/products", payload).then(adaptProduct);
  },
  updateProduct: (id: string, x: any) =>
    adminRequest<any>("put", "/products/" + id, x).then(adaptProduct),
  toggleProductStatus: (id: string) =>
    adminRequest<any>("patch", "/products/" + id + "/toggle").then(adaptProduct),
  deleteProduct: (id: string) =>
    adminRequest<{ id: string }>("delete", "/products/" + id).then((x) => x.id),
  getUsers: (params?: { search?: string; page?: number; limit?: number }) =>
    adminRequest<any>("get", "/users", undefined, { params }).then((r) =>
      (Array.isArray(r) ? r : r?.data || []).map(adaptUser)
    ),
  updateUser: (id: string, x: any) => {
    const nameParts = (x.name || "").trim().split(" ");
    const firstName = x.firstName || nameParts[0] || "Customer";
    const lastName = x.lastName || nameParts.slice(1).join(" ") || "";
    const payload = {
      firstName,
      lastName,
      email: x.email,
      phoneNumber: x.phone || x.phoneNumber || "",
      isActive: typeof x.isActive === "boolean" ? x.isActive : true,
    };
    return adminRequest<AdminUser>("put", "/users/" + id, payload).then(adaptUser);
  },
  getOrders: (params?: { status?: string; page?: number; limit?: number }) =>
    adminRequest<any>("get", "/orders", undefined, { params }).then((r) =>
      (Array.isArray(r) ? r : r?.data || []).map(adaptOrder)
    ),
  updateOrder: (id: string, x: any) => {
    const payload = {
      status: x.orderStatus || x.status,
      paymentStatus: x.paymentStatus,
      notes: x.notes || (x.customer ? `Updated for ${x.customer.name}` : undefined),
    };
    return adminRequest<Order>("put", "/orders/" + id, payload).then(adaptOrder);
  },
  fulfillOrder: (
    id: string,
    x: { courierName: string; trackingCode: string; trackingUrl?: string; notes?: string }
  ) =>
    adminRequest<Order>("patch", "/orders/" + id + "/fulfill", x).then(adaptOrder),
  syncShiprocket: (id: string) =>
    adminRequest<Order>("post", "/orders/" + id + "/sync-shiprocket").then(adaptOrder),
  deleteOrder: (id: string) =>
    adminRequest<{ id: string }>("delete", "/orders/" + id).then((x) => x.id),
  getQueries: (params?: { search?: string; status?: string; page?: number; limit?: number }) =>
    adminRequest<any>("get", "/queries", undefined, { params }).then((r) => {
      const items = Array.isArray(r) ? r : r?.items || r?.data || [];
      return items as ContactQuery[];
    }),
  updateQueryStatus: (id: string, status: "PENDING" | "RESOLVED" | "ARCHIVED") =>
    adminRequest<ContactQuery>("patch", "/queries/" + id + "/status", { status }),
  deleteQuery: (id: string) =>
    adminRequest<{ id: string }>("delete", "/queries/" + id).then((x) => x.id || id),
};

export function useAdminStats() {
  return useQuery({ queryKey: ["admin", "stats"], queryFn: adminService.getStats });
}
export function useAdminCategories() {
  return useQuery({ queryKey: ["admin", "categories"], queryFn: () => adminService.getCategories() });
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
    mutationFn: ({ id, patch }: { id: string; patch: any }) =>
      adminService.updateCategory(id, patch),
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
export function useAdminProducts(params?: { page?: number; limit?: number; search?: string; category?: string }) {
  return useQuery<Product[]>({
    queryKey: ["admin", "products", params],
    queryFn: () => adminService.getProducts(params),
  });
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
    mutationFn: ({ id, patch }: { id: string; patch: any }) =>
      adminService.updateProduct(id, patch),
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
export function useAdminUsers(params?: { search?: string; page?: number; limit?: number }) {
  return useQuery<AdminUser[]>({
    queryKey: ["admin", "users", params],
    queryFn: () => adminService.getUsers(params),
  });
}
export function useUpdateAdminUser() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: any }) =>
      adminService.updateUser(id, patch),
    onSuccess: () => q.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}
export function useAdminOrders(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery<Order[]>({
    queryKey: ["admin", "orders", params],
    queryFn: () => adminService.getOrders(params),
  });
}
export function useUpdateAdminOrder() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: any }) =>
      adminService.updateOrder(id, patch),
    onSuccess: () => {
      q.invalidateQueries({ queryKey: ["admin", "orders"] });
      q.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}
export function useFulfillAdminOrder() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { courierName: string; trackingCode: string; trackingUrl?: string; notes?: string };
    }) => adminService.fulfillOrder(id, data),
    onSuccess: () => {
      q.invalidateQueries({ queryKey: ["admin", "orders"] });
      q.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}
export function useSyncAdminOrderWithShiprocket() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.syncShiprocket(id),
    onSuccess: () => {
      q.invalidateQueries({ queryKey: ["admin", "orders"] });
      q.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}
export function useDeleteAdminOrder() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: adminService.deleteOrder,
    onSuccess: () => {
      q.invalidateQueries({ queryKey: ["admin", "orders"] });
      q.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useAdminQueries(params?: { search?: string; status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["admin", "queries", params],
    queryFn: () => adminService.getQueries(params),
  });
}

export function useUpdateAdminQueryStatus() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "PENDING" | "RESOLVED" | "ARCHIVED" }) =>
      adminService.updateQueryStatus(id, status),
    onSuccess: () => {
      q.invalidateQueries({ queryKey: ["admin", "queries"] });
    },
  });
}

export function useDeleteAdminQuery() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deleteQuery(id),
    onSuccess: () => {
      q.invalidateQueries({ queryKey: ["admin", "queries"] });
    },
  });
}

