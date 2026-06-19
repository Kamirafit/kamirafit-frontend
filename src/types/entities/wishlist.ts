import { z } from "zod";
import { WishlistSchema } from "@/schemas/wishlist.schema";

export type Wishlist = z.infer<typeof WishlistSchema>;
