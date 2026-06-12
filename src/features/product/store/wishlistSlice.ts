import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type WishlistState = {
  ids: string[];
};

const initialState: WishlistState = {
  ids: [],
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggleWishlist(state, action: PayloadAction<string>) {
      const id = action.payload;
      const i = state.ids.indexOf(id);
      if (i >= 0) {
        state.ids.splice(i, 1);
      } else {
        state.ids.push(id);
      }
    },
    clearWishlist(state) {
      state.ids = [];
    },
  },
});

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
