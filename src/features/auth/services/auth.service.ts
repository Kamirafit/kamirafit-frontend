import type { AuthSession, User, UserRole } from "@/types/entities";
import type { LoginRequestDto, RegisterRequestDto } from "@/types/api/auth";

type AuthResult = Pick<AuthSession, "user" | "role"> & { user: User; role: UserRole };

// Mock delay to simulate network request
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  async loginCustomer(email: LoginRequestDto["email"], _password: string): Promise<AuthResult> {
    void _password;
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

  async signupCustomer(data: RegisterRequestDto): Promise<AuthResult> {
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

  async loginAdmin(email: LoginRequestDto["email"], password: string): Promise<AuthResult> {
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
