import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { CATEGORIES, type AdminCategory } from "@/data/categories";

type State = {
  items: AdminCategory[];
};

const initialState: State = {
  items: CATEGORIES,
};

type CategoryDraft = {
  id?: string;
  name: string;
  subcategories: string[];
};

const categoriesSlice = createSlice({
  name: "adminCategories",
  initialState,
  reducers: {
    addCategory: {
      reducer(state, action: PayloadAction<AdminCategory>) {
        state.items.push(action.payload);
      },
      prepare(draft: CategoryDraft) {
        const id = draft.id ?? `c-${Date.now().toString(36)}`;
        return { payload: { id, ...draft } };
      },
    },
    updateCategory(
      state,
      action: PayloadAction<{ id: string; patch: Partial<Omit<AdminCategory, "id">> }>,
    ) {
      const { id, patch } = action.payload;
      const idx = state.items.findIndex((c) => c.id === id);
      if (idx === -1) return;
      state.items[idx] = { ...state.items[idx], ...patch };
    },
    deleteCategory(state, action: PayloadAction<string>) {
      state.items = state.items.filter((c) => c.id !== action.payload);
    },
  },
});

export const { addCategory, updateCategory, deleteCategory } =
  categoriesSlice.actions;

export default categoriesSlice.reducer;
