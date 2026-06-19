import { z } from "zod";
import { EntityIdSchema, ISODateStringSchema, ISODateTimeStringSchema, CurrencyCodeSchema } from "@/schemas/common.schema";

export type EntityId = z.infer<typeof EntityIdSchema>;
export type ISODateString = z.infer<typeof ISODateStringSchema>;
export type ISODateTimeString = z.infer<typeof ISODateTimeStringSchema>;
export type CurrencyCode = z.infer<typeof CurrencyCodeSchema>;
