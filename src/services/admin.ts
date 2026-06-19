import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CATEGORIES, AdminCategory } from "@/data/categories";
import { PRODUCTS, Product } from "@/data/products";
import { USERS, AdminUser } from "@/data/users";
import { ORDERS, Order } from "@/data/orders";
import type {
  AdminStatsDto, CreateAdminCategoryRequestDto, CreateAdminCategoryResponseDto,
  CreateAdminProductRequestDto, CreateAdminProductResponseDto, GetAdminCategoriesResponseDto,
  GetAdminOrdersResponseDto, GetAdminProductsResponseDto, GetAdminStatsResponseDto,
  GetAdminUsersResponseDto, UpdateAdminCategoryRequestDto, UpdateAdminCategoryResponseDto,
  UpdateAdminOrderRequestDto, UpdateAdminOrderResponseDto, UpdateAdminProductRequestDto,
  UpdateAdminProductResponseDto, UpdateAdminUserRequestDto, UpdateAdminUserResponseDto,
} from "@/types/api/admin";

export type AdminStats = AdminStatsDto;

// Session-persistent local state for admin mutations
let localCategories = [...CATEGORIES];
let localProducts = [...PRODUCTS];
const localUsers = [...USERS];
let localOrders = [...ORDERS];

export const adminService = {
  getStats: async (): Promise<GetAdminStatsResponseDto["data"]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const salesTotal = localOrders
      .filter((o) => o.paymentStatus === "Paid")
      .reduce((sum, o) => sum + o.total, 0);
    return {
      salesTotal: salesTotal || 125400,
      ordersCount: localOrders.length,
      productsCount: localProducts.length,
      usersCount: localUsers.length,
    };
  },

  getCategories: async (): Promise<GetAdminCategoriesResponseDto["data"]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...localCategories];
  },

  createCategory: async (category: CreateAdminCategoryRequestDto): Promise<CreateAdminCategoryResponseDto["data"]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const newCategory: AdminCategory = {
      ...category,
      id: `c-${Date.now().toString(36)}`,
    };
    localCategories.push(newCategory);
    return newCategory;
  },

  updateCategory: async (id: string, patch: UpdateAdminCategoryRequestDto["data"]): Promise<UpdateAdminCategoryResponseDto["data"]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const idx = localCategories.findIndex((c) => c.id === id);
    if (idx !== -1) {
      localCategories[idx] = { ...localCategories[idx], ...patch };
      return localCategories[idx];
    }
    throw new Error("Category not found");
  },

  deleteCategory: async (id: string): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    localCategories = localCategories.filter((c) => c.id !== id);
    return id;
  },

  getProducts: async (): Promise<GetAdminProductsResponseDto["data"]> => {
    await new Promise((resolve) => setTimeout(resolve, 450));
    return [...localProducts];
  },

  createProduct: async (product: CreateAdminProductRequestDto): Promise<CreateAdminProductResponseDto["data"]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newProduct: Product = {
      ...product,
      id: `p-${Math.random().toString(36).substr(2, 9)}`,
      rating: 5,
      reviews: [],
      popularity: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    localProducts.push(newProduct);
    return newProduct;
  },

  updateProduct: async (id: string, patch: UpdateAdminProductRequestDto["data"]): Promise<UpdateAdminProductResponseDto["data"]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const idx = localProducts.findIndex((p) => p.id === id);
    if (idx !== -1) {
      localProducts[idx] = { ...localProducts[idx], ...patch };
      return localProducts[idx];
    }
    throw new Error("Product not found");
  },

  toggleProductStatus: async (id: string): Promise<Product> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const idx = localProducts.findIndex((p) => p.id === id);
    if (idx !== -1) {
      localProducts[idx] = {
        ...localProducts[idx],
        status: localProducts[idx].status === "active" ? "inactive" : "active",
      };
      return localProducts[idx];
    }
    throw new Error("Product not found");
  },

  deleteProduct: async (id: string): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    localProducts = localProducts.filter((p) => p.id !== id);
    return id;
  },

  getUsers: async (): Promise<GetAdminUsersResponseDto["data"]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return [...localUsers];
  },

  updateUser: async (id: string, patch: UpdateAdminUserRequestDto["data"]): Promise<UpdateAdminUserResponseDto["data"]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const idx = localUsers.findIndex((u) => u.id === id);
    if (idx !== -1) {
      localUsers[idx] = { ...localUsers[idx], ...patch };
      return localUsers[idx];
    }
    throw new Error("User not found");
  },

  getOrders: async (): Promise<GetAdminOrdersResponseDto["data"]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return [...localOrders];
  },

  updateOrder: async (id: string, patch: UpdateAdminOrderRequestDto["data"]): Promise<UpdateAdminOrderResponseDto["data"]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const idx = localOrders.findIndex((o) => o.id === id);
    if (idx !== -1) {
      localOrders[idx] = { ...localOrders[idx], ...patch };
      return localOrders[idx];
    }
    throw new Error("Order not found");
  },

  deleteOrder: async (id: string): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    localOrders = localOrders.filter((o) => o.id !== id);
    return id;
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
