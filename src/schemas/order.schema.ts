import { z } from "zod";
import { EntityIdSchema, ISODateTimeStringSchema } from "./common.schema";
import { AddressSchema } from "./address.schema";
import { CartItemSchema } from "./cart.schema";

export const ORDER_STATUSES = [
  "Pending", "Confirmed", "Processing", "Shipped", "In Transit", "Delivered",
  "Return Requested", "Return Approved", "Return In Progress", "Return Completed",
  "Refund Initiated", "Refund Completed", "Cancelled",
] as const;

export const OrderStatusSchema = z.enum(ORDER_STATUSES);

export const OrderItemSchema = z.object({
  productId: EntityIdSchema,
  productName: z.string(),
  productImage: z.string(),
  quantity: z.number().int().positive(),
  size: z.string(),
  color: z.string(),
  price: z.number(),
});

export const OrderSchema = z.object({
  id: EntityIdSchema,
  date: ISODateTimeStringSchema,
  status: OrderStatusSchema,
  items: z.array(OrderItemSchema),
  totalAmount: z.number(),
  shippingAddress: AddressSchema,
  paymentMethod: z.string(),
  trackingNumber: z.string().optional(),
});

export const CheckoutRequestDtoSchema = z.object({
  items: z.array(CartItemSchema),
  shippingAddress: AddressSchema.omit({ id: true, isDefault: true }),
  paymentMethod: z.string(),
  couponCode: z.string().optional(),
  idempotencyKey: z.string().optional(),
});

export const CreateOrderRequestDtoSchema = OrderSchema.omit({
  id: true,
  date: true,
  status: true,
});
