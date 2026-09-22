/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, unwrapApiResponse } from "@/api/client";
import { adaptProduct, type Product } from "@/types/entities";
import { PRODUCTS, getProductById, getRelatedProducts as getFallbackRelated } from "@/data/products";
import type { CreateProductRequestDto, DeleteProductResponseDto, UpdateProductRequestDto } from "@/types/api/catalog";
import { COLOR_SWATCH } from "@/features/product/types";

export interface ColorItem {
  name: string;
  hex: string;
}

let productsPromise: Promise<Product[]> | null = null;
let featuredProductsPromise: Promise<Product[]> | null = null;

const isMockEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_USE_MOCK_API === "true" && process.env.NODE_ENV !== "production";
};

const fallbackProducts = () => PRODUCTS.map(adaptProduct);

const list = (params?: Record<string, unknown>): Promise<Product[]> => {
  if (!params || Object.keys(params).length === 0) {
    if (productsPromise) return productsPromise;
    productsPromise = unwrapApiResponse<any>(apiClient.get("/products"))
      .then((r) => {
        const items = Array.isArray(r) ? r : r?.data || [];
        return items.map(adaptProduct);
      })
      .catch((err) => {
        console.warn("API unavailable; using fallback products:", err?.message || err);
        return fallbackProducts();
      })
      .finally(() => {
        setTimeout(() => {
          productsPromise = null;
        }, 10000);
      });
    return productsPromise;
  }

  return unwrapApiResponse<any>(apiClient.get("/products", { params }))
    .then((r) => {
      const items = Array.isArray(r) ? r : r?.data || [];
      return items.map(adaptProduct);
    })
    .catch((err) => {
      console.warn("API unavailable; using fallback products:", err?.message || err);
      return fallbackProducts();
    });
};

export const productService = {
  getProducts: () => list(),
  getFeaturedProducts: () => {
    if (featuredProductsPromise) return featuredProductsPromise;
    featuredProductsPromise = unwrapApiResponse<any[]>(apiClient.get("/products/featured"))
      .then((x) => {
        const items = Array.isArray(x) ? x : [];
        return items.map(adaptProduct);
      })
      .catch((err) => {
        if (isMockEnabled()) {
          console.warn("API unavailable; using dev mock fallback featured products:", err);
          return fallbackProducts().slice(0, 4);
        }
        return [];
      })
      .finally(() => {
        setTimeout(() => {
          featuredProductsPromise = null;
        }, 10000);
      });
    return featuredProductsPromise;
  },
  getProduct: (id: string) =>
    unwrapApiResponse<any>(apiClient.get("/products/" + id))
      .then(adaptProduct)
      .catch((err) => {
        if (isMockEnabled()) {
          const local = getProductById(id);
          if (local) return adaptProduct(local);
        }
        throw err instanceof Error ? err : new Error("Product not found");
      }),
  getRelatedProducts: (id: string, limit = 4) =>
    unwrapApiResponse<any[]>(apiClient.get("/products/" + id + "/related", { params: { limit } }))
      .then((x) => {
        const items = Array.isArray(x) ? x : [];
        return items.map(adaptProduct);
      })
      .catch(() => {
        if (isMockEnabled()) {
          return getFallbackRelated(id, limit).map(adaptProduct);
        }
        return [];
      }),
  createProduct: (product: CreateProductRequestDto) =>
    unwrapApiResponse<any>(apiClient.post("/products", product)).then(adaptProduct),
  updateProduct: (id: string, product: UpdateProductRequestDto["data"]) =>
    unwrapApiResponse<any>(apiClient.put("/products/" + id, product)).then(adaptProduct),
  deleteProduct: (id: string): Promise<DeleteProductResponseDto["data"]["id"]> =>
    unwrapApiResponse<any>(apiClient.delete("/products/" + id)).then((x) => x.id),
  getColors: (): Promise<ColorItem[]> =>
    unwrapApiResponse<any>(apiClient.get("/products/colors"))
      .then((r) => {
        const items = Array.isArray(r) ? r : r?.data || [];
        return items
          .map((item: any) => ({
            name: String(item.name || item.value || "").trim(),
            hex: String(item.hex || item.slug || "").trim(),
          }))
          .filter((item: ColorItem) => Boolean(item.name));
      })
      .catch((err) => {
        console.warn("API unavailable; using fallback colors:", err?.message || err);
        return Object.entries(COLOR_SWATCH).map(([name, hex]) => ({ name, hex }));
      }),
  createColor: (color: { name: string; hex: string }): Promise<ColorItem> =>
    unwrapApiResponse<any>(apiClient.post("/products/colors", color)).then((r) => {
      const item = r?.data || r;
      return {
        name: String(item.name || item.value || color.name).trim(),
        hex: String(item.hex || item.slug || color.hex).trim(),
      };
    }),
  deleteColor: (name: string): Promise<{ name: string }> =>
    unwrapApiResponse<any>(
      apiClient.delete(`/products/colors/${encodeURIComponent(name)}`)
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

