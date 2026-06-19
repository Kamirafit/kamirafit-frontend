const FRIENDLY_API_MESSAGES: Record<string, string> = {
  PRODUCT_NOT_FOUND: "We couldn’t find that product.",
  ADDRESS_NOT_FOUND: "That address is no longer available.",
  ORDER_NOT_FOUND: "We couldn’t find that order.",
  INVALID_CREDENTIALS: "The email or password is incorrect.",
};

export function getUserFriendlyError(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = String(error.code);
    return FRIENDLY_API_MESSAGES[code] ?? fallback;
  }
  return fallback;
}
