import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  id: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
};

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<string>) {
      const id = action.payload;
      const existing = state.items.find((it) => it.id === id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ id, quantity: 1 });
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((it) => it.id !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
