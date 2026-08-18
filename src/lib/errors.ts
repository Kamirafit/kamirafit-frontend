interface CustomApiError {
  code?: string | number;
  message?: string;
  response?: {
    data?: {
      message?: string;
      code?: string;
      error?: string;
    };
  };
}

const FRIENDLY_API_MESSAGES: Record<string, string> = {
  PRODUCT_NOT_FOUND: "We couldn’t find that product.",
  ADDRESS_NOT_FOUND: "That address is no longer available.",
  ORDER_NOT_FOUND: "We couldn’t find that order.",
  INVALID_CREDENTIALS: "The email or password is incorrect.",
  CONFLICT: "User with this email or phone number already exists.",
};

export function getUserFriendlyError(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!error) return fallback;

  if (typeof error === "string") return error;

  if (typeof error === "object") {
    const err = error as CustomApiError;

    // 1. Direct message from axios response payload
    if (err.response?.data?.message && typeof err.response.data.message === "string") {
      return err.response.data.message;
    }

    // 2. Direct message property on error object if non-generic
    if (err.message && typeof err.message === "string") {
      const isGeneric =
        err.message.startsWith("Request failed with status code") ||
        err.message.startsWith("Network Error") ||
        err.message === "API request failed";
      if (!isGeneric) {
        return err.message;
      }
    }

    // 3. Known error code mapping
    const code = String(err.code || err.response?.data?.code || "");
    if (code && FRIENDLY_API_MESSAGES[code]) {
      return FRIENDLY_API_MESSAGES[code];
    }
  }

  return fallback;
}
