import { useQuery } from "@tanstack/react-query";
import { mockApi, unwrapMockResponse } from "@/api/mockApi";
import type { Category } from "@/types/entities";
import type { GetCategoriesResponseDto } from "@/types/api/catalog";

export const categoryService = {
  getCategories: async (): Promise<GetCategoriesResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.categories.getAll());
  },
};

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes stale time
  });
}
