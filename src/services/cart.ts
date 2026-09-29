import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, unwrapApiResponse } from "@/api/client";
import type { Cart, CartItem } from "@/types/entities";

export const cartService = {
  getCart: () => unwrapApiResponse<Cart>(apiClient.get("/cart")),
  updateCart: (items: CartItem[]) => unwrapApiResponse<Cart>(apiClient.put("/cart", { items })),
};

export function useCart(enabled = true) {
  return useQuery({
    queryKey: ["cart"],
    queryFn: cartService.getCart,
    enabled: enabled && typeof window !== "undefined",
  });
}

export function useUpdateCart() {
  const q = useQueryClient();
  return useMutation({
    mutationFn: cartService.updateCart,
    onSuccess: (cart) => q.setQueryData(["cart"], cart),
  });
}
