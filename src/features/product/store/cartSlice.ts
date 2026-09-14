import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartItem, Color, Size } from "@/types/entities";
export type { CartItem } from "@/types/entities";

export type AddToCartPayload = {
  id: string;
  size?: Size;
  color?: Color;
  quantity?: number;
};

export type CartItemKey = {
  id: string;
  size?: Size;
  color?: Color;
};

type CartState = {
  items: CartItem[];
};

export const CART_STORAGE_KEY = "kamirafit_cart_items";

export function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (it): it is CartItem =>
          typeof it === "object" &&
          it !== null &&
          typeof it.id === "string" &&
          it.id.length > 0 &&
          typeof it.quantity === "number" &&
          it.quantity > 0
      );
    }
    return [];
  } catch {
    return [];
  }
}

export function persistCartToStorage(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Gracefully handle storage errors
  }
}

export function clearCartStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch {
    // Gracefully handle storage errors
  }
}

const initialState: CartState = {
  items: typeof window !== "undefined" ? loadCartFromStorage() : [],
};

function matchesKey(item: CartItem, key: CartItemKey): boolean {
  return (
    item.id === key.id &&
    item.size === key.size &&
    item.color === key.color
  );
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<AddToCartPayload>) {
      const { id, size, color, quantity = 1 } = action.payload;
      const existing = state.items.find((it) =>
        matchesKey(it, { id, size, color }),
      );
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ id, size, color, quantity });
      }
      persistCartToStorage(state.items);
    },
    removeFromCart(state, action: PayloadAction<CartItemKey>) {
      const key = action.payload;
      state.items = state.items.filter((it) => !matchesKey(it, key));
      persistCartToStorage(state.items);
    },
    updateQuantity(
      state,
      action: PayloadAction<CartItemKey & { quantity: number }>,
    ) {
      const { quantity, ...key } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((it) => !matchesKey(it, key));
      } else {
        const existing = state.items.find((it) => matchesKey(it, key));
        if (existing) {
          existing.quantity = quantity;
        }
      }
      persistCartToStorage(state.items);
    },
    incrementQuantity(state, action: PayloadAction<CartItemKey>) {
      const existing = state.items.find((it) =>
        matchesKey(it, action.payload),
      );
      if (existing) existing.quantity += 1;
      persistCartToStorage(state.items);
    },
    decrementQuantity(state, action: PayloadAction<CartItemKey>) {
      const key = action.payload;
      const existing = state.items.find((it) => matchesKey(it, key));
      if (!existing) return;
      if (existing.quantity <= 1) {
        state.items = state.items.filter((it) => !matchesKey(it, key));
      } else {
        existing.quantity -= 1;
      }
      persistCartToStorage(state.items);
    },
    replaceCart(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      persistCartToStorage(state.items);
    },
    clearCart(state) {
      state.items = [];
      clearCartStorage();
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  replaceCart,
} = cartSlice.actions;
export default cartSlice.reducer;
