import { z } from "zod";
import { ISODateTimeStringSchema } from "@/schemas/common.schema";
import { UserSchema } from "@/schemas/user.schema";

export const USER_ROLES = ["customer", "admin"] as const;
export const UserRoleSchema = z.enum(USER_ROLES);

export const AuthSessionSchema = z.object({
  isAuthenticated: z.boolean(),
  role: z.union([UserRoleSchema, z.null()]),
  user: z.union([UserSchema, z.null()]),
  accessToken: z.string().optional(),
  expiresAt: ISODateTimeStringSchema.optional(),
});

export const LoginRequestDtoSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const RegisterRequestDtoSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});
