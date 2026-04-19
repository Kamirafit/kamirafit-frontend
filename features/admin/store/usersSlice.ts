import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { USERS, type AdminUser } from "@/data/users";

type State = {
  items: AdminUser[];
};

const initialState: State = {
  items: USERS,
};

const usersSlice = createSlice({
  name: "adminUsers",
  initialState,
  reducers: {
    updateUser(
      state,
      action: PayloadAction<{ id: string; patch: Partial<Omit<AdminUser, "id">> }>,
    ) {
      const { id, patch } = action.payload;
      const idx = state.items.findIndex((u) => u.id === id);
      if (idx === -1) return;
      state.items[idx] = { ...state.items[idx], ...patch };
    },
  },
});

export const { updateUser } = usersSlice.actions;
export default usersSlice.reducer;
