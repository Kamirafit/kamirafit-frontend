import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Order } from "@/types/entities";
import type { CreateOrderRequestDto, CreateOrderResponseDto, GetOrdersResponseDto } from "@/types/api/commerce";
import { MOCK_ORDERS } from "@/features/account/data/mockAccount";

export const orderService = {
  getOrders: async (): Promise<GetOrdersResponseDto["data"]> => {
    // In future:
    // const res = await apiClient.get<ApiResponse<Order[]>>("/orders");
    // return res.data;
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_ORDERS;
  },

  createOrder: async (orderData: CreateOrderRequestDto): Promise<CreateOrderResponseDto["data"]> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newOrder: Order = {
      ...orderData,
      id: `ORD-KF-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString(),
      status: "Pending",
    };
    return newOrder;
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
