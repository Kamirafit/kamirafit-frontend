import { EntityId } from "./common";

export const ADDRESS_TYPES = ["Home", "Work", "Other"] as const;
export type AddressType = (typeof ADDRESS_TYPES)[number];

export interface Address {
  id: EntityId;
  type: AddressType;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}
