import { z } from "zod";
import {
  PAYMENT_STATUSES, PAYMENT_METHODS,
  PaymentStatusSchema, PaymentMethodSchema, PaymentSchema
} from "@/schemas/payment.schema";

export { PAYMENT_STATUSES, PAYMENT_METHODS };
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
