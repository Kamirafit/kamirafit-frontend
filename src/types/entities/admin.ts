import { z } from "zod";
import { AdminCategorySchema } from "@/schemas/category.schema";
import {
  ADMIN_ORDER_STATUSES,
  AdminUserSchema, AdminOrderStatusSchema,
  AdminOrderItemSchema, OrderCustomerSchema, AdminOrderSchema
} from "@/schemas/admin.schema";

export { ADMIN_ORDER_STATUSES };
export type AdminCategory = z.infer<typeof AdminCategorySchema>;
export type AdminUser = z.infer<typeof AdminUserSchema>;
export type AdminOrderStatus = z.infer<typeof AdminOrderStatusSchema>;
export type AdminOrderItem = z.infer<typeof AdminOrderItemSchema>;
export type OrderCustomer = z.infer<typeof OrderCustomerSchema>;
export type AdminOrder = z.infer<typeof AdminOrderSchema>;
