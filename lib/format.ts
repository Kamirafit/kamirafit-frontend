/**
 * Format a numeric price for display. Defaults to INR since the rest of the
 * app uses ₹; pass a different `currency`/`locale` for any section that needs
 * something else (e.g. the marketing homepage uses USD placeholders).
 */
export function formatPrice(
  value: number,
  {
    currency = "INR",
    locale = "en-IN",
  }: { currency?: string; locale?: string } = {},
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
