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

export const categoryService = {
  getCategories: async (): Promise<BackendCategory[]> => {
    try {
      return await unwrapApiResponse<BackendCategory[]>(apiClient.get("/categories"));
    } catch {
      try {
        return await unwrapApiResponse<BackendCategory[]>(apiClient.get("/products/categories"));
      } catch {
        return [];
      }
    }
  },
};

export function useCategories() {
  return useQuery<BackendCategory[]>({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
    staleTime: 5 * 60 * 1000,
  });
}
