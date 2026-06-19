import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockApi, unwrapMockResponse } from "@/api/mockApi";
import type { CartItem } from "@/types/entities";

export const cartService = {
  getCart: async () => unwrapMockResponse(await mockApi.cart.get()),
  updateCart: async (items: CartItem[]) => unwrapMockResponse(await mockApi.cart.update(items)),
};

export function useCart() {
  return useQuery({ queryKey: ["cart"], queryFn: cartService.getCart });
}

export function useUpdateCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cartService.updateCart,
    onSuccess: (cart) => queryClient.setQueryData(["cart"], cart),
  });
}
