import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Role = "customer" | "admin" | null;

export interface User {
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  role: Role;
  user: User | null;
}

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
