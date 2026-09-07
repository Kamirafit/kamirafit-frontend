import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, unwrapApiResponse } from "@/api/client";
import { useAppDispatch, useAppSelector } from "@/features/product/hooks/redux";
import { replaceWishlist } from "@/features/product/store/wishlistSlice";

export const wishlistService = {
  getWishlist: () =>
    unwrapApiResponse<{ productIds: string[] }>(apiClient.get("/wishlist")).then(
      (x) => x.productIds
    ),
  updateWishlist: (productIds: string[]) =>
    unwrapApiResponse<{ productIds: string[] }>(
      apiClient.put("/wishlist", { productIds })
    ).then((x) => x.productIds),
  toggleWishlist: (productId: string) =>
    unwrapApiResponse<{ productIds: string[] }>(
      apiClient.post("/wishlist/toggle", { productId })
    ).then((x) => x.productIds),
};

export function useWishlist(enabled = true) {
  return useQuery<string[]>({
    queryKey: ["wishlist"],
    queryFn: wishlistService.getWishlist,
    staleTime: 300000,
    enabled: enabled && typeof window !== "undefined",
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation<string[], Error, string, { previousWishlist: string[] }>({
    mutationFn: (productId: string) => wishlistService.toggleWishlist(productId),
    onMutate: async (productId: string) => {
      // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });

      // 2. Snapshot current wishlist from React Query cache
      const previousWishlist =
        queryClient.getQueryData<string[]>(["wishlist"]) ?? [];

      // 3. Optimistically compute the next wishlist
      const isAlreadySaved = previousWishlist.includes(productId);
      const nextWishlist = isAlreadySaved
        ? previousWishlist.filter((id) => id !== productId)
        : [...previousWishlist, productId];

      // 4. Optimistically update React Query cache immediately
      queryClient.setQueryData<string[]>(["wishlist"], nextWishlist);

      // 5. Optimistically update Redux store immediately
      dispatch(replaceWishlist(nextWishlist));

      return { previousWishlist };
    },
    onError: (_err, _productId, context) => {
      // Rollback both React Query cache and Redux store to the snapshot on error
      if (context?.previousWishlist) {
        queryClient.setQueryData<string[]>(["wishlist"], context.previousWishlist);
        dispatch(replaceWishlist(context.previousWishlist));
      }
    },
    onSuccess: (data) => {
      if (Array.isArray(data)) {
        queryClient.setQueryData<string[]>(["wishlist"], data);
        dispatch(replaceWishlist(data));
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
}

export function useUpdateWishlist() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: wishlistService.updateWishlist,
    onSuccess: (d) => {
      queryClient.setQueryData(["wishlist"], d);
      dispatch(replaceWishlist(d));
    },
  });
}

export function useOptimisticWishlist() {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const wishlistIds = useAppSelector((s) => s.wishlist.ids);
  const toggleMutation = useToggleWishlist();

  const toggle = useCallback(
    (productId: string) => {
      if (!isAuthenticated) {
        const current = pathname || "/shop";
        router.push(`/login?redirect=${encodeURIComponent(current)}`);
        return;
      }
      toggleMutation.mutate(productId);
    },
    [isAuthenticated, pathname, router, toggleMutation]
  );

  const isSaved = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  return {
    wishlistIds,
    isSaved,
    toggle,
    isPending: toggleMutation.isPending,
  };
}
