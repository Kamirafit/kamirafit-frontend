import { useQuery } from "@tanstack/react-query";
import { apiClient, unwrapApiResponse } from "@/api/client";

export interface SubCategoryItem {
  id?: string;
  name: string;
  slug?: string;
  title?: string;
}

export interface BackendCategory {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  subcategories?: (string | SubCategoryItem)[];
}

let categoryPromise: Promise<BackendCategory[]> | null = null;
let categoryCache: { data: BackendCategory[]; timestamp: number } | null = null;
const CACHE_TTL = 60000; // 1 minute in-memory cache

export const categoryService = {
  getCategories: async (): Promise<BackendCategory[]> => {
    const now = Date.now();
    if (categoryCache && now - categoryCache.timestamp < CACHE_TTL) {
      return categoryCache.data;
    }

    if (categoryPromise) {
      return categoryPromise;
    }

    categoryPromise = (async () => {
      try {
        const data = await unwrapApiResponse<BackendCategory[]>(apiClient.get("/categories"));
        categoryCache = { data: Array.isArray(data) ? data : [], timestamp: Date.now() };
        return categoryCache.data;
      } catch (e: unknown) {
        // If /categories fails, try /products/categories once
        try {
          const fallbackData = await unwrapApiResponse<BackendCategory[]>(apiClient.get("/products/categories"));
          categoryCache = { data: Array.isArray(fallbackData) ? fallbackData : [], timestamp: Date.now() };
          return categoryCache.data;
        } catch {
          // If both fail or rate limited, return cached data if available or empty array
          return categoryCache?.data || [];
        }
      } finally {
        categoryPromise = null;
      }
    })();

    return categoryPromise;
  },
};

export function useCategories() {
  return useQuery<BackendCategory[]>({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
