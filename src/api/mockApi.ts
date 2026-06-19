import { z } from "zod";
import { CATEGORIES } from "@/data/categories";
import { ORDERS } from "@/data/orders";
import { PRODUCTS } from "@/data/products";
import { USERS } from "@/data/users";
import { MOCK_ADDRESSES, MOCK_ORDERS, MOCK_PROFILE } from "@/features/account/data/mockAccount";
import type {
  Address, AdminCategory, AdminOrder, AdminUser, Cart, CartItem, Order,
  ProductEntity, Variant, Profile, Review, User, Wishlist,
} from "@/types/entities";
import type { CheckoutRequestDto, CheckoutResponseDto, CreateOrderRequestDto } from "@/types/api/commerce";
import type { LoginRequestDto, RegisterRequestDto } from "@/types/api/auth";
import type { CreateProductRequestDto, UpdateProductRequestDto } from "@/types/api/catalog";
import type { CreateReviewRequestDto } from "@/types/api/reviews";
import { STOREFRONT_CATEGORIES } from "./mock/data/storefrontCategories";
import { simulateNetworkLatency } from "./mock/latency";
import type { MockApiError, MockApiResponse } from "./mock/response";

import {
  safeValidate,
  CreateProductRequestDtoSchema,
  UpdateProductRequestDtoSchema,
  CheckoutRequestDtoSchema,
  CreateOrderRequestDtoSchema,
  LoginRequestDtoSchema,
  RegisterRequestDtoSchema,
  ProductEntitySchema,
  CategorySchema,
  CartSchema,
  CartItemSchema,
  OrderSchema,
  AddressSchema,
  ReviewSchema,
  AdminCategorySchema,
  AdminOrderSchema,
  WishlistSchema,
} from "@/schemas";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

const ok = <T>(data: T): MockApiResponse<T> => ({ success: true, data });
const fail = (code: string, message: string): MockApiResponse<never> => ({
  success: false,
  error: { code, message },
});

async function respond<T>(factory: () => MockApiResponse<T>): Promise<MockApiResponse<T>> {
  await simulateNetworkLatency();
  try {
    return factory();
  } catch (error: unknown) {
    const apiError: MockApiError = {
      code: "MOCK_API_ERROR",
      message: error instanceof Error ? error.message : "Mock API request failed",
    };
    return { success: false, error: apiError };
  }
}

let products: ProductEntity[] = [...PRODUCTS];
let adminCategories: AdminCategory[] = [...CATEGORIES];
const adminUsers: AdminUser[] = [...USERS];
let adminOrders: AdminOrder[] = [...ORDERS];
let addresses: Address[] = [...MOCK_ADDRESSES];
let customerOrders: Order[] = [...MOCK_ORDERS];
let profile: Profile = { ...MOCK_PROFILE };
let wishlist: Wishlist = { productIds: [] };
let cart: Cart = {
  items: [
    { id: "p-01", size: "M", color: "White", quantity: 1 },
    { id: "p-02", size: "L", color: "Black", quantity: 2 },
    { id: "p-04", size: "M", color: "Blue", quantity: 1 },
  ],
};

const productApi = {
  getAll: () => respond(() => {
    const data = [...products];
    safeValidate(z.array(ProductEntitySchema), data, "productApi.getAll (response)");
    return ok(data);
  }),
  getFeatured: () => respond(() => {
    const data = products.filter((product) => product.status === "active").slice(0, 4);
    safeValidate(z.array(ProductEntitySchema), data, "productApi.getFeatured (response)");
    return ok(data);
  }),
  getById: (id: string) => respond(() => {
    const product = products.find((item) => item.id === id);
    if (product) {
      safeValidate(ProductEntitySchema, product, "productApi.getById (response)");
      return ok(product);
    }
    return fail("PRODUCT_NOT_FOUND", "Product not found");
  }),
  getRelated: (id: string, limit = 4) => respond(() => {
    const current = products.find((item) => item.id === id);
    const ordered = current
      ? products.filter((item) => item.id !== id && item.category === current.category)
          .concat(products.filter((item) => item.id !== id && item.category !== current.category))
      : products;
    const data = ordered.slice(0, limit);
    safeValidate(z.array(ProductEntitySchema), data, "productApi.getRelated (response)");
    return ok(data);
  }),
  create: (input: CreateProductRequestDto) => respond(() => {
    const valReq = safeValidate(CreateProductRequestDtoSchema, input, "productApi.create (request)");
    if (!valReq.success) return fail("VALIDATION_ERROR", valReq.error.message);

    const id = `p-${Math.random().toString(36).slice(2, 11)}`;
    const title = input.title || input.name || "Unnamed Product";
    const slug = input.slug || slugify(title);
    const category = input.category;
    const brand = input.brand || "KamiraFit";
    const status = input.status || "active";
    const description = input.description || "";

    const variants: Variant[] = input.variants || [];
    if (variants.length === 0 && (input.size || input.color)) {
      const sizes = input.size || ["M"];
      const colors = input.color || ["Black"];
      const price = input.price || 0;
      const images = input.images || (input.image ? [input.image] : []);

      let varIdx = 1;
      colors.forEach(color => {
        sizes.forEach(size => {
          variants.push({
            id: `${id}-var-${varIdx++}`,
            sku: `KF-${category.toUpperCase().slice(0, 3)}-${id.toUpperCase()}-${color.toUpperCase()}-${size}`,
            color,
            size,
            inventory: { quantity: 50, reserved: 0, available: 50 },
            price,
            images,
            isAvailable: true
          });
        });
      });
    }

    const product: ProductEntity = {
      id,
      title,
      slug,
      description,
      category,
      brand,
      status,
      variants,
      metadata: {
        rating: 5,
        reviews: [],
        popularity: 0,
        createdAt: new Date().toISOString(),
      },
    };
    products = [product, ...products];
    safeValidate(ProductEntitySchema, product, "productApi.create (response)");
    return ok(product);
  }),
  update: (id: string, patch: UpdateProductRequestDto["data"]) => respond(() => {
    const valReq = safeValidate(UpdateProductRequestDtoSchema, { id, data: patch }, "productApi.update (request)");
    if (!valReq.success) return fail("VALIDATION_ERROR", valReq.error.message);

    const index = products.findIndex((item) => item.id === id);
    if (index < 0) return fail("PRODUCT_NOT_FOUND", "Product not found");

    const existing = products[index];
    const title = patch.title || patch.name || existing.title;
    const slug = patch.slug || (patch.title || patch.name ? slugify(title) : existing.slug);
    const brand = patch.brand || existing.brand;
    const description = patch.description || existing.description;
    const category = patch.category || existing.category;
    const status = patch.status || existing.status;

    let variants = patch.variants || existing.variants;
    if (!patch.variants && (patch.size || patch.color || patch.price !== undefined || patch.images || patch.image)) {
      const sizes = patch.size || existing.variants.map(v => v.size).filter((v, i, a) => a.indexOf(v) === i);
      const colors = patch.color || existing.variants.map(v => v.color).filter((v, i, a) => a.indexOf(v) === i);
      const price = patch.price !== undefined ? patch.price : (existing.variants[0]?.price ?? 0);
      const images = patch.images || existing.variants.flatMap(v => v.images).filter((v, i, a) => a.indexOf(v) === i);

      variants = [];
      let varIdx = 1;
      colors.forEach(color => {
        sizes.forEach(size => {
          variants.push({
            id: `${id}-var-${varIdx++}`,
            sku: `KF-${category.toUpperCase().slice(0, 3)}-${id.toUpperCase()}-${color.toUpperCase()}-${size}`,
            color,
            size,
            inventory: { quantity: 50, reserved: 0, available: 50 },
            price,
            images,
            isAvailable: true
          });
        });
      });
    }

    products[index] = {
      ...existing,
      title,
      slug,
      brand,
      description,
      category,
      status,
      variants,
      metadata: patch.metadata ? { ...existing.metadata, ...patch.metadata } : existing.metadata,
    };
    safeValidate(ProductEntitySchema, products[index], "productApi.update (response)");
    return ok(products[index]);
  }),
  toggleStatus: (id: string) => respond(() => {
    const index = products.findIndex((item) => item.id === id);
    if (index < 0) return fail("PRODUCT_NOT_FOUND", "Product not found");
    products[index] = { ...products[index], status: products[index].status === "active" ? "inactive" : "active" };
    safeValidate(ProductEntitySchema, products[index], "productApi.toggleStatus (response)");
    return ok(products[index]);
  }),
  delete: (id: string) => respond(() => {
    if (!products.some((item) => item.id === id)) return fail("PRODUCT_NOT_FOUND", "Product not found");
    products = products.filter((item) => item.id !== id);
    return ok(id);
  }),
};

export const mockApi = {
  products: productApi,
  categories: {
    getAll: () => respond(() => {
      const data = [...STOREFRONT_CATEGORIES];
      safeValidate(z.array(CategorySchema), data, "categories.getAll (response)");
      return ok(data);
    }),
  },
  auth: {
    login: (input: LoginRequestDto) => respond<{ user: User }>(() => {
      const valReq = safeValidate(LoginRequestDtoSchema, input, "auth.login (request)");
      if (!valReq.success) return fail("VALIDATION_ERROR", valReq.error.message);
      return ok({ user: { email: input.email, firstName: "Kamira", lastName: "User" } });
    }),
    loginCustomer: (email: string) => respond(() => ok({ role: "customer" as const, user: { email, firstName: "Kamira", lastName: "User" } })),
    loginAdmin: (email: string, password: string) => respond(() => email === "admin@kamirafit.com" && password === "admin"
      ? ok({ role: "admin" as const, user: { email, firstName: "Super", lastName: "Admin" } })
      : fail("INVALID_CREDENTIALS", "Invalid admin credentials.")),
    register: (input: RegisterRequestDto) => respond<{ user: User }>(() => {
      const valReq = safeValidate(RegisterRequestDtoSchema, input, "auth.register (request)");
      if (!valReq.success) return fail("VALIDATION_ERROR", valReq.error.message);
      return ok({ user: { email: input.email, firstName: input.firstName, lastName: input.lastName } });
    }),
    registerCustomer: (input: RegisterRequestDto) => respond(() => {
      const valReq = safeValidate(RegisterRequestDtoSchema, input, "auth.registerCustomer (request)");
      if (!valReq.success) return fail("VALIDATION_ERROR", valReq.error.message);
      return ok({ role: "customer" as const, user: { email: input.email, firstName: input.firstName, lastName: input.lastName } });
    }),
    refresh: () => respond(() => ok({ accessToken: "mock-new-access-token" })),
    logout: () => respond(() => ok(undefined)),
    getProfile: () => respond(() => ok({ ...profile })),
    updateProfile: (input: Profile) => respond(() => { profile = { ...input }; return ok({ ...profile }); }),
  },
  cart: {
    get: () => respond(() => {
      safeValidate(CartSchema, cart, "cart.get (response)");
      return ok({ ...cart, items: [...cart.items] });
    }),
    update: (items: CartItem[]) => respond(() => {
      const valReq = safeValidate(z.array(CartItemSchema), items, "cart.update (request)");
      if (!valReq.success) return fail("VALIDATION_ERROR", valReq.error.message);
      cart = { ...cart, items: [...items], updatedAt: new Date().toISOString() };
      safeValidate(CartSchema, cart, "cart.update (response)");
      return ok(cart);
    }),
  },
  checkout: {
    place: (input: CheckoutRequestDto): Promise<MockApiResponse<CheckoutResponseDto["data"]>> => respond(() => {
      const valReq = safeValidate(CheckoutRequestDtoSchema, input, "checkout.place (request)");
      if (!valReq.success) return fail("VALIDATION_ERROR", valReq.error.message);

      const orderItems = input.items.flatMap((item) => {
        const product = products.find((candidate) => candidate.id === item.id);
        if (!product) return [];

        const variant = product.variants.find(
          (v) => (!item.size || v.size === item.size) && (!item.color || v.color === item.color)
        ) || product.variants[0];

        const price = variant?.price ?? 0;
        const image = variant?.images[0] || "";

        return [{
          productId: product.id,
          productName: product.title,
          productImage: image,
          quantity: item.quantity,
          size: item.size ?? "",
          color: item.color ?? "",
          price: price
        }];
      });
      const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0) + 79;
      const order: Order = { id: `ORD-KF-${Math.floor(10000 + Math.random() * 90000)}`, date: new Date().toISOString(), status: "Pending", items: orderItems, totalAmount, shippingAddress: { ...input.shippingAddress, id: `addr-${Date.now()}`, isDefault: false }, paymentMethod: input.paymentMethod };
      customerOrders = [order, ...customerOrders];
      cart = { ...cart, items: [] };
      safeValidate(OrderSchema, order, "checkout.place (response)");
      return ok({ order });
    }),
  },
  orders: {
    getAll: () => respond(() => {
      const data = [...customerOrders];
      safeValidate(z.array(OrderSchema), data, "orders.getAll (response)");
      return ok(data);
    }),
    create: (input: CreateOrderRequestDto) => respond(() => {
      const valReq = safeValidate(CreateOrderRequestDtoSchema, input, "orders.create (request)");
      if (!valReq.success) return fail("VALIDATION_ERROR", valReq.error.message);

      const order: Order = { ...input, id: `ORD-KF-${Math.floor(10000 + Math.random() * 90000)}`, date: new Date().toISOString(), status: "Pending" };
      customerOrders = [order, ...customerOrders];
      safeValidate(OrderSchema, order, "orders.create (response)");
      return ok(order);
    }),
  },
  wishlist: {
    getAll: () => respond(() => {
      safeValidate(WishlistSchema, wishlist, "wishlist.getAll (response)");
      return ok({ ...wishlist, productIds: [...wishlist.productIds] });
    }),
    update: (productIds: string[]) => respond(() => {
      const valReq = safeValidate(z.array(z.string()), productIds, "wishlist.update (request)");
      if (!valReq.success) return fail("VALIDATION_ERROR", valReq.error.message);
      wishlist = { ...wishlist, productIds: [...productIds], updatedAt: new Date().toISOString() };
      safeValidate(WishlistSchema, wishlist, "wishlist.update (response)");
      return ok(wishlist);
    }),
    toggle: (productId: string) => respond(() => {
      wishlist = { ...wishlist, productIds: wishlist.productIds.includes(productId) ? wishlist.productIds.filter((id) => id !== productId) : [...wishlist.productIds, productId], updatedAt: new Date().toISOString() };
      safeValidate(WishlistSchema, wishlist, "wishlist.toggle (response)");
      return ok(wishlist);
    }),
  },
  addresses: {
    getAll: () => respond(() => {
      const data = [...addresses];
      safeValidate(z.array(AddressSchema), data, "addresses.getAll (response)");
      return ok(data);
    }),
    create: (input: Omit<Address, "id">) => respond(() => {
      const valReq = safeValidate(AddressSchema.omit({ id: true }), input, "addresses.create (request)");
      if (!valReq.success) return fail("VALIDATION_ERROR", valReq.error.message);

      const address = { ...input, id: `addr-${Math.random().toString(36).slice(2, 11)}` };
      addresses = [...addresses, address];
      safeValidate(AddressSchema, address, "addresses.create (response)");
      return ok(address);
    }),
    update: (id: string, patch: Partial<Omit<Address, "id">>) => respond(() => {
      const valReq = safeValidate(AddressSchema.omit({ id: true }).partial(), patch, "addresses.update (request)");
      if (!valReq.success) return fail("VALIDATION_ERROR", valReq.error.message);

      const index = addresses.findIndex((item) => item.id === id);
      if (index < 0) return fail("ADDRESS_NOT_FOUND", "Address not found");
      addresses[index] = { ...addresses[index], ...patch };
      safeValidate(AddressSchema, addresses[index], "addresses.update (response)");
      return ok(addresses[index]);
    }),
    delete: (id: string) => respond(() => {
      if (!addresses.some((item) => item.id === id)) return fail("ADDRESS_NOT_FOUND", "Address not found");
      addresses = addresses.filter((item) => item.id !== id);
      return ok(id);
    }),
  },
  reviews: {
    getAll: (productId: string) => respond(() => {
      const reviews = products.find((item) => item.id === productId)?.metadata.reviews ?? [];
      safeValidate(z.array(ReviewSchema), reviews, "reviews.getAll (response)");
      return ok(reviews);
    }),
    create: (input: CreateReviewRequestDto) => respond(() => {
      const valReq = safeValidate(ReviewSchema.omit({ id: true, customerName: true, createdAt: true }), input, "reviews.create (request)");
      if (!valReq.success) return fail("VALIDATION_ERROR", valReq.error.message);

      const review: Review = { ...input, id: `rev-${Math.random().toString(36).slice(2, 11)}`, customerName: "Anonymous", createdAt: new Date().toISOString() };
      const index = products.findIndex((item) => item.id === input.productId);
      if (index < 0) return fail("PRODUCT_NOT_FOUND", "Product not found");
      products[index] = {
        ...products[index],
        metadata: {
          ...products[index].metadata,
          reviews: [...products[index].metadata.reviews, review],
        },
      };
      safeValidate(ReviewSchema, review, "reviews.create (response)");
      return ok(review);
    }),
  },
  admin: {
    getStats: () => respond(() => ok({ salesTotal: adminOrders.filter((order) => order.paymentStatus === "Paid").reduce((sum, order) => sum + order.total, 0) || 125400, ordersCount: adminOrders.length, productsCount: products.length, usersCount: adminUsers.length })),
    categories: {
      getAll: () => respond(() => {
        const data = [...adminCategories];
        safeValidate(z.array(AdminCategorySchema), data, "admin.categories.getAll (response)");
        return ok(data);
      }),
      create: (input: Omit<AdminCategory, "id">) => respond(() => {
        const valReq = safeValidate(AdminCategorySchema.omit({ id: true }), input, "admin.categories.create (request)");
        if (!valReq.success) return fail("VALIDATION_ERROR", valReq.error.message);

        const category = { ...input, id: `c-${Date.now().toString(36)}` };
        adminCategories = [...adminCategories, category];
        safeValidate(AdminCategorySchema, category, "admin.categories.create (response)");
        return ok(category);
      }),
      update: (id: string, patch: Partial<Omit<AdminCategory, "id">>) => respond(() => {
        const valReq = safeValidate(AdminCategorySchema.omit({ id: true }).partial(), patch, "admin.categories.update (request)");
        if (!valReq.success) return fail("VALIDATION_ERROR", valReq.error.message);

        const index = adminCategories.findIndex((item) => item.id === id);
        if (index < 0) return fail("CATEGORY_NOT_FOUND", "Category not found");
        adminCategories[index] = { ...adminCategories[index], ...patch };
        safeValidate(AdminCategorySchema, adminCategories[index], "admin.categories.update (response)");
        return ok(adminCategories[index]);
      }),
      delete: (id: string) => respond(() => {
        if (!adminCategories.some((item) => item.id === id)) return fail("CATEGORY_NOT_FOUND", "Category not found");
        adminCategories = adminCategories.filter((item) => item.id !== id);
        return ok(id);
      }),
    },
    products: productApi,
    users: {
      getAll: () => respond(() => ok([...adminUsers])),
      update: (id: string, patch: Partial<Omit<AdminUser, "id">>) => respond(() => { const index = adminUsers.findIndex((item) => item.id === id); if (index < 0) return fail("USER_NOT_FOUND", "User not found"); adminUsers[index] = { ...adminUsers[index], ...patch }; return ok(adminUsers[index]); }),
    },
    orders: {
      getAll: () => respond(() => {
        const data = [...adminOrders];
        safeValidate(z.array(AdminOrderSchema), data, "admin.orders.getAll (response)");
        return ok(data);
      }),
      update: (id: string, patch: Partial<Omit<AdminOrder, "id">>) => respond(() => {
        const valReq = safeValidate(AdminOrderSchema.omit({ id: true }).partial(), patch, "admin.orders.update (request)");
        if (!valReq.success) return fail("VALIDATION_ERROR", valReq.error.message);

        const index = adminOrders.findIndex((item) => item.id === id);
        if (index < 0) return fail("ORDER_NOT_FOUND", "Order not found");
        adminOrders[index] = { ...adminOrders[index], ...patch };
        safeValidate(AdminOrderSchema, adminOrders[index], "admin.orders.update (response)");
        return ok(adminOrders[index]);
      }),
      delete: (id: string) => respond(() => { if (!adminOrders.some((item) => item.id === id)) return fail("ORDER_NOT_FOUND", "Order not found"); adminOrders = adminOrders.filter((item) => item.id !== id); return ok(id); }),
    },
  },
};

export type MockApi = typeof mockApi;
export { MOCK_API_DELAY_MS, simulateNetworkLatency } from "./mock/latency";
export { MockApiRequestError, unwrapMockResponse } from "./mock/response";
export type { MockApiError, MockApiResponse } from "./mock/response";
