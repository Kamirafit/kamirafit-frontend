import { EntityId, ISODateTimeString } from "./common";
import { Address } from "./address";

export const ORDER_STATUSES = [
  "Pending", "Confirmed", "Processing", "Shipped", "In Transit", "Delivered",
  "Return Requested", "Return Approved", "Return In Progress", "Return Completed",
  "Refund Initiated", "Refund Completed", "Cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

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
