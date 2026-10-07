import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, unwrapApiResponse } from "@/api/client";
import {
  adaptProduct,
  type AdminCategory,
  type AdminOrder as Order,
  type AdminUser,
  type Address,
  type ContactQuery,
  type AdminQueryInput,
  type Product,
  type BusinessAnalytics,
  type AdminCoupon,
  type CreateCouponDto,
  type UpdateCouponDto,
  type CouponQueryParams,
  type CouponListResponse,
  type AdminReview,
  type AdminReviewStatus,
  type AdminReviewListResult,
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

export interface AdminCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  subcategories?: string[];
  parentId?: string | null;
}

export interface AdminProductCreateInput {
  name: string;
  title?: string;
  description?: string;
  brand?: string;
  categoryId?: string;
  category?: string;
  categoryName?: string;
  subcategory?: string;
  baseMrp?: number;
  basePrice?: number;
  mrp?: number;
  price?: number;
  costPrice?: number;
  images?: string[];
  image?: string;
  imageColorMap?: Record<string, string> | Array<{ src: string; color: string }>;
  isFeatured?: boolean;
  status?: string;
  slug?: string;
  size?: string[];
  color?: string[];
  variants?: Array<{
    size?: string;
    color?: string;
    sku?: string;
    mrp?: number;
    offerPrice?: number;
    price?: number;
    stock?: number;
    hsnCode?: string;
    gstPercentage?: number;
    weight?: number;
  }>;
}

export interface AdminProductUpdateInput {
  name?: string;
  title?: string;
  description?: string;
  brand?: string;
  status?: string;
  isFeatured?: boolean;
  price?: number;
  basePrice?: number;
  mrp?: number;
  baseMrp?: number;
  costPrice?: number;
  categoryId?: string;
  category?: string;
  subcategory?: string;
  images?: string[];
  image?: string;
  imageColorMap?: Record<string, string> | Array<{ src: string; color: string }>;
  slug?: string;
  variants?: Array<{
    id?: string;
    size?: string;
    color?: string;
    sku?: string;
    mrp?: number;
    offerPrice?: number;
    price?: number;
    stock?: number;
    hsnCode?: string;
    gstPercentage?: number;
    weight?: number;
  }>;
}

export interface AdminUserUpdateInput {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

export interface AdminOrderUpdateInput {
  orderStatus?: string;
  status?: string;
  paymentStatus?: string;
  notes?: string;
  customer?: { name?: string; phone?: string; address?: string };
  items?: Order["items"];
  [key: string]: unknown;
}

import type { AxiosRequestConfig } from "axios";

export function adaptAdminProductReview(raw: unknown): AdminProductReview {
  const r = ((raw && typeof raw === "object" && "data" in raw ? (raw as { data: unknown }).data : raw) || {}) as Record<string, unknown>;
  const user = r.user as { firstName?: string; lastName?: string; email?: string } | undefined;
  return {
    id: String(r.id || r._id || ""),
    productId: String(r.productId || ""),
    userId: String(r.userId || ""),
    rating: typeof r.rating === "number" ? r.rating : 5,
    comment: String(r.comment || r.content || ""),
    images: Array.isArray(r.images) ? (r.images as string[]) : [],
    createdAt: String(r.createdAt || new Date().toISOString()),
    user: {
      firstName: user?.firstName || String(r.customerName || "Customer"),
      lastName: user?.lastName || "",
      email: user?.email || "",
    },
  };
}

export function adaptCategory(raw: unknown): AdminCategory {
  const c = ((raw && typeof raw === "object" && "data" in raw ? (raw as { data: unknown }).data : raw) || {}) as Record<string, unknown>;
  return {
    id: String(c.id || c._id || ""),
    name: String(c.name || ""),
    slug: String(c.slug || (c.name ? String(c.name).toLowerCase().replace(/[\s_]+/g, "-") : "")),
    description: String(c.description || ""),
    image: String(c.image || ""),
    subcategories: Array.isArray(c.subcategories)
      ? c.subcategories
          .map((s: unknown) =>
            typeof s === "string"
              ? s
              : s && typeof s === "object" && "name" in s
              ? String((s as { name?: string }).name || "")
              : ""
          )
          .filter(Boolean)
      : [],
    parentId: (c.parentId as string | null) || null,
  };
}

export function adaptAdminAddress(raw: unknown): Address {
  const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const street = String(item.addressLine1 || item.street || "");
  const pin = String(item.pincode || item.postalCode || "");
  const validTypes = ["Home", "Work", "Other"] as const;
  const rawType = String(item.type || "Home");
  const type = validTypes.includes(rawType as (typeof validTypes)[number])
    ? (rawType as (typeof validTypes)[number])
    : "Home";

  return {
    id: String(item.id || `addr-${Math.random()}`),
    type,
    fullName: String(item.fullName || "Customer"),
    phoneNumber: String(item.phoneNumber || item.phone || ""),
    addressLine1: street,
    addressLine2: item.addressLine2 ? String(item.addressLine2) : undefined,
    landmark: item.landmark ? String(item.landmark) : undefined,
    city: String(item.city || ""),
    state: String(item.state || ""),
    pincode: pin,
    country: String(item.country || "India"),
    isDefault: Boolean(item.isDefault),
  };
}

export function adaptUser(raw: unknown): AdminUser {
  const u = ((raw && typeof raw === "object" && "data" in raw ? (raw as { data: unknown }).data : raw) || {}) as Record<string, unknown>;
  const rawAddresses = Array.isArray(u.addresses) ? u.addresses : [];
  const addresses: Address[] = rawAddresses.map(adaptAdminAddress);
  const fullName =
    u.firstName || u.lastName
      ? `${String(u.firstName || "")} ${String(u.lastName || "")}`.trim()
      : String(u.name || "Customer");

  const defaultOrFirst = addresses.find((a) => a.isDefault) || addresses[0];
  const formattedAddress = defaultOrFirst
    ? [
        defaultOrFirst.addressLine1,
        defaultOrFirst.addressLine2,
        defaultOrFirst.city,
        defaultOrFirst.state,
        defaultOrFirst.pincode,
      ].filter(Boolean).join(", ")
    : "";

  return {
    id: String(u.id || u._id || ""),
    name: fullName,
    email: String(u.email || ""),
    phone: String(u.phoneNumber || u.phone || ""),
    address: String(u.address || "") || formattedAddress,
    addresses,
    isActive: typeof u.isActive === "boolean" ? u.isActive : true,
    firstName: u.firstName ? String(u.firstName) : undefined,
    lastName: u.lastName ? String(u.lastName) : undefined,
    phoneNumber: u.phoneNumber ? String(u.phoneNumber) : undefined,
    ordersCount: typeof u.ordersCount === "number" ? u.ordersCount : (u.ordersCount !== undefined && u.ordersCount !== null ? Number(u.ordersCount) : 0),
    hasPurchased: typeof u.hasPurchased === "boolean" ? u.hasPurchased : Boolean(u.ordersCount && Number(u.ordersCount) > 0),
    lastOrderAmount: u.lastOrderAmount !== undefined && u.lastOrderAmount !== null ? Number(u.lastOrderAmount) : null,
    lastOrderDate: u.lastOrderDate ? String(u.lastOrderDate) : null,
    lastOrderStatus: u.lastOrderStatus ? String(u.lastOrderStatus) : null,
  };
}

export function adaptAdminReview(raw: unknown): AdminReview {
  const r = ((raw && typeof raw === "object" && "data" in raw ? (raw as { data: unknown }).data : raw) || {}) as Record<string, unknown>;
  const rawCustomer = (r.customer || r.user || {}) as Record<string, unknown>;
  const rawProduct = (r.product || {}) as Record<string, unknown>;

  const customerName =
    String(rawCustomer.name || "") ||
    (rawCustomer.firstName || rawCustomer.lastName
      ? `${String(rawCustomer.firstName || "")} ${String(rawCustomer.lastName || "")}`.trim()
      : "Verified Customer");

  const images = Array.isArray(r.images)
    ? (r.images as unknown[]).map(String)
    : [];

  return {
    id: String(r.id || ""),
    rating: Number(r.rating || 5),
    comment: r.comment ? String(r.comment) : "",
    status: (r.status === "APPROVED" || r.status === "REJECTED" ? r.status : "PENDING") as AdminReviewStatus,
    createdAt: String(r.createdAt || new Date().toISOString()),
    updatedAt: r.updatedAt ? String(r.updatedAt) : undefined,
    images,
    customer: {
      id: rawCustomer.id ? String(rawCustomer.id) : undefined,
      name: customerName,
      email: rawCustomer.email ? String(rawCustomer.email) : undefined,
      phone: String(rawCustomer.phone || rawCustomer.mobileNumber || rawCustomer.phoneNumber || ""),
    },
    product: {
      id: rawProduct.id ? String(rawProduct.id) : undefined,
      name: String(rawProduct.name || rawProduct.title || "Product"),
      slug: rawProduct.slug ? String(rawProduct.slug) : undefined,
      image: rawProduct.image ? String(rawProduct.image) : undefined,
    },
  };
}

export function adaptOrder(raw: unknown): Order {
  const o = ((raw && typeof raw === "object" && "data" in raw ? (raw as { data: unknown }).data : raw) || {}) as Record<string, unknown>;
  const rawCustomer = (o.customer || o.shippingAddress || {}) as Record<string, unknown>;
  const customerName =
    String(rawCustomer.name || "") ||
    (rawCustomer.firstName || rawCustomer.lastName
      ? `${String(rawCustomer.firstName || "")} ${String(rawCustomer.lastName || "")}`.trim()
      : "Customer");

  const rawItems = Array.isArray(o.items) ? o.items : [];
  const items = rawItems.map((itRaw: unknown, index: number) => {
    const it = (itRaw && typeof itRaw === "object" ? itRaw : {}) as Record<string, unknown>;
    return {
      productId: String(it.productId || it.id || `p-${index}`),
      name: String(it.name || it.productName || it.title || "Product"),
      price: typeof it.price === "number" ? it.price : Number(it.unitPrice || 0),
      quantity: typeof it.quantity === "number" ? it.quantity : 1,
      size: String(it.size || "M"),
      color: String(it.color || "Black"),
      image: String(it.image || it.productImage || ""),
    };
  });

  const subtotal = items.reduce((sum: number, it) => sum + it.price * it.quantity, 0);
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
    id: String(o.id || o._id || o.orderNumber || ""),
    createdAt: String(o.createdAt || new Date().toISOString()),
    customer: {
      name: customerName,
      phone: String(rawCustomer.phone || rawCustomer.phoneNumber || ""),
      address:
        typeof rawCustomer.address === "string"
          ? rawCustomer.address
          : rawCustomer.street
          ? `${String(rawCustomer.street)}, ${String(rawCustomer.city || "")}`
          : "",
    },
    items,
    subtotal,
    deliveryFee,
    total,
    totalAmount: total,
    paymentStatus: (o.paymentStatus || (o.isPaid ? "Paid" : "Pending")) as Order["paymentStatus"],
    paymentMethod: String(o.paymentMethod || "ONLINE"),
    orderStatus: (o.orderStatus || o.status || "Confirmed") as Order["orderStatus"],
    trackingCode: (o.trackingCode || o.trackingNumber) as string | undefined,
    courierName: (o.courierName || o.carrier) as string | undefined,
    trackingUrl: o.trackingUrl as string | undefined,
    notes: o.notes as string | undefined,
    cancelReason: (o.cancelReason || (o as { cancellationReason?: string }).cancellationReason) as string | undefined,
    returnReason: o.returnReason as string | undefined,
  };
}

export function adaptCoupon(raw: unknown): AdminCoupon {
  const c = ((raw && typeof raw === "object" && "data" in raw ? (raw as { data: unknown }).data : raw) || {}) as Record<string, unknown>;
  const discountVal = Number(c.discountValue ?? c.discountVal ?? 0);
  return {
    id: String(c.id || ""),
    code: String(c.code || ""),
    discountType: c.discountType === "FIXED" || c.discountType === "FIXED_AMOUNT" ? "FIXED_AMOUNT" : "PERCENTAGE",
    discountValue: discountVal,
    discountVal,
    maxDiscount: c.maxDiscount != null ? Number(c.maxDiscount) : null,
    minOrderVal: c.minOrderVal != null ? Number(c.minOrderVal) : null,
    startDate: String(c.startDate || new Date().toISOString()),
    endDate: (c.endDate as string | null) || null,
    applicableCategoryIds: Array.isArray(c.applicableCategoryIds) ? (c.applicableCategoryIds as string[]) : [],
    usageLimit: c.usageLimit != null ? Number(c.usageLimit) : null,
    usedCount: Number(c.usedCount || 0),
    description: (c.description as string | null) || null,
    isActive: typeof c.isActive === "boolean" ? c.isActive : true,
    createdAt: String(c.createdAt || new Date().toISOString()),
    updatedAt: String(c.updatedAt || new Date().toISOString()),
    _count: c._count as { orders?: number } | undefined,
  };
}

async function adminRequest<T>(
  method: "get" | "post" | "put" | "patch" | "delete",
  path: string,
  data?: unknown,
  config?: AxiosRequestConfig
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
    adminRequest<unknown[] | { data?: unknown[] }>("get", "/categories").then((r) => {
      const items = Array.isArray(r) ? r : (r && typeof r === "object" && "data" in r && Array.isArray((r as { data: unknown[] }).data) ? (r as { data: unknown[] }).data : []);
      return items.map(adaptCategory);
    }),
  createCategory: (x: AdminCategoryInput) => {
    const slug = x.slug || (x.name ? x.name.toLowerCase().replace(/[\s_]+/g, "-") : "");
    return adminRequest<AdminCategory>("post", "/categories", { ...x, slug }).then(adaptCategory);
  },
  updateCategory: (id: string, x: Partial<AdminCategoryInput>) =>
    adminRequest<AdminCategory>("put", "/categories/" + id, x).then(adaptCategory),
  deleteCategory: (id: string) =>
    adminRequest<{ id: string }>("delete", "/categories/" + id).then((x) => x.id),
  getProducts: (params?: { page?: number; limit?: number; search?: string; category?: string }) =>
    adminRequest<unknown[] | { data?: unknown[] }>("get", "/products", undefined, { params }).then((r) => {
      const items = Array.isArray(r) ? r : (r && typeof r === "object" && "data" in r && Array.isArray((r as { data: unknown[] }).data) ? (r as { data: unknown[] }).data : []);
      return items.map(adaptProduct);
    }),
  createProduct: (x: AdminProductCreateInput) => {
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
          ? x.variants.map((v) => ({
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
    return adminRequest<unknown>("post", "/products", payload).then(adaptProduct);
  },
  updateProduct: (id: string, x: AdminProductUpdateInput) => {
    const payload: Record<string, unknown> = {
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
      payload.variants = x.variants.map((v) => ({
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
    return adminRequest<unknown>("put", "/products/" + id, payload).then(adaptProduct);
  },
  toggleProductStatus: (id: string) =>
    adminRequest<unknown>("patch", "/products/" + id + "/toggle").then(adaptProduct),
  deleteProduct: (id: string) =>
    adminRequest<{ id: string }>("delete", "/products/" + id).then((x) => x.id),
  getUsers: (params?: { search?: string; filter?: string; page?: number; limit?: number }) =>
    adminRequest<unknown[] | { data?: unknown[] }>("get", "/users", undefined, { params }).then((r) => {
      const items = Array.isArray(r) ? r : (r && typeof r === "object" && "data" in r && Array.isArray((r as { data: unknown[] }).data) ? (r as { data: unknown[] }).data : []);
      return items.map(adaptUser);
    }),
  updateUser: (id: string, x: AdminUserUpdateInput) => {
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
  getUserAddresses: (userId: string) =>
    adminRequest<unknown[] | { data?: unknown[] }>("get", `/users/${userId}/addresses`).then((r) => {
      const items = Array.isArray(r) ? r : (r && typeof r === "object" && "data" in r && Array.isArray((r as { data: unknown[] }).data) ? (r as { data: unknown[] }).data : []);
      return items.map(adaptAdminAddress);
    }),
  createUserAddress: (userId: string, data: Partial<Address>) =>
    adminRequest<unknown>("post", `/users/${userId}/addresses`, data).then(adaptAdminAddress),
  updateUserAddress: (userId: string, addressId: string, data: Partial<Address>) =>
    adminRequest<unknown>("put", `/users/${userId}/addresses/${addressId}`, data).then(adaptAdminAddress),
  deleteUserAddress: (userId: string, addressId: string) =>
    adminRequest<{ id: string }>("delete", `/users/${userId}/addresses/${addressId}`),
  getOrders: (params?: { status?: string; page?: number; limit?: number }) =>
    adminRequest<unknown[] | { data?: unknown[] }>("get", "/orders", undefined, { params }).then((r) => {
      const items = Array.isArray(r) ? r : (r && typeof r === "object" && "data" in r && Array.isArray((r as { data: unknown[] }).data) ? (r as { data: unknown[] }).data : []);
      return items.map(adaptOrder);
    }),
  updateOrder: (id: string, x: AdminOrderUpdateInput) => {
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
    adminRequest<unknown[] | { items?: ContactQuery[]; data?: ContactQuery[] }>("get", "/queries", undefined, { params }).then((r) => {
      const items = Array.isArray(r) ? r : (r && typeof r === "object" && "items" in r && Array.isArray((r as { items: ContactQuery[] }).items) ? (r as { items: ContactQuery[] }).items : (r && typeof r === "object" && "data" in r && Array.isArray((r as { data: ContactQuery[] }).data) ? (r as { data: ContactQuery[] }).data : []));
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
    const res = await unwrapApiResponse<unknown[]>(
      apiClient.get("/orders/reviews", { params: { productId } })
    );
    return (Array.isArray(res) ? res : []).map(adaptAdminProductReview);
  },
  getReviews: (params?: { status?: string; search?: string; page?: number; limit?: number }): Promise<AdminReviewListResult> =>
    adminRequest<AdminReviewListResult | { reviews?: AdminReview[]; data?: AdminReviewListResult }>("get", "/reviews", undefined, { params }).then((r) => {
      const res = (r && typeof r === "object" && "data" in r && r.data ? r.data : r) as Record<string, unknown>;
      const rawReviews = Array.isArray(res?.reviews) ? res.reviews : (Array.isArray(res?.data) ? res.data : (Array.isArray(r) ? r : []));
      const reviews = rawReviews.map(adaptAdminReview);
      const total = typeof res?.total === "number" ? res.total : reviews.length;
      const stats = (res?.stats && typeof res.stats === "object" ? res.stats : {
        total: reviews.length,
        pending: reviews.filter((x: AdminReview) => x.status === "PENDING").length,
        approved: reviews.filter((x: AdminReview) => x.status === "APPROVED").length,
        rejected: reviews.filter((x: AdminReview) => x.status === "REJECTED").length,
      }) as AdminReviewListResult["stats"];

      return {
        reviews,
        total,
        page: typeof res?.page === "number" ? res.page : 1,
        limit: typeof res?.limit === "number" ? res.limit : 20,
        stats,
      };
    }),
  moderateReview: (id: string, status: "APPROVED" | "REJECTED") =>
    adminRequest<AdminReview>("patch", "/reviews/" + id + "/status", { status }).then(adaptAdminReview),
  deleteReview: (id: string) =>
    adminRequest<{ id: string }>("delete", "/reviews/" + id).then((x) => x.id || id),
  getAnalytics: (timeframe: string = "30d") =>
    adminRequest<BusinessAnalytics>("get", "/analytics", undefined, { params: { timeframe } }),
  getCoupons: (params?: CouponQueryParams): Promise<CouponListResponse> =>
    adminRequest<Record<string, unknown>>("get", "/coupons", undefined, { params }).then((r) => {
      const rawList = Array.isArray(r) ? r : (Array.isArray(r?.items) ? (r.items as unknown[]) : (Array.isArray(r?.coupons) ? (r.coupons as unknown[]) : (Array.isArray(r?.data) ? (r.data as unknown[]) : [])));
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
        pagination: (r?.pagination as CouponListResponse["pagination"]) || {
          page: 1,
          limit: coupons.length,
          total,
          pages: 1,
        },
      };
    }),
  getCoupon: (id: string): Promise<AdminCoupon> =>
    adminRequest<unknown>("get", "/coupons/" + id).then(adaptCoupon),
  createCoupon: (payload: CreateCouponDto): Promise<AdminCoupon> =>
    adminRequest<unknown>("post", "/coupons", payload).then(adaptCoupon),
  updateCoupon: (id: string, payload: UpdateCouponDto): Promise<AdminCoupon> =>
    adminRequest<unknown>("put", "/coupons/" + id, payload).then(adaptCoupon),
  toggleCouponStatus: (id: string): Promise<AdminCoupon> =>
    adminRequest<unknown>("patch", "/coupons/" + id + "/toggle").then(adaptCoupon),
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
    mutationFn: ({ id, patch }: { id: string; patch: Partial<AdminCategoryInput> }) =>
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
    mutationFn: ({ id, patch }: { id: string; patch: AdminProductUpdateInput }) =>
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
export function useAdminUsers(params?: { search?: string; filter?: string; page?: number; limit?: number }) {
  return useQuery<AdminUser[]>({
    queryKey: ["admin", "users", params],
    queryFn: () => adminService.getUsers(params),
  });
}
export function useUpdateAdminUser() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: AdminUserUpdateInput }) =>
      adminService.updateUser(id, patch),
    onSuccess: () => q.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}
export function useAdminUserAddresses(userId?: string) {
  return useQuery<Address[]>({
    queryKey: ["admin", "users", userId, "addresses"],
    queryFn: () => adminService.getUserAddresses(userId!),
    enabled: Boolean(userId),
  });
}
export function useAdminCreateUserAddress() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<Address> }) =>
      adminService.createUserAddress(userId, data),
    onSuccess: (_, { userId }) => {
      q.invalidateQueries({ queryKey: ["admin", "users"] });
      q.invalidateQueries({ queryKey: ["admin", "users", userId, "addresses"] });
    },
  });
}
export function useAdminUpdateUserAddress() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      addressId,
      data,
    }: {
      userId: string;
      addressId: string;
      data: Partial<Address>;
    }) => adminService.updateUserAddress(userId, addressId, data),
    onSuccess: (_, { userId }) => {
      q.invalidateQueries({ queryKey: ["admin", "users"] });
      q.invalidateQueries({ queryKey: ["admin", "users", userId, "addresses"] });
    },
  });
}
export function useAdminDeleteUserAddress() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, addressId }: { userId: string; addressId: string }) =>
      adminService.deleteUserAddress(userId, addressId),
    onSuccess: (_, { userId }) => {
      q.invalidateQueries({ queryKey: ["admin", "users"] });
      q.invalidateQueries({ queryKey: ["admin", "users", userId, "addresses"] });
    },
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
    mutationFn: ({ id, patch }: { id: string; patch: AdminOrderUpdateInput }) =>
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

export function useAdminReviews(params?: { status?: string; search?: string; page?: number; limit?: number }) {
  return useQuery<AdminReviewListResult>({
    queryKey: ["admin", "reviews", params],
    queryFn: () => adminService.getReviews(params),
  });
}

export function useModerateAdminReview() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" }) =>
      adminService.moderateReview(id, status),
    onSuccess: () => {
      q.invalidateQueries({ queryKey: ["admin", "reviews"] });
      q.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useDeleteAdminReview() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deleteReview(id),
    onSuccess: () => {
      q.invalidateQueries({ queryKey: ["admin", "reviews"] });
      q.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export { useColors, useCreateColor, useDeleteColor, useColorSwatchMap, type ColorItem } from "./product";



