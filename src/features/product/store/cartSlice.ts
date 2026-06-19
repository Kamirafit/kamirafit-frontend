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

const initialState: CartState = {
  items: [
    { id: "p-01", size: "M", color: "White", quantity: 1 },
    { id: "p-02", size: "L", color: "Black", quantity: 2 },
    { id: "p-04", size: "M", color: "Blue", quantity: 1 },
  ],
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
    },
    removeFromCart(state, action: PayloadAction<CartItemKey>) {
      const key = action.payload;
      state.items = state.items.filter((it) => !matchesKey(it, key));
    },
    updateQuantity(
      state,
      action: PayloadAction<CartItemKey & { quantity: number }>,
    ) {
      const { quantity, ...key } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((it) => !matchesKey(it, key));
        return;
      }
      const existing = state.items.find((it) => matchesKey(it, key));
      if (existing) {
        existing.quantity = quantity;
      }
    },
    incrementQuantity(state, action: PayloadAction<CartItemKey>) {
      const existing = state.items.find((it) =>
        matchesKey(it, action.payload),
      );
      if (existing) existing.quantity += 1;
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
    },
    clearCart(state) {
      state.items = [];
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
} = cartSlice.actions;
export default cartSlice.reducer;
