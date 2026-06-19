import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockApi, unwrapMockResponse } from "@/api/mockApi";
import type { AdminCategory, AdminOrder as Order, AdminUser, Product } from "@/types/entities";
import type {
  AdminStatsDto, CreateAdminCategoryRequestDto, CreateAdminCategoryResponseDto,
  CreateAdminProductRequestDto, CreateAdminProductResponseDto, GetAdminCategoriesResponseDto,
  GetAdminOrdersResponseDto, GetAdminProductsResponseDto, GetAdminStatsResponseDto,
  GetAdminUsersResponseDto, UpdateAdminCategoryRequestDto, UpdateAdminCategoryResponseDto,
  UpdateAdminOrderRequestDto, UpdateAdminOrderResponseDto, UpdateAdminProductRequestDto,
  UpdateAdminProductResponseDto, UpdateAdminUserRequestDto, UpdateAdminUserResponseDto,
} from "@/types/api/admin";

export type AdminStats = AdminStatsDto;

export const adminService = {
  getStats: async (): Promise<GetAdminStatsResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.admin.getStats());
  },

  getCategories: async (): Promise<GetAdminCategoriesResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.admin.categories.getAll());
  },

  createCategory: async (category: CreateAdminCategoryRequestDto): Promise<CreateAdminCategoryResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.admin.categories.create(category));
  },

  updateCategory: async (id: string, patch: UpdateAdminCategoryRequestDto["data"]): Promise<UpdateAdminCategoryResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.admin.categories.update(id, patch));
  },

  deleteCategory: async (id: string): Promise<string> => {
    return unwrapMockResponse(await mockApi.admin.categories.delete(id));
  },

  getProducts: async (): Promise<GetAdminProductsResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.admin.products.getAll());
  },

  createProduct: async (product: CreateAdminProductRequestDto): Promise<CreateAdminProductResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.admin.products.create(product));
  },

  updateProduct: async (id: string, patch: UpdateAdminProductRequestDto["data"]): Promise<UpdateAdminProductResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.admin.products.update(id, patch));
  },

  toggleProductStatus: async (id: string): Promise<Product> => {
    return unwrapMockResponse(await mockApi.admin.products.toggleStatus(id));
  },

  deleteProduct: async (id: string): Promise<string> => {
    return unwrapMockResponse(await mockApi.admin.products.delete(id));
  },

  getUsers: async (): Promise<GetAdminUsersResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.admin.users.getAll());
  },

  updateUser: async (id: string, patch: UpdateAdminUserRequestDto["data"]): Promise<UpdateAdminUserResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.admin.users.update(id, patch));
  },

  getOrders: async (): Promise<GetAdminOrdersResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.admin.orders.getAll());
  },

  updateOrder: async (id: string, patch: UpdateAdminOrderRequestDto["data"]): Promise<UpdateAdminOrderResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.admin.orders.update(id, patch));
  },

  deleteOrder: async (id: string): Promise<string> => {
    return unwrapMockResponse(await mockApi.admin.orders.delete(id));
  },
};

// React Query Hooks

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: adminService.getStats,
    staleTime: 1 * 60 * 1000,
  });
}

export function useAdminCategories() {
  return useQuery<AdminCategory[]>({
    queryKey: ["admin", "categories"],
    queryFn: adminService.getCategories,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAdminCategory() {
  const queryClient = useQueryClient();
  return useMutation<AdminCategory, Error, Omit<AdminCategory, "id">>({
    mutationFn: adminService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });
}

export function useUpdateAdminCategory() {
  const queryClient = useQueryClient();
  return useMutation<AdminCategory, Error, { id: string; patch: Partial<Omit<AdminCategory, "id">> }>({
    mutationFn: ({ id, patch }) => adminService.updateCategory(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });
}

export function useDeleteAdminCategory() {
  const queryClient = useQueryClient();
  return useMutation<string, Error, string>({
    mutationFn: adminService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });
}

export function useAdminProducts() {
  return useQuery<Product[]>({
    queryKey: ["admin", "products"],
    queryFn: adminService.getProducts,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAdminProduct() {
  const queryClient = useQueryClient();
  return useMutation<Product, Error, Omit<Product, "id" | "createdAt" | "rating" | "reviews" | "popularity">>({
    mutationFn: adminService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useUpdateAdminProduct() {
  const queryClient = useQueryClient();
  return useMutation<Product, Error, { id: string; patch: Partial<Product> }>({
    mutationFn: ({ id, patch }) => adminService.updateProduct(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useToggleAdminProductStatus() {
  const queryClient = useQueryClient();
  return useMutation<Product, Error, string>({
    mutationFn: adminService.toggleProductStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useDeleteAdminProduct() {
  const queryClient = useQueryClient();
  return useMutation<string, Error, string>({
    mutationFn: adminService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useAdminUsers() {
  return useQuery<AdminUser[]>({
    queryKey: ["admin", "users"],
    queryFn: adminService.getUsers,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation<AdminUser, Error, { id: string; patch: Partial<Omit<AdminUser, "id">> }>({
    mutationFn: ({ id, patch }) => adminService.updateUser(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useAdminOrders() {
  return useQuery<Order[]>({
    queryKey: ["admin", "orders"],
    queryFn: adminService.getOrders,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateAdminOrder() {
  const queryClient = useQueryClient();
  return useMutation<Order, Error, { id: string; patch: Partial<Order> }>({
    mutationFn: ({ id, patch }) => adminService.updateOrder(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
}

export function useDeleteAdminOrder() {
  const queryClient = useQueryClient();
  return useMutation<string, Error, string>({
    mutationFn: adminService.deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
}
