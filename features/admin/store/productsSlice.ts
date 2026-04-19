import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { PRODUCTS } from "@/data/products";
import type { Product } from "@/features/product/types";

type State = {
  items: Product[];
};

const initialState: State = {
  items: PRODUCTS,
};

export type ProductDraft = Omit<Product, "id" | "reviews" | "rating" | "popularity" | "createdAt"> & {
  id?: string;
};

const productsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {
    addProduct: {
      reducer(state, action: PayloadAction<Product>) {
        state.items.unshift(action.payload);
      },
      prepare(draft: ProductDraft) {
        const id = draft.id ?? `p-${Date.now().toString(36)}`;
        const images = draft.images.length > 0 ? draft.images : [draft.image];
        const product: Product = {
          id,
          name: draft.name,
          price: draft.price,
          category: draft.category,
          size: draft.size,
          color: draft.color,
          rating: 0,
          image: draft.image || images[0],
          images,
          description: draft.description,
          reviews: [],
          createdAt: new Date().toISOString().slice(0, 10),
          popularity: 0,
          status: draft.status,
        };
        return { payload: product };
      },
    },
    updateProduct(
      state,
      action: PayloadAction<{ id: string; patch: Partial<Product> }>,
    ) {
      const { id, patch } = action.payload;
      const idx = state.items.findIndex((p) => p.id === id);
      if (idx === -1) return;
      state.items[idx] = { ...state.items[idx], ...patch };
    },
    deleteProduct(state, action: PayloadAction<string>) {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },
    toggleProductStatus(state, action: PayloadAction<string>) {
      const p = state.items.find((it) => it.id === action.payload);
      if (!p) return;
      p.status = p.status === "active" ? "inactive" : "active";
    },
  },
});

export const {
  addProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} = productsSlice.actions;

export default productsSlice.reducer;
