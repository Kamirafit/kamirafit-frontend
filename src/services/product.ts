import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockApi, unwrapMockResponse } from "@/api/mockApi";
import type { Product } from "@/types/entities";
import type {
  CreateProductRequestDto, CreateProductResponseDto, DeleteProductResponseDto,
  GetProductResponseDto, GetProductsResponseDto, GetRelatedProductsResponseDto,
  UpdateProductRequestDto, UpdateProductResponseDto,
} from "@/types/api/catalog";

// Fetcher methods that can easily transition to Axios client calls later
export const productService = {
  getProducts: async (): Promise<GetProductsResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.products.getAll());
  },

  getFeaturedProducts: async (): Promise<GetProductsResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.products.getFeatured());
  },

  getProduct: async (id: string): Promise<GetProductResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.products.getById(id));
  },

  getRelatedProducts: async (id: string, limit = 4): Promise<GetRelatedProductsResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.products.getRelated(id, limit));
  },

  createProduct: async (product: CreateProductRequestDto): Promise<CreateProductResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.products.create(product));
  },

  updateProduct: async (id: string, product: UpdateProductRequestDto["data"]): Promise<UpdateProductResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.products.update(id, product));
  },

  deleteProduct: async (id: string): Promise<DeleteProductResponseDto["data"]["id"]> => {
    return unwrapMockResponse(await mockApi.products.delete(id));
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
