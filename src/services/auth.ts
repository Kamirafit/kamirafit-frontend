import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@/types/api";
import { Profile } from "@/features/account/types";

export const authService = {
  // In production, login will set HttpOnly cookies on the browser automatically
  login: async (credentials: { email: string; token?: string }): Promise<{ user: User }> => {
    // const res = await apiClient.post<ApiResponse<{ user: User }>>("/auth/login", credentials);
    // return res.data;
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      user: {
        email: credentials.email,
        firstName: "Kamira",
        lastName: "User",
      },
    };
  },

  signup: async (userData: Omit<User, "email"> & { email: string }): Promise<{ user: User }> => {
    // const res = await apiClient.post<ApiResponse<{ user: User }>>("/auth/signup", userData);
    // return res.data;
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      user: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      },
    };
  },

  // Refresh token flow - handles automatic access token retrieval in background via HttpOnly cookies
  refreshToken: async (): Promise<{ accessToken: string }> => {
    // const res = await apiClient.post<ApiResponse<{ accessToken: string }>>("/auth/refresh");
    // return res.data;
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { accessToken: "mock-new-access-token" };
  },

  logout: async (): Promise<void> => {
    // await apiClient.post("/auth/logout");
    await new Promise((resolve) => setTimeout(resolve, 400));
  },

  getProfile: async (): Promise<Profile> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      firstName: "Kamira",
      lastName: "User",
      email: "user@kamirafit.com",
      mobileNumber: "9876543210",
      gender: "Female",
    };
  },

  updateProfile: async (profile: Profile): Promise<Profile> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return profile;
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
