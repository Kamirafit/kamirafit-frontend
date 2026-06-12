export type Size = "S" | "M" | "L" | "XL";
export type Color = "Black" | "White" | "Blue" | "Red";

export type CategorySlug =
  | "kurti"
  | "co-ords-sets"
  | "dresses"
  | "t-shirts"
  | "oversized-t-shirts"
  | "hoodies";

export type CategoryName =
  | "Kurti"
  | "Co-ords Sets"
  | "Dresses"
  | "T-Shirts"
  | "Oversized T-Shirts"
  | "Hoodies";

export interface Category {
  id: string;
  name: CategoryName;
  slug: CategorySlug;
  image?: string;
  description?: string;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  createdAt: string;
  date?: string;
}

export type ProductStatus = "active" | "inactive";

export interface Product {
  id: string;
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
  createdAt: string;
  popularity: number;
  status: ProductStatus;
}

export type AddressType = "Home" | "Work" | "Other";

export interface Address {
  id: string;
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

export interface User {
  email: string;
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
  gender?: "Male" | "Female" | "Other" | "";
}

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "In Transit"
  | "Delivered"
  | "Return Requested"
  | "Return Approved"
  | "Return In Progress"
  | "Return Completed"
  | "Refund Initiated"
  | "Refund Completed"
  | "Cancelled";

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
}

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: Address;
  paymentMethod: string;
  trackingNumber?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
