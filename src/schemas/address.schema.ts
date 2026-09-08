import { z } from "zod";
import { EntityIdSchema } from "./common.schema";

export const ADDRESS_TYPES = ["Home", "Work", "Other"] as const;
export const AddressTypeSchema = z.enum(ADDRESS_TYPES);

export const AddressSchema = z.object({
  id: EntityIdSchema,
  type: AddressTypeSchema,
  fullName: z.string(),
  phoneNumber: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  country: z.string().optional().default("India"),
  isDefault: z.boolean(),
});
