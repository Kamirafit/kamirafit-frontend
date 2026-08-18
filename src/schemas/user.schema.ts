import { z } from "zod";
import { EntityIdSchema } from "./common.schema";

export const GENDERS = ["male", "female", "other"] as const;
export const GenderSchema = z.string();

export const UserSchema = z.object({
  id: EntityIdSchema.optional(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  countryCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  mobileNumber: z.string().optional(),
  gender: z.string().optional(),
  role: z.string().optional(),
});

export const ProfileSchema = z.object({
  id: EntityIdSchema.optional(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  countryCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  mobileNumber: z.string().optional(),
  gender: z.string(),
  role: z.string().optional(),
});
