import { z } from "zod";
import { ReviewSchema } from "@/schemas/review.schema";

export type Review = z.infer<typeof ReviewSchema>;
