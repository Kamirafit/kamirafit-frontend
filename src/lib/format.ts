export const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80";

export const DEFAULT_CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80";

/**
 * Ensures a valid, non-empty image source string for Next.js <Image /> components.
 * Prevents console errors caused by empty strings (""), null/undefined, or ephemeral "blob:" URLs.
 */
export function getValidImageSrc(
  src: string | null | undefined,
  fallback: string = DEFAULT_PRODUCT_IMAGE,
): string {
  if (typeof src === "string" && src.trim() !== "") {
    const trimmed = src.trim();
    // NEVER use a raw blob: URL for rendering persistent product images.
    // blob: URLs are temporary browser-session pointers in RAM and fail on refresh, SSR, or other devices.
    if (trimmed.startsWith("blob:")) {
      return fallback;
    }
    return trimmed;
  }
  return fallback;
}

/**
 * Compresses an image File to a WebP data URL using an HTML5 Canvas.
 * Scales dimensions to max 1200x1200px while maintaining aspect ratio.
 * Produces an optimized, self-contained data URL (~40-80KB) that persists anywhere.
 */
export async function compressImageToDataUrl(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const webpDataUrl = canvas.toDataURL("image/webp", quality);
          if (webpDataUrl.startsWith("data:image/webp")) {
            resolve(webpDataUrl);
            return;
          }
        } catch {
          // Fall through to jpeg
        }
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Failed to load image for compression"));
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
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

