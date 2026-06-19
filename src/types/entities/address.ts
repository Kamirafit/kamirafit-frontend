import { z } from "zod";
import { ADDRESS_TYPES, AddressTypeSchema, AddressSchema } from "@/schemas/address.schema";

export { ADDRESS_TYPES };
export type AddressType = z.infer<typeof AddressTypeSchema>;
export type Address = z.infer<typeof AddressSchema>;
