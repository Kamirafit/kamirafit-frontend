import { useQuery } from "@tanstack/react-query";
import type { Category } from "@/types/entities";
import type { GetCategoriesResponseDto } from "@/types/api/catalog";

export const categoryService = {
  getCategories: async (): Promise<GetCategoriesResponseDto["data"]> => {
    // In future:
    // const res = await apiClient.get<ApiResponse<Category[]>>("/categories");
    // return res.data;
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    // Mapping structure for storefront categories
    const categories: Category[] = [
      { id: "c-1", name: "Kurti", slug: "kurti", description: "Traditional elegance" },
      { id: "c-2", name: "Co-ords Sets", slug: "co-ords-sets", description: "Effortless matching ensembles" },
      { id: "c-3", name: "Dresses", slug: "dresses", description: "Chic modern silhouettes" },
      { id: "c-4", name: "T-Shirts", slug: "t-shirts", description: "Comfort essentials" },
      { id: "c-5", name: "Oversized T-Shirts", slug: "oversized-t-shirts", description: "Relaxed streetwear vibes" },
      { id: "c-6", name: "Hoodies", slug: "hoodies", description: "Cozy layering pieces" },
    ];
    return categories;
  },
};

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes stale time
  });
}
