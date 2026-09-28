import { useCallback, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { apiClient, unwrapApiResponse } from "@/api/client";
import { useAppDispatch, useAppSelector } from "@/features/product/hooks/redux";
import type { AppDispatch } from "@/features/product/store";
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

// Global queue to ensure sequential execution of wishlist toggles across rapid clicks
const toggleQueue: string[] = [];
let isProcessingQueue = false;
let pendingListeners: Array<() => void> = [];

function notifyListeners() {
  pendingListeners.forEach((fn) => fn());
}

async function processQueue(queryClient: QueryClient, dispatch: AppDispatch) {
  if (isProcessingQueue) return;
  isProcessingQueue = true;
  notifyListeners();

  let lastServerWishlist: string[] | null = null;
  let hasError = false;

  while (toggleQueue.length > 0) {
    const productId = toggleQueue.shift()!;
    try {
      lastServerWishlist = await wishlistService.toggleWishlist(productId);
    } catch (err) {
      console.error("Failed to toggle wishlist item on server:", err);
      hasError = true;
    }
  }

  isProcessingQueue = false;
  notifyListeners();

  // If new items were queued in the meantime, continue processing
  if (toggleQueue.length > 0) {
    processQueue(queryClient, dispatch);
    return;
  }

  // Once the queue is completely drained:
  if (hasError) {
    // If an error occurred during the rapid clicks, fetch the actual database state to restore accuracy
    try {
      const serverWishlist = await wishlistService.getWishlist();
      queryClient.setQueryData<string[]>(["wishlist"], serverWishlist);
      dispatch(replaceWishlist(serverWishlist));
    } catch {
      // ignore
    }
  } else if (lastServerWishlist && Array.isArray(lastServerWishlist)) {
    // Authoritatively sync final result
    queryClient.setQueryData<string[]>(["wishlist"], lastServerWishlist);
    dispatch(replaceWishlist(lastServerWishlist));
  }
}

export function useOptimisticWishlist() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const wishlistIds = useAppSelector((s) => s.wishlist.ids);
  const [isPending, setIsPending] = useState(isProcessingQueue || toggleQueue.length > 0);

  useEffect(() => {
    const updatePending = () => {
      setIsPending(isProcessingQueue || toggleQueue.length > 0);
    };
    pendingListeners.push(updatePending);
    return () => {
      pendingListeners = pendingListeners.filter((fn) => fn !== updatePending);
    };
  }, []);

  const toggle = useCallback(
    (productId: string) => {
      if (!isAuthenticated) {
        const current = pathname || "/shop";
        router.push(`/login?redirect=${encodeURIComponent(current)}`);
        return;
      }

      // 1. Immediately compute next optimistic wishlist from synchronous React Query cache (or Redux state)
      const currentCached = queryClient.getQueryData<string[]>(["wishlist"]) ?? wishlistIds;
      const isAlreadySaved = currentCached.includes(productId);
      const nextWishlist = isAlreadySaved
        ? currentCached.filter((id) => id !== productId)
        : [...currentCached, productId];

      // 2. Synchronously update Redux store & React Query cache
      queryClient.setQueryData<string[]>(["wishlist"], nextWishlist);
      dispatch(replaceWishlist(nextWishlist));

      // 3. Queue the network mutation so rapid clicks are processed sequentially without out-of-order responses
      toggleQueue.push(productId);
      processQueue(queryClient, dispatch);
    },
    [isAuthenticated, pathname, router, wishlistIds, dispatch, queryClient]
  );

  const isSaved = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  return {
    wishlistIds,
    isSaved,
    toggle,
    isPending,
  };
}

export function useToggleWishlist() {
  const { toggle, isPending } = useOptimisticWishlist();
  return {
    mutate: toggle,
    isPending,
  };
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
