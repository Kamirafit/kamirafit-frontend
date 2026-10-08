import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, unwrapApiResponse } from "@/api/client";
import { adaptProduct, type Product } from "@/types/entities";
import type { CreateProductRequestDto, DeleteProductResponseDto, UpdateProductRequestDto } from "@/types/api/catalog";
import { COLOR_SWATCH } from "@/features/product/types";

export interface ColorItem {
  name: string;
  hex: string;
}

let productsPromise: Promise<Product[]> | null = null;
let featuredProductsPromise: Promise<Product[]> | null = null;

const list = (params?: Record<string, unknown>): Promise<Product[]> => {
  if (!params || Object.keys(params).length === 0) {
    if (productsPromise) return productsPromise;
    productsPromise = unwrapApiResponse<unknown>(apiClient.get("/products"))
      .then((r) => {
        const items = Array.isArray(r) ? r : (r && typeof r === "object" && "data" in r && Array.isArray((r as { data: unknown[] }).data) ? (r as { data: unknown[] }).data : []);
        return items.map(adaptProduct);
      })
      .catch((err) => {
        productsPromise = null;
        throw err;
      })
      .finally(() => {
        setTimeout(() => {
          productsPromise = null;
        }, 10000);
      });
    return productsPromise;
  }

  return unwrapApiResponse<unknown>(apiClient.get("/products", { params }))
    .then((r) => {
      const items = Array.isArray(r) ? r : (r && typeof r === "object" && "data" in r && Array.isArray((r as { data: unknown[] }).data) ? (r as { data: unknown[] }).data : []);
      return items.map(adaptProduct);
    });
};

export interface PaginatedProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const productService = {
  getProducts: () => list(),
  getProductsPage: async (
    params: { page?: number; limit?: number; [key: string]: unknown } = {}
  ): Promise<PaginatedProductsResponse> => {
    const res = await apiClient.get("/products", { params });
    const body = res.data;
    const items = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
    const total = Number(body?.total ?? items.length);
    const page = Number(body?.page ?? params.page ?? 1);
    const limit = Number(body?.limit ?? params.limit ?? 20);
    const pages = Number(body?.pages ?? (limit > 0 ? Math.ceil(total / limit) : 1));

    return {
      products: items.map(adaptProduct),
      total,
      page,
      limit,
      pages,
    };
  },
  crawlAllProducts: async function* (batchSize = 100): AsyncGenerator<Product[]> {
    const safeLimit = Math.min(100, Math.max(1, batchSize));
    let currentPage = 1;
    let totalPages = 1;

    while (currentPage <= totalPages) {
      const result = await productService.getProductsPage({
        page: currentPage,
        limit: safeLimit,
      });
      if (!result.products || result.products.length === 0) {
        break;
      }
      yield result.products;
      totalPages = result.pages;
      currentPage += 1;
    }
  },
  getFeaturedProducts: (limit: number = 5) => {
    return unwrapApiResponse<unknown[]>(apiClient.get("/products/featured", { params: { limit } }))
      .then((x) => {
        const items = Array.isArray(x) ? x : [];
        return items.map(adaptProduct);
      });
  },
  getProduct: (id: string) =>
    unwrapApiResponse<unknown>(apiClient.get("/products/" + id))
      .then(adaptProduct)
      .catch((err) => {
        throw err instanceof Error ? err : new Error("Product not found");
      }),
  getRelatedProducts: (id: string, limit = 4) =>
    unwrapApiResponse<unknown[]>(apiClient.get("/products/" + id + "/related", { params: { limit } }))
      .then((x) => {
        const items = Array.isArray(x) ? x : [];
        return items.map(adaptProduct);
      })
      .catch(() => []),
  createProduct: (product: CreateProductRequestDto) =>
    unwrapApiResponse<unknown>(apiClient.post("/products", product)).then(adaptProduct),
  updateProduct: (id: string, product: UpdateProductRequestDto["data"]) =>
    unwrapApiResponse<unknown>(apiClient.put("/products/" + id, product)).then(adaptProduct),
  deleteProduct: (id: string): Promise<DeleteProductResponseDto["data"]["id"]> =>
    unwrapApiResponse<{ id: string }>(apiClient.delete("/products/" + id)).then((x) => x.id),
  getColors: (): Promise<ColorItem[]> =>
    unwrapApiResponse<unknown>(apiClient.get("/products/colors"))
      .then((r) => {
        const items = Array.isArray(r) ? r : (r && typeof r === "object" && "data" in r && Array.isArray((r as { data: unknown[] }).data) ? (r as { data: unknown[] }).data : []);
        return items
          .map((item: unknown) => {
            const row = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
            return {
              name: String(row.name || row.value || "").trim(),
              hex: String(row.hex || row.slug || "").trim(),
            };
          })
          .filter((item: ColorItem) => Boolean(item.name));
      })
      .catch(() => []),
  createColor: (color: { name: string; hex: string }): Promise<ColorItem> =>
    unwrapApiResponse<Record<string, unknown>>(apiClient.post("/admin/colors", color)).then((r) => {
      const item = (r?.data || r || {}) as Record<string, unknown>;
      return {
        name: String(item.name || item.value || color.name).trim(),
        hex: String(item.hex || item.slug || color.hex).trim(),
      };
    }),
  deleteColor: (name: string): Promise<{ name: string }> =>
    unwrapApiResponse<{ name?: string }>(
      apiClient.delete(`/admin/colors/${encodeURIComponent(name)}`)
    ).then(() => ({ name })),
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

export function useColors() {
  return useQuery<ColorItem[]>({
    queryKey: ["colors"],
    queryFn: productService.getColors,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateColor() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: (color: { name: string; hex: string }) => productService.createColor(color),
    onSuccess: () => {
      q.invalidateQueries({ queryKey: ["colors"] });
    },
  });
}

export function useDeleteColor() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => productService.deleteColor(name),
    onSuccess: () => {
      q.invalidateQueries({ queryKey: ["colors"] });
    },
  });
}

export function useColorSwatchMap(): Record<string, string> {
  const { data: colors } = useColors();
  return useMemo(() => {
    const map: Record<string, string> = { ...COLOR_SWATCH };
    if (colors && Array.isArray(colors)) {
      colors.forEach((c) => {
        if (c.name && c.hex) {
          map[c.name] = c.hex;
        }
      });
    }
    return map;
  }, [colors]);
}

