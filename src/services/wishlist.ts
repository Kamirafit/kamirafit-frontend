import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const wishlistService = {
  getWishlist: async (): Promise<string[]> => {
    // In future:
    // const res = await apiClient.get<ApiResponse<string[]>>("/wishlist");
    // return res.data;
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [];
  },

  toggleWishlist: async (productId: string): Promise<string[]> => {
    // const res = await apiClient.post<ApiResponse<string[]>>(`/wishlist/toggle`, { productId });
    // return res.data;
    await new Promise((resolve) => setTimeout(resolve, 400));
    return [productId];
  },
};

export function useWishlist() {
  return useQuery<string[]>({
    queryKey: ["wishlist"],
    queryFn: wishlistService.getWishlist,
    staleTime: 5 * 60 * 1000,
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();
  return useMutation<string[], Error, string>({
    mutationFn: wishlistService.toggleWishlist,
    onSuccess: (data) => {
      queryClient.setQueryData(["wishlist"], data);
    },
  });
}
