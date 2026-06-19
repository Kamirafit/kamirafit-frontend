import { z } from "zod";
import { CartItemSchema, CartSchema } from "@/schemas/cart.schema";

export type CartItem = z.infer<typeof CartItemSchema>;
export type Cart = z.infer<typeof CartSchema>;
