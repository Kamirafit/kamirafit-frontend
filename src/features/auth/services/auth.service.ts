import { User, Role } from "../store/authSlice";

// Mock delay to simulate network request
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  async loginCustomer(email: string, password: string):Promise<{ role: Role; user: User }> {
    await delay(800);
    // Any email works for customer login as per requirements
    return {
      role: "customer",
      user: {
        email,
        firstName: "Kamira", // Mock
        lastName: "User",
      },
    };
  },

  async signupCustomer(data: { email: string; password?: string; firstName?: string; lastName?: string }):Promise<{ role: Role; user: User }> {
    await delay(800);
    return {
      role: "customer",
      user: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    };
  },

  async loginAdmin(email: string, password: string):Promise<{ role: Role; user: User }> {
    await delay(800);
    if (email === "admin@kamirafit.com" && password === "admin") {
      return {
        role: "admin",
        user: {
          email,
          firstName: "Super",
          lastName: "Admin",
        },
      };
    }
    throw new Error("Invalid admin credentials.");
  },
};
