import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthSession, User, UserRole } from "@/types/entities";

export type Role = UserRole | null;
export type { User } from "@/types/entities";
export type AuthState = Pick<AuthSession, "isAuthenticated" | "role" | "user">;

const initialState: AuthState = {
  isAuthenticated: false,
  role: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ role: Role; user: User }>
    ) => {
      state.isAuthenticated = true;
      state.role = action.payload.role;
      state.user = action.payload.user;
    },
    logoutSuccess: (state) => {
      state.isAuthenticated = false;
      state.role = null;
      state.user = null;
    },
    setAuthHydrated: (state, action: PayloadAction<AuthState>) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.role = action.payload.role;
      state.user = action.payload.user;
    },
  },
});

export const { loginSuccess, logoutSuccess, setAuthHydrated } = authSlice.actions;
export default authSlice.reducer;
