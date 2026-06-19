import { CATEGORIES } from "@/data/categories";
import { ORDERS } from "@/data/orders";
import { PRODUCTS } from "@/data/products";
import { USERS } from "@/data/users";
import { MOCK_ADDRESSES, MOCK_ORDERS, MOCK_PROFILE } from "@/features/account/data/mockAccount";
import type {
  Address, AdminCategory, AdminOrder, AdminUser, Cart, CartItem, Order, Product,
  Profile, Review, User, Wishlist,
} from "@/types/entities";
import type { CheckoutRequestDto, CheckoutResponseDto, CreateOrderRequestDto } from "@/types/api/commerce";
import type { LoginRequestDto, RegisterRequestDto } from "@/types/api/auth";
import type { CreateProductRequestDto, UpdateProductRequestDto } from "@/types/api/catalog";
import type { CreateReviewRequestDto } from "@/types/api/reviews";
import { STOREFRONT_CATEGORIES } from "./mock/data/storefrontCategories";
import { simulateNetworkLatency } from "./mock/latency";
import type { MockApiError, MockApiResponse } from "./mock/response";

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

let products: Product[] = [...PRODUCTS];
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
  getAll: () => respond(() => ok([...products])),
  getFeatured: () => respond(() => ok(products.filter((product) => product.status === "active").slice(0, 4))),
  getById: (id: string) => respond(() => {
    const product = products.find((item) => item.id === id);
    return product ? ok(product) : fail("PRODUCT_NOT_FOUND", "Product not found");
  }),
  getRelated: (id: string, limit = 4) => respond(() => {
    const current = products.find((item) => item.id === id);
    const ordered = current
      ? products.filter((item) => item.id !== id && item.category === current.category)
          .concat(products.filter((item) => item.id !== id && item.category !== current.category))
      : products;
    return ok(ordered.slice(0, limit));
  }),
  create: (input: CreateProductRequestDto) => respond(() => {
    const product: Product = {
      ...input,
      id: `p-${Math.random().toString(36).slice(2, 11)}`,
      rating: 5,
      reviews: [],
      popularity: 0,
      createdAt: new Date().toISOString(),
    };
    products = [product, ...products];
    return ok(product);
  }),
  update: (id: string, patch: UpdateProductRequestDto["data"]) => respond(() => {
    const index = products.findIndex((item) => item.id === id);
    if (index < 0) return fail("PRODUCT_NOT_FOUND", "Product not found");
    products[index] = { ...products[index], ...patch };
    return ok(products[index]);
  }),
  toggleStatus: (id: string) => respond(() => {
    const index = products.findIndex((item) => item.id === id);
    if (index < 0) return fail("PRODUCT_NOT_FOUND", "Product not found");
    products[index] = { ...products[index], status: products[index].status === "active" ? "inactive" : "active" };
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
    getAll: () => respond(() => ok([...STOREFRONT_CATEGORIES])),
  },
  auth: {
    login: (input: LoginRequestDto) => respond<{ user: User }>(() => ok({ user: { email: input.email, firstName: "Kamira", lastName: "User" } })),
    loginCustomer: (email: string) => respond(() => ok({ role: "customer" as const, user: { email, firstName: "Kamira", lastName: "User" } })),
    loginAdmin: (email: string, password: string) => respond(() => email === "admin@kamirafit.com" && password === "admin"
      ? ok({ role: "admin" as const, user: { email, firstName: "Super", lastName: "Admin" } })
      : fail("INVALID_CREDENTIALS", "Invalid admin credentials.")),
    register: (input: RegisterRequestDto) => respond<{ user: User }>(() => ok({ user: { email: input.email, firstName: input.firstName, lastName: input.lastName } })),
    registerCustomer: (input: RegisterRequestDto) => respond(() => ok({ role: "customer" as const, user: { email: input.email, firstName: input.firstName, lastName: input.lastName } })),
    refresh: () => respond(() => ok({ accessToken: "mock-new-access-token" })),
    logout: () => respond(() => ok(undefined)),
    getProfile: () => respond(() => ok({ ...profile })),
    updateProfile: (input: Profile) => respond(() => { profile = { ...input }; return ok({ ...profile }); }),
  },
  cart: {
    get: () => respond(() => ok({ ...cart, items: [...cart.items] })),
    update: (items: CartItem[]) => respond(() => { cart = { ...cart, items: [...items], updatedAt: new Date().toISOString() }; return ok(cart); }),
  },
  checkout: {
    place: (input: CheckoutRequestDto): Promise<MockApiResponse<CheckoutResponseDto["data"]>> => respond(() => {
      const orderItems = input.items.flatMap((item) => {
        const product = products.find((candidate) => candidate.id === item.id);
        return product ? [{ productId: product.id, productName: product.name, productImage: product.image, quantity: item.quantity, size: item.size ?? "", color: item.color ?? "", price: product.price }] : [];
      });
      const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0) + 79;
      const order: Order = { id: `ORD-KF-${Math.floor(10000 + Math.random() * 90000)}`, date: new Date().toISOString(), status: "Pending", items: orderItems, totalAmount, shippingAddress: { ...input.shippingAddress, id: `addr-${Date.now()}`, isDefault: false }, paymentMethod: input.paymentMethod };
      customerOrders = [order, ...customerOrders];
      cart = { ...cart, items: [] };
      return ok({ order });
    }),
  },
  orders: {
    getAll: () => respond(() => ok([...customerOrders])),
    create: (input: CreateOrderRequestDto) => respond(() => {
      const order: Order = { ...input, id: `ORD-KF-${Math.floor(10000 + Math.random() * 90000)}`, date: new Date().toISOString(), status: "Pending" };
      customerOrders = [order, ...customerOrders];
      return ok(order);
    }),
  },
  wishlist: {
    getAll: () => respond(() => ok({ ...wishlist, productIds: [...wishlist.productIds] })),
    update: (productIds: string[]) => respond(() => {
      wishlist = { ...wishlist, productIds: [...productIds], updatedAt: new Date().toISOString() };
      return ok(wishlist);
    }),
    toggle: (productId: string) => respond(() => {
      wishlist = { ...wishlist, productIds: wishlist.productIds.includes(productId) ? wishlist.productIds.filter((id) => id !== productId) : [...wishlist.productIds, productId], updatedAt: new Date().toISOString() };
      return ok(wishlist);
    }),
  },
  addresses: {
    getAll: () => respond(() => ok([...addresses])),
    create: (input: Omit<Address, "id">) => respond(() => { const address = { ...input, id: `addr-${Math.random().toString(36).slice(2, 11)}` }; addresses = [...addresses, address]; return ok(address); }),
    update: (id: string, patch: Partial<Omit<Address, "id">>) => respond(() => { const index = addresses.findIndex((item) => item.id === id); if (index < 0) return fail("ADDRESS_NOT_FOUND", "Address not found"); addresses[index] = { ...addresses[index], ...patch }; return ok(addresses[index]); }),
    delete: (id: string) => respond(() => { if (!addresses.some((item) => item.id === id)) return fail("ADDRESS_NOT_FOUND", "Address not found"); addresses = addresses.filter((item) => item.id !== id); return ok(id); }),
  },
  reviews: {
    getAll: (productId: string) => respond(() => ok(products.find((item) => item.id === productId)?.reviews ?? [])),
    create: (input: CreateReviewRequestDto) => respond(() => {
      const review: Review = { ...input, id: `rev-${Math.random().toString(36).slice(2, 11)}`, customerName: "Anonymous", createdAt: new Date().toISOString() };
      const index = products.findIndex((item) => item.id === input.productId);
      if (index < 0) return fail("PRODUCT_NOT_FOUND", "Product not found");
      products[index] = { ...products[index], reviews: [...products[index].reviews, review] };
      return ok(review);
    }),
  },
  admin: {
    getStats: () => respond(() => ok({ salesTotal: adminOrders.filter((order) => order.paymentStatus === "Paid").reduce((sum, order) => sum + order.total, 0) || 125400, ordersCount: adminOrders.length, productsCount: products.length, usersCount: adminUsers.length })),
    categories: {
      getAll: () => respond(() => ok([...adminCategories])),
      create: (input: Omit<AdminCategory, "id">) => respond(() => { const category = { ...input, id: `c-${Date.now().toString(36)}` }; adminCategories = [...adminCategories, category]; return ok(category); }),
      update: (id: string, patch: Partial<Omit<AdminCategory, "id">>) => respond(() => { const index = adminCategories.findIndex((item) => item.id === id); if (index < 0) return fail("CATEGORY_NOT_FOUND", "Category not found"); adminCategories[index] = { ...adminCategories[index], ...patch }; return ok(adminCategories[index]); }),
      delete: (id: string) => respond(() => { if (!adminCategories.some((item) => item.id === id)) return fail("CATEGORY_NOT_FOUND", "Category not found"); adminCategories = adminCategories.filter((item) => item.id !== id); return ok(id); }),
    },
    products: productApi,
    users: {
      getAll: () => respond(() => ok([...adminUsers])),
      update: (id: string, patch: Partial<Omit<AdminUser, "id">>) => respond(() => { const index = adminUsers.findIndex((item) => item.id === id); if (index < 0) return fail("USER_NOT_FOUND", "User not found"); adminUsers[index] = { ...adminUsers[index], ...patch }; return ok(adminUsers[index]); }),
    },
    orders: {
      getAll: () => respond(() => ok([...adminOrders])),
      update: (id: string, patch: Partial<Omit<AdminOrder, "id">>) => respond(() => { const index = adminOrders.findIndex((item) => item.id === id); if (index < 0) return fail("ORDER_NOT_FOUND", "Order not found"); adminOrders[index] = { ...adminOrders[index], ...patch }; return ok(adminOrders[index]); }),
      delete: (id: string) => respond(() => { if (!adminOrders.some((item) => item.id === id)) return fail("ORDER_NOT_FOUND", "Order not found"); adminOrders = adminOrders.filter((item) => item.id !== id); return ok(id); }),
    },
  },
};

export type MockApi = typeof mockApi;
export { MOCK_API_DELAY_MS, simulateNetworkLatency } from "./mock/latency";
export { MockApiRequestError, unwrapMockResponse } from "./mock/response";
export type { MockApiError, MockApiResponse } from "./mock/response";
