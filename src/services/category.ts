import { useQuery } from "@tanstack/react-query";
import { apiClient, unwrapApiResponse } from "@/api/client";
import type { Category } from "@/types/entities";
export const categoryService = { getCategories: () => unwrapApiResponse<Category[]>(apiClient.get("/products/categories")) };
export function useCategories(){return useQuery<Category[]>({queryKey:["categories"],queryFn:categoryService.getCategories,staleTime:1800000});}
