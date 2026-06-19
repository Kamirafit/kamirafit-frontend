import { z } from "zod";
import { EntityIdSchema, ISODateTimeStringSchema, CurrencyCodeSchema } from "./common.schema";

export const PAYMENT_STATUSES = ["Paid", "Pending", "Failed"] as const;
export const PAYMENT_METHODS = ["card", "upi", "cod", "wallet"] as const;

export const PaymentStatusSchema = z.enum(PAYMENT_STATUSES);
export const PaymentMethodSchema = z.enum(PAYMENT_METHODS);

export const PaymentSchema = z.object({
  id: EntityIdSchema,
  orderId: EntityIdSchema,
  amount: z.number(),
  currency: CurrencyCodeSchema,
  method: PaymentMethodSchema,
  status: PaymentStatusSchema,
  providerReference: z.string().optional(),
  createdAt: ISODateTimeStringSchema,
  updatedAt: ISODateTimeStringSchema.optional(),
});
