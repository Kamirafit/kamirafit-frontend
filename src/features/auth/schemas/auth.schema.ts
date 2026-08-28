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
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/`~]).{8,}$/;

export const RegisterRequestDtoSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().regex(
    PASSWORD_REGEX,
    "Password must be at least 8 characters and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
  ),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  countryCode: z.string().min(1, "Country code is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  gender: z.string().min(1, "Gender is required"),
  emailVerificationToken: z.string().optional(),
  phoneVerificationToken: z.string().optional(),
});
