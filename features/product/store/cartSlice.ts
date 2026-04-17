import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Color, Size } from "../types";

export type CartItem = {
  id: string;
  size?: Size;
  color?: Color;
  quantity: number;
};

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
  items: [],
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
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
