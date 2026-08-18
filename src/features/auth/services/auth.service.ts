import type { AuthSession, User, UserRole } from "@/types/entities";
import type {
  GetProfileResponseDto, LoginRequestDto, LoginResponseDto, RefreshSessionResponseDto,
  RegisterRequestDto, RegisterResponseDto, UpdateProfileRequestDto, UpdateProfileResponseDto,
} from "@/types/api/auth";
import { apiClient, unwrapApiResponse } from "@/api/client";
import { AuthStorage } from "./authStorage";

type AuthResult = Pick<AuthSession, "user" | "role" | "accessToken"> & { user: User; role: UserRole };

export const authService = {
  async loginCustomer(email: string, password: string): Promise<AuthResult> {
    return unwrapApiResponse(apiClient.post("/auth/login-customer", { email, password }));
  },
  async signupCustomer(data: RegisterRequestDto): Promise<AuthResult> {
    return unwrapApiResponse(apiClient.post("/auth/register-customer", data));
  },
  async loginAdmin(email: string, password: string): Promise<AuthResult> {
    return unwrapApiResponse(apiClient.post("/auth/login-admin", { email, password }));
  },
  async login(credentials: LoginRequestDto): Promise<LoginResponseDto["data"]> {
    return unwrapApiResponse(apiClient.post("/auth/login", credentials));
  },
  async signup(userData: RegisterRequestDto): Promise<RegisterResponseDto["data"]> {
    return unwrapApiResponse(apiClient.post("/auth/register", userData));
  },
  async refreshToken(): Promise<RefreshSessionResponseDto["data"]> {
    return unwrapApiResponse(apiClient.post("/auth/refresh"));
  },
  async logout(): Promise<void> {
    try {
      await unwrapApiResponse(apiClient.post("/auth/logout-customer", {}));
    } catch {
      try {
        await unwrapApiResponse(apiClient.post("/auth/logout", {}));
      } catch {
        // Clear local storage regardless of backend error
      }
    } finally {
      AuthStorage.clearAll();
    }
  },
  async logoutAdmin(): Promise<void> {
    try {
      await unwrapApiResponse(apiClient.post("/auth/logout"));
    } catch {
      // Ignore network errors so client session is always cleared
    } finally {
      AuthStorage.clearAdminAuth();
    }
  },
  async getProfile(): Promise<GetProfileResponseDto["data"]> {
    return unwrapApiResponse(apiClient.get("/auth/profile"));
  },
  async updateProfile(profile: UpdateProfileRequestDto): Promise<UpdateProfileResponseDto["data"]> {
    return unwrapApiResponse(apiClient.put("/auth/profile", profile));
  },
};
