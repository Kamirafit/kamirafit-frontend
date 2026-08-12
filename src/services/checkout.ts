import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, unwrapApiResponse } from "@/api/client";
import type { CheckoutRequestDto, CheckoutResponseDto } from "@/types/api/commerce";
export const checkoutService = {
 placeOrder:(input:CheckoutRequestDto)=>unwrapApiResponse<CheckoutResponseDto["data"]>(apiClient.post("/orders/checkout/place", input)),
};
export function useCheckout(){const q=useQueryClient();return useMutation({mutationFn:checkoutService.placeOrder,onSuccess:()=>{q.invalidateQueries({queryKey:["orders"]});q.invalidateQueries({queryKey:["cart"]});}});}
