import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthSession, User, UserRole } from "@/types/entities";

export type Role = UserRole | null;
export type { User } from "@/types/entities";
export type AuthState = Pick<AuthSession, "isAuthenticated" | "role" | "user" | "accessToken">;

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
      action: PayloadAction<{ role: Role; user: User; accessToken?: string }>
    ) => {
      state.isAuthenticated = true;
      state.role = action.payload.role;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
    logoutSuccess: (state) => {
      state.isAuthenticated = false;
      state.role = null;
      state.user = null;
      state.accessToken = undefined;
    },
    setAuthHydrated: (state, action: PayloadAction<AuthState>) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.role = action.payload.role;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
  },
});

export const { loginSuccess, logoutSuccess, setAuthHydrated } = authSlice.actions;
export default authSlice.reducer;
