import { useQuery } from "@tanstack/react-query";
import { Order, User } from "@/types/api";
import { USERS, AdminUser } from "@/data/users";
import { MOCK_ORDERS } from "@/features/account/data/mockAccount";

export interface AdminStats {
  salesTotal: number;
  ordersCount: number;
  productsCount: number;
  usersCount: number;
}

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    // const res = await apiClient.get<ApiResponse<AdminStats>>("/admin/stats");
    // return res.data;
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      salesTotal: 125400,
      ordersCount: 45,
      productsCount: 18,
      usersCount: 124,
    };
  },

  getUsers: async (): Promise<User[]> => {
    // const res = await apiClient.get<ApiResponse<User[]>>("/admin/users");
    // return res.data;
    await new Promise((resolve) => setTimeout(resolve, 600));
    return (USERS as AdminUser[]).map((u) => ({
      email: u.email,
      firstName: u.name.split(" ")[0],
      lastName: u.name.split(" ")[1] || "",
      mobileNumber: u.phone,
    }));
  },

  getOrders: async (): Promise<Order[]> => {
    // const res = await apiClient.get<ApiResponse<Order[]>>("/admin/orders");
    // return res.data;
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_ORDERS as unknown as Order[];
  },
};

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: adminService.getStats,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminUsers() {
  return useQuery<User[]>({
    queryKey: ["admin", "users"],
    queryFn: adminService.getUsers,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAdminOrders() {
  return useQuery<Order[]>({
    queryKey: ["admin", "orders"],
    queryFn: adminService.getOrders,
    staleTime: 2 * 60 * 1000,
  });
}
