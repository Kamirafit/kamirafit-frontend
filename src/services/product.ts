import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product } from "@/types/api";
import { PRODUCTS, getProductById } from "@/features/product/data/products";

// Fetcher methods that can easily transition to Axios client calls later
export const productService = {
  getProducts: async (): Promise<Product[]> => {
    // In future:
    // const res = await apiClient.get<ApiResponse<Product[]>>("/products");
    // return res.data;
    await new Promise((resolve) => setTimeout(resolve, 500));
    return PRODUCTS as unknown as Product[];
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return (PRODUCTS as unknown as Product[]).filter((p) => p.status === "active").slice(0, 4);
  },

  getProduct: async (id: string): Promise<Product> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const product = getProductById(id);
    if (!product) {
      throw new Error("Product not found");
    }
    return product as unknown as Product;
  },

  createProduct: async (product: Omit<Product, "id" | "createdAt" | "rating" | "reviews" | "popularity">): Promise<Product> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const newProduct: Product = {
      ...product,
      id: `p-${Math.random().toString(36).substr(2, 9)}`,
      rating: 5,
      reviews: [],
      popularity: 0,
      createdAt: new Date().toISOString(),
    };
    return newProduct;
  },

  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { id, ...product } as Product;
  },

  deleteProduct: async (id: string): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return id;
  },
};

// React Query Hooks
export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: productService.getProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
  });
}

export function useProduct(id: string) {
  return useQuery<Product>({
    queryKey: ["product", id],
    queryFn: () => productService.getProduct(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation<Product, Error, Omit<Product, "id" | "createdAt" | "rating" | "reviews" | "popularity">>({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation<Product, Error, { id: string; data: Partial<Product> }>({
    mutationFn: ({ id, data }) => productService.updateProduct(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", data.id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation<string, Error, string>({
    mutationFn: productService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
