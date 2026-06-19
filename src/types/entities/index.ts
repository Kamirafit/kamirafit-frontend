/** Canonical domain entities shared by UI state, mocks, services, and API DTOs. */

export type EntityId = string;
export type ISODateString = string;
export type ISODateTimeString = string;
export type CurrencyCode = "INR" | "USD";

export const PRODUCT_SIZES = ["S", "M", "L", "XL"] as const;
export type Size = (typeof PRODUCT_SIZES)[number];

export const PRODUCT_COLORS = ["Black", "White", "Blue", "Red"] as const;
export type Color = (typeof PRODUCT_COLORS)[number];

export const CATEGORY_NAMES = [
  "Kurti",
  "Co-ords Sets",
  "Dresses",
  "T-Shirts",
  "Oversized T-Shirts",
  "Hoodies",
] as const;
export type CategoryName = (typeof CATEGORY_NAMES)[number];

export const CATEGORY_SLUGS = [
  "kurti",
  "co-ords-sets",
  "dresses",
  "t-shirts",
  "oversized-t-shirts",
  "hoodies",
] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export interface Category {
  id: EntityId;
  name: CategoryName;
  slug: CategorySlug;
  image?: string;
  description?: string;
}

export interface AdminCategory {
  id: EntityId;
  name: string;
  subcategories: string[];
}

export const PRODUCT_STATUSES = ["active", "inactive"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export interface Review {
  id: EntityId;
  productId: EntityId;
  orderId?: EntityId;
  customerName: string;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  createdAt: ISODateTimeString;
  /** Legacy account-view alias. New APIs should use createdAt. */
  date?: ISODateString;
}

export interface Product {
  id: EntityId;
  name: string;
  price: number;
  category: CategoryName;
  size: Size[];
  color: Color[];
  rating: number;
  image: string;
  images: string[];
  description: string;
  reviews: Review[];
  createdAt: ISODateTimeString;
  popularity: number;
  status: ProductStatus;
}

export const ADDRESS_TYPES = ["Home", "Work", "Other"] as const;
export type AddressType = (typeof ADDRESS_TYPES)[number];

export interface Address {
  id: EntityId;
  type: AddressType;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export const GENDERS = ["Male", "Female", "Other"] as const;
export type Gender = (typeof GENDERS)[number];

export interface User {
  id?: EntityId;
  email: string;
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
  gender?: Gender | "";
}

export interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  gender: Gender | "";
}

export interface AdminUser {
  id: EntityId;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export const USER_ROLES = ["customer", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface AuthSession {
  isAuthenticated: boolean;
  role: UserRole | null;
  user: User | null;
  accessToken?: string;
  expiresAt?: ISODateTimeString;
}

/** Client cart line. `id` is the product identifier retained for Redux compatibility. */
export interface CartItem {
  id: EntityId;
  size?: Size;
  color?: Color;
  quantity: number;
}

export interface Cart {
  id?: EntityId;
  userId?: EntityId;
  items: CartItem[];
  updatedAt?: ISODateTimeString;
}

export interface Wishlist {
  id?: EntityId;
  userId?: EntityId;
  productIds: EntityId[];
  updatedAt?: ISODateTimeString;
}

export const ORDER_STATUSES = [
  "Pending", "Confirmed", "Processing", "Shipped", "In Transit", "Delivered",
  "Return Requested", "Return Approved", "Return In Progress", "Return Completed",
  "Refund Initiated", "Refund Completed", "Cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ADMIN_ORDER_STATUSES = [
  "Pending", "Confirmed", "In Transit", "Delivered", "Return Requested",
  "Return In Progress", "Return Completed", "Refund Initiated", "Refund Completed", "Cancelled",
] as const;
export type AdminOrderStatus = (typeof ADMIN_ORDER_STATUSES)[number];

export interface OrderItem {
  productId: EntityId;
  productName: string;
  productImage: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
}

/** Customer account projection currently rendered by the storefront. */
export interface Order {
  id: EntityId;
  date: ISODateTimeString;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: Address;
  paymentMethod: string;
  trackingNumber?: string;
}

export const PAYMENT_STATUSES = ["Paid", "Pending", "Failed"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = ["card", "upi", "cod", "wallet"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface Payment {
  id: EntityId;
  orderId: EntityId;
  amount: number;
  currency: CurrencyCode;
  method: PaymentMethod;
  status: PaymentStatus;
  providerReference?: string;
  createdAt: ISODateTimeString;
  updatedAt?: ISODateTimeString;
}

/** Admin order projection retained because its current table shape differs from Order. */
export interface AdminOrderItem {
  productId: EntityId;
  name: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  address: string;
}

export interface AdminOrder {
  id: EntityId;
  customer: OrderCustomer;
  items: AdminOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentStatus: PaymentStatus;
  orderStatus: AdminOrderStatus;
  createdAt: ISODateString;
}
