import type { AuthState } from "../store/authSlice";

export const AuthStorage = {
  getCustomerAuth(): AuthState | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem("kamira_auth_customer");
    return data ? JSON.parse(data) : null;
  },
  setCustomerAuth(state: AuthState): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("kamira_auth_customer", JSON.stringify(state));
  },
  clearCustomerAuth(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("kamira_auth_customer");
  },
  
  getAdminAuth(): AuthState | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem("kamira_auth_admin");
    return data ? JSON.parse(data) : null;
  },
  setAdminAuth(state: AuthState): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("kamira_auth_admin", JSON.stringify(state));
  },
  clearAdminAuth(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("kamira_auth_admin");
  },

  clearAll(): void {
    this.clearCustomerAuth();
    this.clearAdminAuth();
  }
};
