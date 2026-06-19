import type { AuthSession, User, UserRole } from "@/types/entities";
import type {
  GetProfileResponseDto, LoginRequestDto, LoginResponseDto, RefreshSessionResponseDto,
  RegisterRequestDto, RegisterResponseDto, UpdateProfileRequestDto, UpdateProfileResponseDto,
} from "@/types/api/auth";
import { mockApi, unwrapMockResponse } from "@/api/mockApi";
import { AuthStorage } from "./authStorage";

type AuthResult = Pick<AuthSession, "user" | "role"> & { user: User; role: UserRole };

export const authService = {
  // Storefront customer operations
  async loginCustomer(email: LoginRequestDto["email"], _password: string): Promise<AuthResult> {
    void _password;
    const res = unwrapMockResponse(await mockApi.auth.loginCustomer(email));
    return res;
  },

  async signupCustomer(data: RegisterRequestDto): Promise<AuthResult> {
    const res = unwrapMockResponse(await mockApi.auth.registerCustomer(data));
    return res;
  },

  // Admin portal operations
  async loginAdmin(email: LoginRequestDto["email"], password: string): Promise<AuthResult> {
    const res = unwrapMockResponse(await mockApi.auth.loginAdmin(email, password));
    return res;
  },

  // Generic and legacy authentication operations
  async login(credentials: LoginRequestDto): Promise<LoginResponseDto["data"]> {
    return unwrapMockResponse(await mockApi.auth.login(credentials));
  },

  async signup(userData: RegisterRequestDto): Promise<RegisterResponseDto["data"]> {
    return unwrapMockResponse(await mockApi.auth.register(userData));
  },

  async refreshToken(): Promise<RefreshSessionResponseDto["data"]> {
    return unwrapMockResponse(await mockApi.auth.refresh());
  },

  async logout(): Promise<void> {
    unwrapMockResponse(await mockApi.auth.logout());
    AuthStorage.clearAll();
  },

  async getProfile(): Promise<GetProfileResponseDto["data"]> {
    return unwrapMockResponse(await mockApi.auth.getProfile());
  },

  async updateProfile(profile: UpdateProfileRequestDto): Promise<UpdateProfileResponseDto["data"]> {
    return unwrapMockResponse(await mockApi.auth.updateProfile(profile));
  },
};
