import { EntityId, ISODateString } from "./common";
import { PaymentStatus } from "./payment";

export interface AdminCategory {
  id: EntityId;
  name: string;
  subcategories: string[];
}

export interface AdminUser {
  id: EntityId;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export const ADMIN_ORDER_STATUSES = [
  "Pending", "Confirmed", "In Transit", "Delivered", "Return Requested",
  "Return In Progress", "Return Completed", "Refund Initiated", "Refund Completed", "Cancelled",
] as const;
export type AdminOrderStatus = (typeof ADMIN_ORDER_STATUSES)[number];

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
