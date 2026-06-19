import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockApi, unwrapMockResponse } from "@/api/mockApi";
import type { GetWishlistResponseDto, ToggleWishlistRequestDto, ToggleWishlistResponseDto } from "@/types/api/commerce";

type WishlistProductIds = GetWishlistResponseDto["data"]["productIds"];

export const wishlistService = {
  getWishlist: async (): Promise<WishlistProductIds> => {
    return unwrapMockResponse(await mockApi.wishlist.getAll()).productIds;
  },

  updateWishlist: async (productIds: WishlistProductIds): Promise<WishlistProductIds> => {
    return unwrapMockResponse(await mockApi.wishlist.update(productIds)).productIds;
  },

  toggleWishlist: async (productId: ToggleWishlistRequestDto["productId"]): Promise<ToggleWishlistResponseDto["data"]["productIds"]> => {
    return unwrapMockResponse(await mockApi.wishlist.toggle(productId)).productIds;
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

export function useUpdateWishlist() {
  const queryClient = useQueryClient();
  return useMutation<string[], Error, string[]>({
    mutationFn: wishlistService.updateWishlist,
    onSuccess: (data) => queryClient.setQueryData(["wishlist"], data),
  });
}
