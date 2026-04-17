import { PRODUCTS } from "@/features/product/data/products";
import type { CartItem } from "@/features/product/store/cartSlice";
import type { Product } from "@/features/product/types";

export const DELIVERY_FEE = 50;

export type ResolvedCartItem = {
  item: CartItem;
  product: Product;
  lineTotal: number;
};

export function resolveCartItems(items: CartItem[]): ResolvedCartItem[] {
  return items
    .map((item) => {
      const product = PRODUCTS.find((p) => p.id === item.id);
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
  const delivery = resolved.length > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + delivery;
  return { subtotal, delivery, total };
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
