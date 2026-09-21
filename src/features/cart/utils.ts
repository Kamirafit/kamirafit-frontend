import type { CartItem } from "@/features/product/store/cartSlice";
import type { Product } from "@/features/product/types";
import { calculateDeliveryCharge } from "@/lib/delivery";

export const FREE_SHIPPING_THRESHOLD = 999;
export const DELIVERY_FEE = 199;

export type ResolvedCartItem = {
  item: CartItem;
  product: Product;
  lineTotal: number;
};

/**
 * Calculates delivery fee based on customer region & destination pincode.
 * Falls back to saved localStorage pincode or West Bengal standard rate.
 */
export function calculateShippingFee(
  subtotal: number,
  pincode?: string,
  country?: string
): number {
  if (subtotal <= 0) return 0;
  if (subtotal > FREE_SHIPPING_THRESHOLD) return 0;

  if (pincode || country) {
    return calculateDeliveryCharge(pincode, country).rate;
  }

  if (typeof window !== "undefined") {
    const savedPin =
      localStorage.getItem("kamirafit_postal_code") ||
      localStorage.getItem("kamirafit_pincode");
    const savedCountry = localStorage.getItem("kamirafit_country");
    if (savedPin || savedCountry) {
      return calculateDeliveryCharge(savedPin || undefined, savedCountry || undefined).rate;
    }
  }

  // Default regional delivery rate
  return 199;
}

export function resolveCartItems(items: CartItem[], products: Product[]): ResolvedCartItem[] {
  return items
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) return null;
      return {
        item,
        product,
        lineTotal: product.price * item.quantity,
      };
    })
    .filter((v): v is ResolvedCartItem => v !== null);
}

export function calculateTotals(
  resolved: ResolvedCartItem[],
  pincode?: string,
  country?: string
) {
  const subtotal = resolved.reduce((sum, r) => sum + r.lineTotal, 0);
  const delivery = calculateShippingFee(subtotal, pincode, country);
  const total = subtotal + delivery;
  return { subtotal, delivery, total };
}

// Re-export the single source of truth for price formatting so existing cart
// components can keep importing { formatPrice } from "../utils".
export { formatPrice } from "@/lib/format";
