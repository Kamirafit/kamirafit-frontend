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
    const raw = await unwrapApiResponse<any>(apiClient.post("/auth/login-customer", { email, password }));
    const token = raw.token || raw.accessToken || "";
    const user = raw.user || raw;
    const role: UserRole = String(raw.role || user?.role || "customer").toLowerCase() === "admin" ? "admin" : "customer";
    if (user) {
      user.role = role;
    }
    return {
      user,
      role,
      accessToken: token,
    };
  },
  async signupCustomer(data: RegisterRequestDto): Promise<AuthResult> {
    return unwrapApiResponse(apiClient.post("/auth/register-customer", data));
  },
  async loginAdmin(email: string, password: string): Promise<AuthResult> {
    const raw = await unwrapApiResponse<{
      user?: User;
      token?: string;
      accessToken?: string;
      role?: string;
    }>(
      apiClient
        .post("/v1/auth/login-admin", { email, password })
        .catch(() => apiClient.post("/auth/login-admin", { email, password }))
    );
    const token = raw.token || raw.accessToken || "";
    const user = raw.user || (raw as unknown as User);
    const role: UserRole = "admin";
    if (user) {
      user.role = role;
    }
    return {
      user,
      role,
      accessToken: token,
    };
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
      await unwrapApiResponse(
        apiClient
          .post("/v1/admin/logout", {})
          .catch(() => apiClient.post("/v1/auth/logout-admin", {}))
          .catch(() => apiClient.post("/auth/logout", {}))
      );
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
  async sendEmailOtp(email: string): Promise<{ success: boolean; emailOtpToken: string; message?: string }> {
    return unwrapApiResponse(apiClient.post("/auth/send-email-otp", { email }));
  },
  async verifyEmailOtp(email: string, otp: string, emailOtpToken: string): Promise<{ success: boolean; verifiedToken?: string; message?: string }> {
    return unwrapApiResponse(apiClient.post("/auth/verify-email-otp", { email, otp, emailOtpToken }));
  },
  async sendPhoneOtp(countryCode: string, phoneNumber: string): Promise<{ success: boolean; phoneOtpToken: string; message?: string }> {
    return unwrapApiResponse(apiClient.post("/auth/send-phone-otp", { countryCode, phoneNumber }));
  },
  async verifyPhoneOtp(countryCode: string, phoneNumber: string, otp: string, phoneOtpToken: string): Promise<{ success: boolean; verifiedToken?: string; message?: string }> {
    return unwrapApiResponse(apiClient.post("/auth/verify-phone-otp", { countryCode, phoneNumber, otp, phoneOtpToken }));
  },
};

