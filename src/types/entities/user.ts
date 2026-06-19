import { EntityId } from "./common";

export const GENDERS = ["Male", "Female", "Other"] as const;
export type Gender = (typeof GENDERS)[number];

export interface User {
  id?: EntityId;
  email: string;
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
  gender?: Gender | "";
}

export interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  gender: Gender | "";
}

export const USER_ROLES = ["customer", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];
