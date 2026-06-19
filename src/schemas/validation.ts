import { z } from "zod";

export interface ValidationErrorDetail {
  path: string;
  message: string;
}

export type ValidationError = {
  code: "VALIDATION_ERROR";
  message: string;
  details: ValidationErrorDetail[];
};

export type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: ValidationError };

/**
 * Validates data against a schema.
 * Logs failures as warnings, returns a structured error object on failure.
 */
export function safeValidate<T>(
  schema: z.ZodType<T>,
  data: unknown,
  context: string
): SafeParseResult<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const details = result.error.issues.map((err) => ({
    path: err.path.join("."),
    message: err.message,
  }));

  const error: ValidationError = {
    code: "VALIDATION_ERROR",
    message: `Validation failed in ${context}: ${result.error.message}`,
    details,
  };

  console.warn(`[Validation Warning] Context: ${context}`, error, "\nData:", data);

  return { success: false, error };
}
