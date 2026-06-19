import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "@/features/product/types";

type State = {
  items: Product[];
};

const initialState: State = {
  items: [],
};

export type ProductDraft = Omit<Product, "id" | "reviews" | "rating" | "popularity" | "createdAt" | "title" | "slug" | "brand" | "variants" | "metadata"> & {
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
        const title = draft.name;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        const variants = (draft.color || ["Black"]).flatMap((color) =>
          (draft.size || ["M"]).map((size) => ({
            id: `${id}-var-${color}-${size}`,
            sku: `KF-${draft.category.toUpperCase().slice(0, 3)}-${id.toUpperCase()}-${color.toUpperCase()}-${size}`,
            color,
            size,
            inventory: { quantity: 50, reserved: 0, available: 50 },
            price: draft.price,
            images,
            isAvailable: true,
          }))
        );

        const product: Product = {
          id,
          title,
          slug,
          description: draft.description,
          category: draft.category,
          brand: "KamiraFit",
          status: draft.status,
          variants,
          metadata: {
            rating: 0,
            reviews: [],
            popularity: 0,
            createdAt: new Date().toISOString(),
          },
          name: draft.name,
          price: draft.price,
          size: draft.size,
          color: draft.color,
          rating: 0,
          image: draft.image || images[0],
          images,
          reviews: [],
          createdAt: new Date().toISOString().slice(0, 10),
          popularity: 0,
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
