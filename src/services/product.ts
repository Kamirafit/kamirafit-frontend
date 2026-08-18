/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, unwrapApiResponse } from "@/api/client";
import { adaptProduct, type Product } from "@/types/entities";
import type { CreateProductRequestDto, DeleteProductResponseDto, UpdateProductRequestDto } from "@/types/api/catalog";

let productsPromise: Promise<Product[]> | null = null;
let featuredProductsPromise: Promise<Product[]> | null = null;

const list = (params?: Record<string, unknown>): Promise<Product[]> => {
  if (!params || Object.keys(params).length === 0) {
    if (productsPromise) return productsPromise;
    productsPromise = unwrapApiResponse<any>(apiClient.get("/products"))
      .then((r) => (Array.isArray(r) ? r : r.data || []).map(adaptProduct))
      .catch(() => [])
      .finally(() => {
        setTimeout(() => { productsPromise = null; }, 10000);
      });
    return productsPromise;
  }
  return unwrapApiResponse<any>(apiClient.get("/products", { params }))
    .then((r) => (Array.isArray(r) ? r : r.data || []).map(adaptProduct))
    .catch(() => []);
};

export const productService = {
  getProducts: () => list(),
  getFeaturedProducts: () => {
    if (featuredProductsPromise) return featuredProductsPromise;
    featuredProductsPromise = unwrapApiResponse<any[]>(apiClient.get("/products/featured"))
      .then((x) => (Array.isArray(x) ? x : []).map(adaptProduct))
      .catch(() => [])
      .finally(() => {
        setTimeout(() => { featuredProductsPromise = null; }, 10000);
      });
    return featuredProductsPromise;
  },
  getProduct: (id: string) => unwrapApiResponse<any>(apiClient.get("/products/" + id)).then(adaptProduct),
  getRelatedProducts: (id: string, limit = 4) => unwrapApiResponse<any[]>(apiClient.get("/products/" + id + "/related", { params: { limit } })).then((x) => (Array.isArray(x) ? x : []).map(adaptProduct)).catch(() => []),
  createProduct: (product: CreateProductRequestDto) => unwrapApiResponse<any>(apiClient.post("/products", product)).then(adaptProduct),
  updateProduct: (id: string, product: UpdateProductRequestDto["data"]) => unwrapApiResponse<any>(apiClient.put("/products/" + id, product)).then(adaptProduct),
  deleteProduct: (id: string): Promise<DeleteProductResponseDto["data"]["id"]> => unwrapApiResponse<any>(apiClient.delete("/products/" + id)).then((x) => x.id),
};

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: productService.getProducts,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useProduct(id: string) {
  return useQuery<Product>({
    queryKey: ["product", id],
    queryFn: () => productService.getProduct(id),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useCreateProduct() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => q.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequestDto["data"] }) =>
      productService.updateProduct(id, data),
    onSuccess: (d) => {
      q.invalidateQueries({ queryKey: ["products"] });
      q.invalidateQueries({ queryKey: ["product", d.id] });
    },
  });
}

export function useDeleteProduct() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: () => q.invalidateQueries({ queryKey: ["products"] }),
  });
}
