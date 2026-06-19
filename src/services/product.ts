import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockApi, unwrapMockResponse } from "@/api/mockApi";
import { adaptProduct, type Product } from "@/types/entities";
import type {
  CreateProductRequestDto, DeleteProductResponseDto, UpdateProductRequestDto,
} from "@/types/api/catalog";

// Fetcher methods that can easily transition to Axios client calls later
export const productService = {
  getProducts: async (): Promise<Product[]> => {
    const data = unwrapMockResponse(await mockApi.products.getAll());
    return data.map(adaptProduct);
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    const data = unwrapMockResponse(await mockApi.products.getFeatured());
    return data.map(adaptProduct);
  },

  getProduct: async (id: string): Promise<Product> => {
    const data = unwrapMockResponse(await mockApi.products.getById(id));
    return adaptProduct(data);
  },

  getRelatedProducts: async (id: string, limit = 4): Promise<Product[]> => {
    const data = unwrapMockResponse(await mockApi.products.getRelated(id, limit));
    return data.map(adaptProduct);
  },

  createProduct: async (product: CreateProductRequestDto): Promise<Product> => {
    const data = unwrapMockResponse(await mockApi.products.create(product));
    return adaptProduct(data);
  },

  updateProduct: async (id: string, product: UpdateProductRequestDto["data"]): Promise<Product> => {
    const data = unwrapMockResponse(await mockApi.products.update(id, product));
    return adaptProduct(data);
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
  return useMutation<Product, Error, CreateProductRequestDto>({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation<Product, Error, { id: string; data: UpdateProductRequestDto["data"] }>({
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
