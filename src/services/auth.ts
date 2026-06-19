import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockApi, unwrapMockResponse } from "@/api/mockApi";
import type { Profile } from "@/types/entities";
import type {
  GetProfileResponseDto, LoginRequestDto, LoginResponseDto, RefreshSessionResponseDto,
  RegisterRequestDto, RegisterResponseDto, UpdateProfileRequestDto, UpdateProfileResponseDto,
} from "@/types/api/auth";

export const authService = {
  // In production, login will set HttpOnly cookies on the browser automatically
  login: async (credentials: LoginRequestDto): Promise<LoginResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.auth.login(credentials));
  },

  signup: async (userData: RegisterRequestDto): Promise<RegisterResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.auth.register(userData));
  },

  // Refresh token flow - handles automatic access token retrieval in background via HttpOnly cookies
  refreshToken: async (): Promise<RefreshSessionResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.auth.refresh());
  },

  logout: async (): Promise<void> => {
    unwrapMockResponse(await mockApi.auth.logout());
  },

  getProfile: async (): Promise<GetProfileResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.auth.getProfile());
  },

  updateProfile: async (profile: UpdateProfileRequestDto): Promise<UpdateProfileResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.auth.updateProfile(profile));
  },
};

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      queryClient.setQueryData(["currentUser"], data.user);
    },
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.signup,
    onSuccess: (data) => {
      queryClient.setQueryData(["currentUser"], data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.setQueryData(["currentUser"], null);
      queryClient.invalidateQueries();
    },
  });
}

export function useProfile() {
  return useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: authService.getProfile,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation<Profile, Error, Profile>({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data);
    },
  });
}
