import { EntityId, ISODateTimeString, CurrencyCode } from "./common";

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
