import { z } from "zod";
import { AuthSessionSchema } from "@/schemas/auth.schema";

export type AuthSession = z.infer<typeof AuthSessionSchema>;
