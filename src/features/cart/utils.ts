import type { CartItem } from "@/features/product/store/cartSlice";
import type { Product } from "@/features/product/types";

export const FREE_SHIPPING_THRESHOLD = 500;
export const DELIVERY_FEE = 50;

export type ResolvedCartItem = {
  item: CartItem;
  product: Product;
  lineTotal: number;
};

export function calculateShippingFee(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DELIVERY_FEE;
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

export function calculateTotals(resolved: ResolvedCartItem[]) {
  const subtotal = resolved.reduce((sum, r) => sum + r.lineTotal, 0);
  const delivery = calculateShippingFee(subtotal);
  const total = subtotal + delivery;
  return { subtotal, delivery, total };
}

// Re-export the single source of truth for price formatting so existing cart
// components can keep importing { formatPrice } from "../utils".
export { formatPrice } from "@/lib/format";
