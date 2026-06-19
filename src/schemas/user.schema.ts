import { z } from "zod";
import { EntityIdSchema } from "./common.schema";

export const GENDERS = ["Male", "Female", "Other"] as const;
export const GenderSchema = z.enum(GENDERS);

export const UserSchema = z.object({
  id: EntityIdSchema.optional(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  mobileNumber: z.string().optional(),
  gender: z.union([GenderSchema, z.literal("")]).optional(),
});

export const ProfileSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  mobileNumber: z.string(),
  gender: z.union([GenderSchema, z.literal("")]),
});
