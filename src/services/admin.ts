/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, unwrapApiResponse } from "@/api/client";
import {
  adaptProduct,
  type AdminCategory,
  type AdminOrder as Order,
  type AdminUser,
  type ContactQuery,
  type AdminQueryInput,
  type Product,
  type BusinessAnalytics,
  type AdminCoupon,
  type CreateCouponDto,
  type UpdateCouponDto,
  type CouponQueryParams,
  type CouponListResponse,
} from "@/types/entities";
import type { AdminStatsDto } from "@/types/api/admin";

export interface AdminProductReview {
  id: string;
  productId: string;
  userId?: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export function adaptAdminProductReview(raw: any): AdminProductReview {
  const r = raw?.data || raw || {};
  return {
    id: r.id || r._id || "",
    productId: r.productId || "",
    userId: r.userId || "",
    rating: typeof r.rating === "number" ? r.rating : 5,
    comment: r.comment || r.content || "",
    images: Array.isArray(r.images) ? r.images : [],
    createdAt: r.createdAt || new Date().toISOString(),
    user: {
      firstName: r.user?.firstName || r.customerName || "Customer",
      lastName: r.user?.lastName || "",
      email: r.user?.email || "",
    },
  };
}

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
  const deliveryFee =
    typeof o.shippingFee === "number"
      ? o.shippingFee
      : typeof o.deliveryFee === "number"
      ? o.deliveryFee
      : Number(o.shippingFee ?? o.deliveryFee ?? 0);
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
    paymentMethod: o.paymentMethod || "ONLINE",
    orderStatus: o.orderStatus || o.status || "CONFIRMED",
    trackingCode: o.trackingCode || o.trackingNumber,
    courierName: o.courierName || o.carrier,
    trackingUrl: o.trackingUrl,
    notes: o.notes,
    returnReason: o.returnReason,
  };
}

export function adaptCoupon(raw: any): AdminCoupon {
  const c = raw?.data || raw || {};
  const discountVal = Number(c.discountValue ?? c.discountVal ?? 0);
  return {
    id: c.id || "",
    code: c.code || "",
    discountType: c.discountType || "PERCENTAGE",
    discountValue: discountVal,
    discountVal,
    maxDiscount: c.maxDiscount != null ? Number(c.maxDiscount) : null,
    minOrderVal: c.minOrderVal != null ? Number(c.minOrderVal) : null,
    startDate: c.startDate || new Date().toISOString(),
    endDate: c.endDate || null,
    applicableCategoryIds: Array.isArray(c.applicableCategoryIds) ? c.applicableCategoryIds : [],
    usageLimit: c.usageLimit != null ? Number(c.usageLimit) : null,
    usedCount: Number(c.usedCount || 0),
    description: c.description || null,
    isActive: typeof c.isActive === "boolean" ? c.isActive : true,
    createdAt: c.createdAt || new Date().toISOString(),
    updatedAt: c.updatedAt || new Date().toISOString(),
    _count: c._count,
  };
}

async function adminRequest<T>(
  method: "get" | "post" | "put" | "patch" | "delete",
  path: string,
  data?: any,
  config?: any
): Promise<T> {
  const url = "/admin" + path;
  if (method === "get") {
    return unwrapApiResponse<T>(apiClient.get(url, config));
  }
  if (method === "post") {
    return unwrapApiResponse<T>(apiClient.post(url, data, config));
  }
  if (method === "put") {
    return unwrapApiResponse<T>(apiClient.put(url, data, config));
  }
  if (method === "patch") {
    return unwrapApiResponse<T>(apiClient.patch(url, data, config));
  }
  if (method === "delete") {
    return unwrapApiResponse<T>(apiClient.delete(url, config));
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
      category: x.category || x.categoryName,
      subcategory: x.subcategory || "",
      baseMrp: Number(x.mrp || x.baseMrp || x.price || 0),
      basePrice: Number(x.price || x.basePrice || 0),
      mrp: Number(x.mrp || x.baseMrp || x.price || 0),
      price: Number(x.price || x.basePrice || 0),
      costPrice: Number(x.costPrice || 0),
      images: x.images || (x.image ? [x.image] : []),
      imageColorMap: x.imageColorMap || {},
      isFeatured: Boolean(x.isFeatured),
      status: x.status || "active",
      slug: x.slug,
      variants:
        Array.isArray(x.variants) && x.variants.length > 0
          ? x.variants.map((v: any) => ({
              size: v.size,
              color: v.color,
              sku: String(v.sku || "").trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_-]/g, ""),
              mrp: Number(v.mrp || x.mrp || x.baseMrp || x.price || 0),
              offerPrice: Number(v.offerPrice || v.price || x.price || x.basePrice || 0),
              stock: typeof v.stock === "number" ? v.stock : 50,
              hsnCode: String(v.hsnCode || "61091000"),
              gstPercentage: typeof v.gstPercentage === "number" ? v.gstPercentage : 5.0,
              weight: typeof v.weight === "number" ? v.weight : 0.2,
            }))
          : (x.size || ["M"]).map((size: string, index: number) => {
              const safeSize = String(size).trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_-]/g, "");
              const safeName = (x.name || "PRD").slice(0, 3).toUpperCase().replace(/[^a-zA-Z0-9_-]/g, "");
              return {
                size,
                color: x.color?.[0] || "Black",
                sku: `KF-${safeName}-${safeSize}-${index + 1}`,
                mrp: Number(x.mrp || x.baseMrp || x.price || 0),
                offerPrice: Number(x.price || x.basePrice || 0),
                stock: 50,
                hsnCode: "61091000",
                gstPercentage: 5.0,
                weight: 0.2,
              };
            }),
    };
    return adminRequest<any>("post", "/products", payload).then(adaptProduct);
  },
  updateProduct: (id: string, x: any) => {
    const payload: any = {
      ...(x.name ? { name: x.name } : {}),
      ...(x.title ? { title: x.title } : {}),
      ...(x.description ? { description: x.description } : {}),
      ...(x.brand ? { brand: x.brand } : {}),
      ...(x.status ? { status: x.status } : {}),
      ...(x.isFeatured !== undefined ? { isFeatured: Boolean(x.isFeatured) } : {}),
      ...(x.price !== undefined || x.basePrice !== undefined ? { price: x.price ?? x.basePrice, basePrice: x.price ?? x.basePrice } : {}),
      ...(x.mrp !== undefined || x.baseMrp !== undefined ? { mrp: x.mrp ?? x.baseMrp, baseMrp: x.mrp ?? x.baseMrp } : {}),
      ...(x.costPrice !== undefined ? { costPrice: Number(x.costPrice) } : {}),
      ...(x.categoryId || x.category ? { categoryId: x.categoryId || x.category, category: x.category } : {}),
      ...(x.subcategory ? { subcategory: x.subcategory } : {}),
      ...(x.images || x.image ? { images: x.images || [x.image] } : {}),
      ...(x.imageColorMap !== undefined ? { imageColorMap: x.imageColorMap } : {}),
      ...(x.slug ? { slug: x.slug } : {}),
    };
    if (Array.isArray(x.variants) && x.variants.length > 0) {
      payload.variants = x.variants.map((v: any) => ({
        ...(v.id && !v.id.startsWith("variant-") ? { id: v.id } : {}),
        size: v.size,
        color: v.color,
        sku: String(v.sku || "").trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_-]/g, ""),
        mrp: Number(v.mrp || x.mrp || x.baseMrp || x.price || 0),
        offerPrice: Number(v.offerPrice || v.price || x.price || x.basePrice || 0),
        stock: typeof v.stock === "number" ? v.stock : 50,
        hsnCode: String(v.hsnCode || "61091000"),
        gstPercentage: typeof v.gstPercentage === "number" ? v.gstPercentage : 5.0,
        weight: typeof v.weight === "number" ? v.weight : 0.2,
      }));
    }
    return adminRequest<any>("put", "/products/" + id, payload).then(adaptProduct);
  },
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
  getShippingLabel: (id: string) =>
    adminRequest<{ labelUrl: string }>("get", "/orders/" + id + "/shipping-label"),
  getManifest: (id: string) =>
    adminRequest<{ manifestUrl: string }>("get", "/orders/" + id + "/manifest"),
  deleteOrder: (id: string) =>
    adminRequest<{ id: string }>("delete", "/orders/" + id).then((x) => x.id),
  getQueries: (params?: { search?: string; status?: string; page?: number; limit?: number }) =>
    adminRequest<any>("get", "/queries", undefined, { params }).then((r) => {
      const items = Array.isArray(r) ? r : r?.items || r?.data || [];
      return items as ContactQuery[];
    }),
  createQuery: (data: AdminQueryInput) =>
    adminRequest<ContactQuery>("post", "/queries", data),
  updateQuery: (id: string, data: Partial<AdminQueryInput>) =>
    adminRequest<ContactQuery>("put", "/queries/" + id, data),
  updateQueryStatus: (id: string, status: "PENDING" | "RESOLVED" | "ARCHIVED") =>
    adminRequest<ContactQuery>("patch", "/queries/" + id + "/status", { status }),
  deleteQuery: (id: string) =>
    adminRequest<{ id: string }>("delete", "/queries/" + id).then((x) => x.id || id),

  getProductReviews: async (productId: string): Promise<AdminProductReview[]> => {
    const res = await unwrapApiResponse<any[]>(
      apiClient.get("/orders/reviews", { params: { productId } })
    );
    return (Array.isArray(res) ? res : []).map(adaptAdminProductReview);
  },
  getAnalytics: (timeframe: string = "30d") =>
    adminRequest<BusinessAnalytics>("get", "/analytics", undefined, { params: { timeframe } }),
  getCoupons: (params?: CouponQueryParams): Promise<CouponListResponse> =>
    adminRequest<any>("get", "/coupons", undefined, { params }).then((r) => {
      const rawList = Array.isArray(r) ? r : r?.items || r?.coupons || r?.data || [];
      const coupons = rawList.map(adaptCoupon);
      const total = typeof r?.total === "number" ? r.total : coupons.length;
      const activeCount =
        typeof r?.activeCount === "number"
          ? r.activeCount
          : coupons.filter((c: AdminCoupon) => c.isActive).length;
      const expiredCount = typeof r?.expiredCount === "number" ? r.expiredCount : 0;
      return {
        coupons,
        items: coupons,
        total,
        activeCount,
        expiredCount,
        pagination: r?.pagination || {
          page: 1,
          limit: coupons.length,
          total,
          pages: 1,
        },
      };
    }),
  getCoupon: (id: string): Promise<AdminCoupon> =>
    adminRequest<any>("get", "/coupons/" + id).then(adaptCoupon),
  createCoupon: (payload: CreateCouponDto): Promise<AdminCoupon> =>
    adminRequest<any>("post", "/coupons", payload).then(adaptCoupon),
  updateCoupon: (id: string, payload: UpdateCouponDto): Promise<AdminCoupon> =>
    adminRequest<any>("put", "/coupons/" + id, payload).then(adaptCoupon),
  toggleCouponStatus: (id: string): Promise<AdminCoupon> =>
    adminRequest<any>("patch", "/coupons/" + id + "/toggle").then(adaptCoupon),
  deleteCoupon: (id: string): Promise<string> =>
    adminRequest<{ id: string }>("delete", "/coupons/" + id).then((x) => x?.id || id),
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
export function useGetAdminOrderShippingLabel() {
  return useMutation({
    mutationFn: (id: string) => adminService.getShippingLabel(id),
  });
}
export function useGetAdminOrderManifest() {
  return useMutation({
    mutationFn: (id: string) => adminService.getManifest(id),
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

export function useCreateAdminQuery() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminQueryInput) => adminService.createQuery(data),
    onSuccess: () => {
      q.invalidateQueries({ queryKey: ["admin", "queries"] });
    },
  });
}

export function useUpdateAdminQuery() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminQueryInput> }) =>
      adminService.updateQuery(id, data),
    onSuccess: () => {
      q.invalidateQueries({ queryKey: ["admin", "queries"] });
    },
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

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: ["admin", "products", productId, "reviews"],
    queryFn: () => adminService.getProductReviews(productId),
    enabled: Boolean(productId),
  });
}

export function useBusinessAnalytics(timeframe: string = "30d") {
  return useQuery({
    queryKey: ["admin", "analytics", timeframe],
    queryFn: () => adminService.getAnalytics(timeframe),
    staleTime: 60 * 1000,
  });
}

export function useAdminCoupons(params?: CouponQueryParams) {
  return useQuery({
    queryKey: ["admin", "coupons", params],
    queryFn: () => adminService.getCoupons(params),
  });
}

export function useAdminCoupon(id: string) {
  return useQuery({
    queryKey: ["admin", "coupons", id],
    queryFn: () => adminService.getCoupon(id),
    enabled: Boolean(id),
  });
}

export function useCreateAdminCoupon() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCouponDto) => adminService.createCoupon(data),
    onSuccess: () => {
      q.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
  });
}

export function useUpdateAdminCoupon() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCouponDto }) =>
      adminService.updateCoupon(id, data),
    onSuccess: () => {
      q.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
  });
}

export function useToggleAdminCoupon() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.toggleCouponStatus(id),
    onSuccess: () => {
      q.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
  });
}

export function useDeleteAdminCoupon() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deleteCoupon(id),
    onSuccess: () => {
      q.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
  });
}

export { useColors, useCreateColor, useDeleteColor, useColorSwatchMap, type ColorItem } from "./product";



