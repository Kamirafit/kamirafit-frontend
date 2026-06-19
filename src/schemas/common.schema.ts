import { z } from "zod";

export const EntityIdSchema = z.string();
export const ISODateStringSchema = z.string();
export const ISODateTimeStringSchema = z.string();
export const CurrencyCodeSchema = z.enum(["INR", "USD"]);
