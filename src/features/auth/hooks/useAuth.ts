import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { loginSuccess, logoutSuccess } from "@/features/auth/store/authSlice";
import { authService } from "@/features/auth/services/auth.service";
import { AuthStorage } from "@/features/auth/services/authStorage";
import type { LoginRequestDto, RegisterRequestDto } from "@/features/auth/types";
import type { Profile } from "@/types/entities";

export function useLoginCustomer() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async ({ email, password }: LoginRequestDto) => {
      return await authService.loginCustomer(email, password || "");
    },
    onSuccess: (data) => {
      const authData = { isAuthenticated: true, role: data.role, user: data.user, accessToken: data.accessToken };
      AuthStorage.setCustomerAuth(authData);
      dispatch(loginSuccess(data));
      queryClient.setQueryData(["currentUser"], data.user);
    },
  });
}

export function useSignupCustomer() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (data: RegisterRequestDto) => {
      return await authService.signupCustomer(data);
    },
    onSuccess: (data) => {
      const authData = { isAuthenticated: true, role: data.role, user: data.user, accessToken: data.accessToken };
      AuthStorage.setCustomerAuth(authData);
      dispatch(loginSuccess(data));
      queryClient.setQueryData(["currentUser"], data.user);
    },
  });
}

export function useLoginAdmin() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password?: string }) => {
      return await authService.loginAdmin(email, password || "");
    },
    onSuccess: (data) => {
      const authData = { isAuthenticated: true, role: data.role, user: data.user, accessToken: data.accessToken };
      AuthStorage.setAdminAuth(authData);
      dispatch(loginSuccess(data));
      queryClient.setQueryData(["currentUser"], data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async () => {
      await authService.logout();
    },
    onSuccess: () => {
      queryClient.cancelQueries();
      dispatch(logoutSuccess());
      queryClient.clear();
    },
  });
}

export function useLogoutAdmin() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async () => {
      await authService.logoutAdmin();
    },
    onSuccess: () => {
      queryClient.cancelQueries();
      dispatch(logoutSuccess());
      queryClient.clear();
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
