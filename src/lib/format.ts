export const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80";

export const DEFAULT_CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80";

/**
 * Ensures a valid, non-empty image source string for Next.js <Image /> components.
 * Prevents console errors caused by empty strings ("") or null/undefined src values.
 */
export function getValidImageSrc(
  src: string | null | undefined,
  fallback: string = DEFAULT_PRODUCT_IMAGE,
): string {
  if (typeof src === "string" && src.trim() !== "") {
    return src.trim();
  }
  return fallback;
}

/**
 * Format a numeric price for display. Defaults to INR since the rest of the
 * app uses ₹; pass a different `currency`/`locale` for any section that needs
 * something else (e.g. the marketing homepage uses USD placeholders).
 */
export function formatPrice(
  value: number | string | null | undefined,
  {
    currency = "INR",
    locale = "en-IN",
  }: { currency?: string; locale?: string } = {},
): string {
  const numeric = typeof value === "number" ? value : Number(value) || 0;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(numeric);
}

