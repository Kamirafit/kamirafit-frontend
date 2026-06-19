import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockApi, unwrapMockResponse } from "@/api/mockApi";
import type { Order } from "@/types/entities";
import type { CreateOrderRequestDto, CreateOrderResponseDto, GetOrdersResponseDto } from "@/types/api/commerce";

export const orderService = {
  getOrders: async (): Promise<GetOrdersResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.orders.getAll());
  },

  createOrder: async (orderData: CreateOrderRequestDto): Promise<CreateOrderResponseDto["data"]> => {
    return unwrapMockResponse(await mockApi.orders.create(orderData));
  },
};

export function useOrders() {
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: orderService.getOrders,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation<Order, Error, Omit<Order, "id" | "date" | "status">>({
    mutationFn: orderService.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
