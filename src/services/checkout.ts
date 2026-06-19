import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mockApi, unwrapMockResponse } from "@/api/mockApi";
import type { CheckoutRequestDto, CheckoutResponseDto } from "@/types/api/commerce";

export const checkoutService = {
  placeOrder: async (input: CheckoutRequestDto): Promise<CheckoutResponseDto["data"]> =>
    unwrapMockResponse(await mockApi.checkout.place(input)),
};

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkoutService.placeOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.setQueryData(["cart"], { items: [] });
    },
  });
}
