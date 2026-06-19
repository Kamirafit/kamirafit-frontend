import { z } from "zod";
import {
  ORDER_STATUSES, OrderStatusSchema, OrderItemSchema, OrderSchema
} from "@/schemas/order.schema";

export { ORDER_STATUSES };
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Order = z.infer<typeof OrderSchema>;
