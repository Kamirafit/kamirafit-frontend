import { z } from "zod";
import { EntityIdSchema, ISODateStringSchema } from "./common.schema";
import { PaymentStatusSchema } from "./payment.schema";

export const ADMIN_ORDER_STATUSES = [
  "Pending", "Confirmed", "In Transit", "Delivered", "Return Requested",
  "Return In Progress", "Return Completed", "Refund Initiated", "Refund Completed", "Cancelled",
] as const;

export const AdminOrderStatusSchema = z.enum(ADMIN_ORDER_STATUSES);



export const AdminUserSchema = z.object({
  id: EntityIdSchema,
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
  isActive: z.boolean().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
});

export const AdminOrderItemSchema = z.object({
  productId: EntityIdSchema,
  name: z.string(),
  image: z.string(),
  size: z.string(),
  color: z.string(),
  quantity: z.number().int().positive(),
  price: z.number(),
});

export const OrderCustomerSchema = z.object({
  name: z.string(),
  phone: z.string(),
  address: z.string(),
});

export const AdminOrderSchema = z.object({
  id: EntityIdSchema,
  customer: OrderCustomerSchema,
  items: z.array(AdminOrderItemSchema),
  subtotal: z.number(),
  deliveryFee: z.number(),
  total: z.number(),
  totalAmount: z.number().optional(),
  paymentStatus: PaymentStatusSchema,
  orderStatus: AdminOrderStatusSchema,
  createdAt: ISODateStringSchema,
  courierName: z.string().optional(),
  trackingCode: z.string().optional(),
  trackingUrl: z.string().optional(),
  notes: z.string().optional(),
});
