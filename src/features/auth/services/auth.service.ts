import type { AuthSession, User, UserRole } from "@/types/entities";
import type { LoginRequestDto, RegisterRequestDto } from "@/types/api/auth";
import { mockApi, unwrapMockResponse } from "@/api/mockApi";

type AuthResult = Pick<AuthSession, "user" | "role"> & { user: User; role: UserRole };

export const authService = {
  async loginCustomer(email: LoginRequestDto["email"], _password: string): Promise<AuthResult> {
    void _password;
    return unwrapMockResponse(await mockApi.auth.loginCustomer(email));
  },

  async signupCustomer(data: RegisterRequestDto): Promise<AuthResult> {
    return unwrapMockResponse(await mockApi.auth.registerCustomer(data));
  },

  async loginAdmin(email: LoginRequestDto["email"], password: string): Promise<AuthResult> {
    return unwrapMockResponse(await mockApi.auth.loginAdmin(email, password));
  },
};
