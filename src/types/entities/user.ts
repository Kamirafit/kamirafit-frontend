import { z } from "zod";
import { GENDERS, GenderSchema, UserSchema, ProfileSchema } from "@/schemas/user.schema";
import { USER_ROLES, UserRoleSchema } from "@/schemas/auth.schema";

export { GENDERS, USER_ROLES };
export type Gender = z.infer<typeof GenderSchema>;
export type User = z.infer<typeof UserSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
